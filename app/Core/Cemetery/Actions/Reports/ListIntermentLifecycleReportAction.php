<?php

namespace App\Core\Cemetery\Actions\Reports;

use App\Core\Cemetery\Dto\Reports\IntermentLifecycleReportFiltersDto;
use App\Core\Cemetery\Models\Interment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ListIntermentLifecycleReportAction
{
    public function execute(string $municipalId, IntermentLifecycleReportFiltersDto $filters): LengthAwarePaginator
    {
        return $this->baseQuery($municipalId, $filters)
            ->paginate($filters->perPage)
            ->withQueryString()
            ->through(fn (Interment $interment) => $this->mapRow($interment));
    }

    public function rowsForExport(string $municipalId, IntermentLifecycleReportFiltersDto $filters): array
    {
        return $this->baseQuery($municipalId, $filters)
            ->get()
            ->map(fn (Interment $interment) => $this->mapRow($interment))
            ->values()
            ->all();
    }

    public function summary(string $municipalId, IntermentLifecycleReportFiltersDto $filters): array
    {
        $rows = collect($this->rowsForExport($municipalId, $filters));

        return [
            'total' => $rows->count(),
            'active' => $rows->where('lifecycle_status', 'active')->count(),
            'moved' => $rows->where('lifecycle_status', 'moved')->count(),
            'exhumed' => $rows->where('lifecycle_status', 'exhumed')->count(),
            'transferred_out' => $rows->where('lifecycle_status', 'transferred_out')->count(),
            'voided' => $rows->where('lifecycle_status', 'voided')->count(),
        ];
    }

    public function headings(): array
    {
        return [
            'Decedent',
            'Site',
            'Section',
            'Block',
            'Plot',
            'Interment Date',
            'Lifecycle',
            'End Type',
            'Ended / Voided Date',
            'Transfer Destination',
            'Permit Reference',
            'Reason',
            'Notes',
        ];
    }

    public function exportRows(string $municipalId, IntermentLifecycleReportFiltersDto $filters): array
    {
        return collect($this->rowsForExport($municipalId, $filters))
            ->map(fn (array $row) => [
                $row['decedent_name'],
                $row['site_name'],
                $row['section_name'],
                $row['block_name'],
                $row['plot_label'],
                $row['interment_date'],
                $row['lifecycle_label'],
                $row['end_type_label'],
                $row['ended_or_voided_at'],
                $row['transfer_destination'],
                $row['permit_reference'],
                $row['reason'],
                $row['notes'],
            ])
            ->all();
    }

    private function baseQuery(string $municipalId, IntermentLifecycleReportFiltersDto $filters): Builder
    {
        return Interment::query()
            ->with(['decedent.unidentifiedDetail', 'plot.cemeterySite', 'plot.block.section'])
            ->where('municipal_id', $municipalId)
            ->when($filters->siteId, fn (Builder $query, string $siteId) => $query
                ->whereHas('plot', fn (Builder $plotQuery) => $plotQuery->where('cemetery_site_id', $siteId)))
            ->when($filters->blockId, fn (Builder $query, string $blockId) => $query
                ->whereHas('plot', fn (Builder $plotQuery) => $plotQuery->where('block_id', $blockId)))
            ->when($filters->sectionId, fn (Builder $query, string $sectionId) => $query
                ->whereHas('plot.block', fn (Builder $blockQuery) => $blockQuery->where('section_id', $sectionId)))
            ->when($filters->dateFrom, fn (Builder $query, string $date) => $query->whereDate('interment_date', '>=', $date))
            ->when($filters->dateTo, fn (Builder $query, string $date) => $query->whereDate('interment_date', '<=', $date))
            ->when($filters->endType, fn (Builder $query, string $endType) => $query->where('end_type', $endType))
            ->when($filters->lifecycleStatus !== 'all', fn (Builder $query) => $this->applyLifecycleStatus($query, $filters->lifecycleStatus))
            ->latest('interment_date')
            ->latest();
    }

    private function applyLifecycleStatus(Builder $query, string $status): void
    {
        match ($status) {
            'active' => $query->active(),
            'voided' => $query->voided(),
            'moved', 'exhumed', 'transferred_out' => $query
                ->where('end_type', $status)
                ->whereNotNull('ended_at')
                ->whereNull('voided_at'),
            default => null,
        };
    }

    private function mapRow(Interment $interment): array
    {
        $plot = $interment->plot;
        $lifecycleStatus = $this->lifecycleStatus($interment);

        return [
            'id' => $interment->id,
            'decedent_name' => $this->displayName($interment->decedent),
            'site_name' => $plot?->cemeterySite?->name,
            'section_name' => $plot?->block?->section?->name,
            'block_name' => $plot?->block?->name,
            'plot_label' => $plot?->slotLabel,
            'interment_date' => $interment->interment_date?->format('Y-m-d'),
            'lifecycle_status' => $lifecycleStatus,
            'lifecycle_label' => $this->lifecycleLabel($lifecycleStatus),
            'end_type' => $interment->end_type,
            'end_type_label' => $interment->end_type ? str($interment->end_type)->replace('_', ' ')->title()->toString() : null,
            'ended_or_voided_at' => ($interment->voided_at ?: $interment->ended_at)?->format('Y-m-d'),
            'transfer_destination' => $interment->transfer_destination,
            'permit_reference' => $interment->permit_reference,
            'reason' => $interment->void_reason ?: $interment->end_reason,
            'notes' => $interment->end_notes ?: $interment->notes,
        ];
    }

    private function lifecycleStatus(Interment $interment): string
    {
        if ($interment->voided_at !== null) {
            return 'voided';
        }

        if ($interment->ended_at !== null && filled($interment->end_type)) {
            return $interment->end_type;
        }

        return 'active';
    }

    private function lifecycleLabel(string $status): string
    {
        return match ($status) {
            'active' => 'Active',
            'moved' => 'Moved',
            'exhumed' => 'Exhumed',
            'transferred_out' => 'Transferred Out',
            'voided' => 'Voided',
            default => str($status)->replace('_', ' ')->title()->toString(),
        };
    }

    private function displayName($decedent): string
    {
        if (! $decedent) {
            return 'Unknown decedent';
        }

        if ($decedent->identity_status?->value === 'unidentified') {
            return 'UNIDENTIFIED - '.($decedent->unidentifiedDetail?->case_reference ?? $decedent->id);
        }

        if (! $decedent->has_legal_name && filled($decedent->memorial_name)) {
            return $decedent->memorial_name;
        }

        return trim(sprintf('%s, %s %s', $decedent->last_name ?? '', $decedent->first_name ?? '', $decedent->suffix ?? ''));
    }
}
