<?php

namespace App\Core\ActionCenter\UseCase\Report;

use App\Core\ActionCenter\Dto\Report\AssistanceRequestReportFiltersDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\Users\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ListAssistanceRequestReportAction
{
    public function execute(string $municipalId, AssistanceRequestReportFiltersDto $filters): LengthAwarePaginator
    {
        return $this->rowQuery($municipalId, $filters)
            ->paginate($filters->perPage)
            ->withQueryString()
            ->through(fn (AssistanceRequest $request) => $this->mapRow($request));
    }

    public function summary(string $municipalId, AssistanceRequestReportFiltersDto $filters): array
    {
        $query = $this->baseQuery($municipalId, $filters);
        $statusCounts = (clone $query)
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        return [
            'total' => (clone $query)->count(),
            'pending' => (int) ($statusCounts[AssistanceStatus::Pending->value] ?? 0),
            'under_review' => (int) ($statusCounts[AssistanceStatus::UnderReview->value] ?? 0),
            'released' => (int) ($statusCounts[AssistanceStatus::Released->value] ?? 0),
            'released_amount' => (float) (clone $query)
                ->where('status', AssistanceStatus::Released->value)
                ->sum('amount_approved'),
        ];
    }

    public function headings(): array
    {
        return [
            'Transaction Number',
            'Submitted Date',
            'Beneficiary Number',
            'Filer Name',
            'Assisted Person',
            'Filing Source',
            'Barangay',
            'Assistance Type',
            'Status',
            'Approved Amount',
            'Reviewer',
            'Reviewed Date',
            'Approver',
            'Approved Date',
            'Released Date',
            'Release Reference',
            'Purpose',
        ];
    }

    public function exportRows(string $municipalId, AssistanceRequestReportFiltersDto $filters): array
    {
        return $this->rowQuery($municipalId, $filters)
            ->get()
            ->map(fn (AssistanceRequest $request) => $this->mapRow($request))
            ->map(fn (array $row) => [
                $row['transaction_number'],
                $row['submitted_date'],
                $row['beneficiary_number'],
                $row['filer_name'],
                $row['assisted_person'],
                $row['source_label'],
                $row['barangay'],
                $row['assistance_type'],
                $row['status_label'],
                $row['amount_approved'],
                $row['reviewer_name'],
                $row['reviewed_date'],
                $row['approver_name'],
                $row['approved_date'],
                $row['released_date'],
                $row['release_reference_number'],
                $row['description'],
            ])
            ->values()
            ->all();
    }

    public function filterSummary(string $municipalId, AssistanceRequestReportFiltersDto $filters): string
    {
        $parts = [];

        if ($filters->status !== null) {
            $parts[] = 'Status: '.(AssistanceStatus::tryFrom($filters->status)?->label() ?? $filters->status);
        }

        if ($filters->assistanceTypeId !== null) {
            $type = AssistanceType::withTrashed()
                ->where('municipal_id', $municipalId)
                ->whereKey($filters->assistanceTypeId)
                ->value('name');
            $parts[] = 'Assistance type: '.($type ?: $filters->assistanceTypeId);
        }

        if ($filters->barangay !== null) {
            $parts[] = 'Barangay: '.$filters->barangay;
        }

        if ($filters->source !== null) {
            $parts[] = 'Source: '.($filters->source === AssistanceRequestReportFiltersDto::SOURCE_PORTAL ? 'Portal' : 'Admin / Walk-in');
        }

        if ($filters->dateFrom !== null || $filters->dateTo !== null) {
            $basis = $filters->dateBasis === AssistanceRequestReportFiltersDto::DATE_RELEASED ? 'Released' : 'Submitted';
            $parts[] = sprintf('%s date: %s to %s', $basis, $filters->dateFrom ?: 'Any', $filters->dateTo ?: 'Any');
        }

        if ($filters->search !== null) {
            $parts[] = 'Search: '.$filters->search;
        }

        return $parts === [] ? 'All assistance requests' : implode(' | ', $parts);
    }

    private function rowQuery(string $municipalId, AssistanceRequestReportFiltersDto $filters): Builder
    {
        return $this->baseQuery($municipalId, $filters)
            ->with([
                'snapshot',
                'assistanceType:id,name',
                'beneficiary:id,beneficiary_number',
                'reviewedBy:id,first_name,last_name',
                'approvedBy:id,first_name,last_name',
            ])
            ->orderByDesc('created_at');
    }

    private function baseQuery(string $municipalId, AssistanceRequestReportFiltersDto $filters): Builder
    {
        $query = AssistanceRequest::query()
            ->where('municipal_id', $municipalId)
            ->when($filters->status, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when(
                $filters->assistanceTypeId,
                fn (Builder $query, string $typeId) => $query->where('assistance_type_id', $typeId),
            )
            ->when($filters->barangay, fn (Builder $query, string $barangay) => $query
                ->whereHas('snapshot', fn (Builder $snapshot) => $snapshot->where('barangay', $barangay)))
            ->when($filters->source === AssistanceRequestReportFiltersDto::SOURCE_PORTAL, fn (Builder $query) => $query
                ->whereNull('encoded_by_user_id'))
            ->when($filters->source === AssistanceRequestReportFiltersDto::SOURCE_WALK_IN, fn (Builder $query) => $query
                ->whereNotNull('encoded_by_user_id'));

        $dateColumn = $filters->dateBasis === AssistanceRequestReportFiltersDto::DATE_RELEASED
            ? 'released_at'
            : 'created_at';

        $query
            ->when($filters->dateFrom, fn (Builder $query, string $date) => $query->whereDate($dateColumn, '>=', $date))
            ->when($filters->dateTo, fn (Builder $query, string $date) => $query->whereDate($dateColumn, '<=', $date));

        if ($filters->search !== null) {
            $term = '%'.mb_strtolower($filters->search).'%';
            $query->where(function (Builder $query) use ($term): void {
                $query->whereRaw('LOWER(transaction_number) LIKE ?', [$term])
                    ->orWhereHas('snapshot', function (Builder $snapshot) use ($term): void {
                        $snapshot
                            ->whereRaw('LOWER(first_name) LIKE ?', [$term])
                            ->orWhereRaw('LOWER(middle_name) LIKE ?', [$term])
                            ->orWhereRaw('LOWER(last_name) LIKE ?', [$term]);
                    })
                    ->orWhereRaw("LOWER(COALESCE(metadata->>'on_behalf_first_name', '')) LIKE ?", [$term])
                    ->orWhereRaw("LOWER(COALESCE(metadata->>'on_behalf_last_name', '')) LIKE ?", [$term]);
            });
        }

        return $query;
    }

    private function mapRow(AssistanceRequest $request): array
    {
        $snapshot = $request->snapshot;
        $status = $request->status instanceof AssistanceStatus
            ? $request->status
            : AssistanceStatus::tryFrom((string) $request->status);
        $filerName = $this->fullName(
            $snapshot?->first_name,
            $snapshot?->middle_name,
            $snapshot?->last_name,
            $snapshot?->suffix,
        );
        $assistedPerson = $this->fullName(
            data_get($request->metadata, 'on_behalf_first_name'),
            data_get($request->metadata, 'on_behalf_middle_name'),
            data_get($request->metadata, 'on_behalf_last_name'),
            data_get($request->metadata, 'on_behalf_suffix'),
        ) ?: $filerName;

        return [
            'id' => $request->id,
            'transaction_number' => $request->transaction_number,
            'submitted_date' => $request->created_at?->toDateString(),
            'beneficiary_number' => $request->beneficiary?->beneficiary_number,
            'filer_name' => $filerName,
            'assisted_person' => $assistedPerson,
            'filed_for_self' => $assistedPerson === $filerName,
            'source' => $request->encoded_by_user_id === null
                ? AssistanceRequestReportFiltersDto::SOURCE_PORTAL
                : AssistanceRequestReportFiltersDto::SOURCE_WALK_IN,
            'source_label' => $request->encoded_by_user_id === null ? 'Portal' : 'Admin / Walk-in',
            'barangay' => $snapshot?->barangay,
            'assistance_type' => $request->assistanceType?->name,
            'status' => $status?->value,
            'status_label' => $status?->label() ?? ucfirst((string) $request->status),
            'amount_approved' => $request->amount_approved !== null ? (float) $request->amount_approved : null,
            'reviewer_name' => $this->staffName($request->reviewedBy),
            'reviewed_date' => $request->reviewed_at?->toDateString(),
            'approver_name' => $this->staffName($request->approvedBy),
            'approved_date' => $request->approved_at?->toDateString(),
            'released_date' => $request->released_at?->toDateString(),
            'release_reference_number' => $request->release_reference_number,
            'description' => $request->description,
        ];
    }

    private function staffName(?User $user): ?string
    {
        return $user ? trim($user->first_name.' '.$user->last_name) : null;
    }

    private function fullName(mixed $firstName, mixed $middleName, mixed $lastName, mixed $suffix): string
    {
        return collect([$firstName, $middleName, $lastName, $suffix])
            ->filter(fn (mixed $part) => filled($part))
            ->map(fn (mixed $part) => trim((string) $part))
            ->implode(' ');
    }
}
