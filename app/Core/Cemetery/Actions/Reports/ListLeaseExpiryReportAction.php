<?php

namespace App\Core\Cemetery\Actions\Reports;

use App\Core\Cemetery\Dto\Reports\LeaseReportFiltersDto;
use App\Core\Cemetery\Enums\PlotLeaseStatus;
use App\Core\Cemetery\Models\Plot;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ListLeaseExpiryReportAction
{
    public function execute(string $municipalId, LeaseReportFiltersDto $filters): LengthAwarePaginator
    {
        return $this->baseQuery($municipalId, $filters)
            ->paginate($filters->perPage)
            ->withQueryString()
            ->through(fn (Plot $plot) => $this->mapRow($plot, $filters));
    }

    public function rowsForExport(string $municipalId, LeaseReportFiltersDto $filters): array
    {
        return $this->baseQuery($municipalId, $filters)
            ->get()
            ->map(fn (Plot $plot) => $this->mapRow($plot, $filters))
            ->values()
            ->all();
    }

    public function summary(string $municipalId, LeaseReportFiltersDto $filters): array
    {
        $rows = collect($this->rowsForExport($municipalId, $filters));

        return [
            'total' => $rows->count(),
            'expired' => $rows->where('lease_state', LeaseReportFiltersDto::STATE_EXPIRED)->count(),
            'expiring_soon' => $rows->where('lease_state', LeaseReportFiltersDto::STATE_EXPIRING_SOON)->count(),
            'active' => $rows->where('lease_state', LeaseReportFiltersDto::STATE_ACTIVE)->count(),
            'no_active_lease' => $rows->where('lease_state', LeaseReportFiltersDto::STATE_NO_ACTIVE_LEASE)->count(),
        ];
    }

    public function headings(): array
    {
        return [
            'Site',
            'Section',
            'Block',
            'Plot',
            'Lease State',
            'Leaseholder',
            'Contact',
            'Relationship',
            'Lease Start',
            'Lease End',
            'Days',
            'OR Number',
            'Amount Paid',
            'Status',
        ];
    }

    public function exportRows(string $municipalId, LeaseReportFiltersDto $filters): array
    {
        return collect($this->rowsForExport($municipalId, $filters))
            ->map(fn (array $row) => [
                $row['site_name'],
                $row['section_name'],
                $row['block_name'],
                $row['plot_label'],
                $row['lease_state_label'],
                $row['leaseholder_name'],
                $row['leaseholder_contact'],
                $row['leaseholder_relationship'],
                $row['lease_start'],
                $row['lease_end'],
                $row['days_label'],
                $row['or_number'],
                $row['amount_paid'],
                $row['status_label'],
            ])
            ->all();
    }

    private function baseQuery(string $municipalId, LeaseReportFiltersDto $filters): Builder
    {
        $query = Plot::query()
            ->with(['cemeterySite', 'block.section', 'activeLease'])
            ->withCount(['interments as active_interments_count' => fn (Builder $query) => $query->active()])
            ->where('municipal_id', $municipalId)
            ->when($filters->siteId, fn (Builder $query, string $siteId) => $query->where('cemetery_site_id', $siteId))
            ->when($filters->blockId, fn (Builder $query, string $blockId) => $query->where('block_id', $blockId))
            ->when($filters->sectionId, fn (Builder $query, string $sectionId) => $query
                ->whereHas('block', fn (Builder $blockQuery) => $blockQuery->where('section_id', $sectionId)));

        $this->applyLeaseState($query, $filters);

        return $query
            ->orderBy('cemetery_site_id')
            ->orderBy('name')
            ->orderBy('level')
            ->orderBy('row')
            ->orderBy('position');
    }

    private function applyLeaseState(Builder $query, LeaseReportFiltersDto $filters): void
    {
        $today = CarbonImmutable::today();
        $soon = $today->addDays($filters->expiringWithinDays);
        $hasDateFilter = filled($filters->leaseEndFrom) || filled($filters->leaseEndTo);

        if ($filters->leaseState === LeaseReportFiltersDto::STATE_NO_ACTIVE_LEASE) {
            $query
                ->whereDoesntHave('activeLease')
                ->whereHas('interments', fn (Builder $intermentQuery) => $intermentQuery->active());

            return;
        }

        if ($filters->leaseState === LeaseReportFiltersDto::STATE_ALL) {
            $query->where(function (Builder $query) use ($filters, $hasDateFilter): void {
                $query->whereHas('activeLease', fn (Builder $leaseQuery) => $this->applyLeaseEndRange($leaseQuery, $filters));

                if (! $hasDateFilter) {
                    $query->orWhere(fn (Builder $subQuery) => $subQuery
                        ->whereDoesntHave('activeLease')
                        ->whereHas('interments', fn (Builder $intermentQuery) => $intermentQuery->active()));
                }
            });

            return;
        }

        $query->whereHas('activeLease', function (Builder $leaseQuery) use ($filters, $today, $soon): void {
            $leaseQuery->where('status', PlotLeaseStatus::ACTIVE->value);
            $this->applyLeaseEndRange($leaseQuery, $filters);

            match ($filters->leaseState) {
                LeaseReportFiltersDto::STATE_EXPIRED => $leaseQuery->whereDate('lease_end', '<', $today),
                LeaseReportFiltersDto::STATE_EXPIRING_SOON => $leaseQuery->whereBetween('lease_end', [$today, $soon]),
                LeaseReportFiltersDto::STATE_ACTIVE => $leaseQuery->where(fn (Builder $query) => $query
                    ->whereNull('lease_end')
                    ->orWhereDate('lease_end', '>=', $today)),
                default => null,
            };
        });
    }

    private function applyLeaseEndRange(Builder $leaseQuery, LeaseReportFiltersDto $filters): void
    {
        $leaseQuery
            ->when($filters->leaseEndFrom, fn (Builder $query, string $date) => $query->whereDate('lease_end', '>=', $date))
            ->when($filters->leaseEndTo, fn (Builder $query, string $date) => $query->whereDate('lease_end', '<=', $date));
    }

    private function mapRow(Plot $plot, LeaseReportFiltersDto $filters): array
    {
        $lease = $plot->activeLease;
        $today = CarbonImmutable::today();
        $leaseEnd = $lease?->lease_end ? CarbonImmutable::parse($lease->lease_end) : null;
        $days = $leaseEnd ? $today->diffInDays($leaseEnd, false) : null;
        $leaseState = $this->leaseState($plot, $days, $filters->expiringWithinDays);

        return [
            'plot_id' => $plot->id,
            'site_name' => $plot->cemeterySite?->name,
            'section_name' => $plot->block?->section?->name,
            'block_name' => $plot->block?->name,
            'plot_label' => $plot->slotLabel,
            'active_interments_count' => (int) ($plot->active_interments_count ?? 0),
            'lease_state' => $leaseState,
            'lease_state_label' => $this->leaseStateLabel($leaseState),
            'leaseholder_name' => $lease?->leaseholder_name,
            'leaseholder_contact' => $lease?->leaseholder_contact,
            'leaseholder_relationship' => $lease?->leaseholder_relationship,
            'lease_start' => $lease?->lease_start?->format('Y-m-d'),
            'lease_end' => $lease?->lease_end?->format('Y-m-d'),
            'days' => $days,
            'days_label' => $days === null ? '-' : ($days < 0 ? abs($days).' days overdue' : $days.' days remaining'),
            'or_number' => $lease?->or_number,
            'amount_paid' => $lease?->amount_paid,
            'status_label' => $lease?->status?->label(),
        ];
    }

    private function leaseState(Plot $plot, ?int $days, int $expiringWithinDays): string
    {
        if (! $plot->activeLease) {
            return LeaseReportFiltersDto::STATE_NO_ACTIVE_LEASE;
        }

        if ($days !== null && $days < 0) {
            return LeaseReportFiltersDto::STATE_EXPIRED;
        }

        if ($days !== null && $days <= $expiringWithinDays) {
            return LeaseReportFiltersDto::STATE_EXPIRING_SOON;
        }

        return LeaseReportFiltersDto::STATE_ACTIVE;
    }

    private function leaseStateLabel(string $state): string
    {
        return match ($state) {
            LeaseReportFiltersDto::STATE_EXPIRED => 'Expired',
            LeaseReportFiltersDto::STATE_EXPIRING_SOON => 'Expiring Soon',
            LeaseReportFiltersDto::STATE_NO_ACTIVE_LEASE => 'No Active Lease',
            default => 'Active',
        };
    }
}
