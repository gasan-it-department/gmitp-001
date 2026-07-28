<?php

namespace App\Core\ActionCenter\UseCase\Report;

use App\Core\ActionCenter\Dto\Report\BeneficiaryRegistryReportFiltersDto;
use App\Core\ActionCenter\Enums\Sex;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ListBeneficiaryRegistryReportAction
{
    public function execute(string $municipalId, BeneficiaryRegistryReportFiltersDto $filters): LengthAwarePaginator
    {
        return $this->rowQuery($municipalId, $filters)
            ->paginate($filters->perPage)
            ->withQueryString()
            ->through(fn (Beneficiary $beneficiary) => $this->mapRow($beneficiary));
    }

    public function summary(string $municipalId, BeneficiaryRegistryReportFiltersDto $filters): array
    {
        $query = $this->baseQuery($municipalId, $filters);

        return [
            'total' => (clone $query)->count(),
            'verified' => (clone $query)->whereNotNull('identity_verified_at')->count(),
            'pending' => (clone $query)
                ->whereNull('identity_verified_at')
                ->whereNull('intake_rejected_at')
                ->count(),
            'portal' => (clone $query)->whereNotNull('user_id')->count(),
            'walk_in' => (clone $query)->whereNull('user_id')->count(),
        ];
    }

    public function headings(): array
    {
        return [
            'Beneficiary Number',
            'Full Name',
            'Birth Date',
            'Age',
            'Sex',
            'Civil Status',
            'Contact Phone',
            'Barangay',
            'Street',
            'Household Code',
            'Official Household Size',
            'Source',
            'Intake Status',
            'Lifecycle',
            'Total Requests',
            'Released Requests',
            'Total Released Amount',
            'Last Request Date',
            'Registered Date',
        ];
    }

    public function exportRows(string $municipalId, BeneficiaryRegistryReportFiltersDto $filters): array
    {
        return $this->rowQuery($municipalId, $filters)
            ->get()
            ->map(fn (Beneficiary $beneficiary) => $this->mapRow($beneficiary))
            ->map(fn (array $row) => [
                $row['beneficiary_number'],
                $row['full_name'],
                $row['birth_date'],
                $row['age'],
                $row['sex_label'],
                $row['civil_status_label'],
                $row['contact_phone'],
                $row['barangay'],
                $row['street'],
                $row['household_code'],
                $row['official_household_size'],
                $row['source_label'],
                $row['intake_status_label'],
                $row['lifecycle_label'],
                $row['total_requests'],
                $row['released_requests'],
                $row['total_released_amount'],
                $row['last_request_date'],
                $row['registered_date'],
            ])
            ->values()
            ->all();
    }

    public function filterSummary(BeneficiaryRegistryReportFiltersDto $filters): string
    {
        $parts = [];

        if ($filters->barangay !== null) {
            $parts[] = 'Barangay: '.$filters->barangay;
        }

        if ($filters->sex !== null) {
            $parts[] = 'Sex: '.(Sex::tryFrom($filters->sex)?->label() ?? $filters->sex);
        }

        if ($filters->verification !== null) {
            $parts[] = 'Intake: '.ucwords(str_replace('_', ' ', $filters->verification));
        }

        if ($filters->source !== null) {
            $parts[] = 'Source: '.($filters->source === BeneficiaryRegistryReportFiltersDto::SOURCE_PORTAL ? 'Portal' : 'Walk-in');
        }

        if ($filters->lifecycle !== BeneficiaryRegistryReportFiltersDto::LIFECYCLE_CURRENT) {
            $parts[] = 'Lifecycle: '.ucwords(str_replace('_', ' ', $filters->lifecycle));
        }

        if ($filters->search !== null) {
            $parts[] = 'Search: '.$filters->search;
        }

        return $parts === [] ? 'Current beneficiary registry' : implode(' | ', $parts);
    }

    private function rowQuery(string $municipalId, BeneficiaryRegistryReportFiltersDto $filters): Builder
    {
        return $this->baseQuery($municipalId, $filters)
            ->with('household:id,household_code,barangay,street')
            ->withCount([
                'assistanceRequests as total_requests_count',
                'assistanceRequests as released_requests_count' => fn (Builder $query) => $query
                    ->where('status', 'released'),
            ])
            ->withSum([
                'assistanceRequests as total_released_amount' => fn (Builder $query) => $query
                    ->where('status', 'released'),
            ], 'amount_approved')
            ->addSelect([
                'last_request_at' => AssistanceRequest::query()
                    ->select('created_at')
                    ->whereColumn('beneficiary_id', 'ac_beneficiaries.id')
                    ->latest('created_at')
                    ->limit(1),
                'official_household_size' => HouseholdMember::query()
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('household_id', 'ac_beneficiaries.household_id')
                    ->where('is_active', true)
                    ->where(function (Builder $query): void {
                        $query->where('relationship', 'head')
                            ->orWhere('is_verified_dependent', true);
                    }),
            ])
            ->orderBy('last_name')
            ->orderBy('first_name');
    }

    private function baseQuery(string $municipalId, BeneficiaryRegistryReportFiltersDto $filters): Builder
    {
        $query = Beneficiary::query()
            ->where('municipal_id', $municipalId)
            ->when($filters->barangay, fn (Builder $query, string $barangay) => $query
                ->whereHas('household', fn (Builder $household) => $household->where('barangay', $barangay)))
            ->when($filters->sex, fn (Builder $query, string $sex) => $query->where('sex', $sex))
            ->when($filters->source === BeneficiaryRegistryReportFiltersDto::SOURCE_PORTAL, fn (Builder $query) => $query
                ->whereNotNull('user_id'))
            ->when($filters->source === BeneficiaryRegistryReportFiltersDto::SOURCE_WALK_IN, fn (Builder $query) => $query
                ->whereNull('user_id'));

        match ($filters->verification) {
            'verified' => $query->whereNotNull('identity_verified_at'),
            'pending' => $query->whereNull('identity_verified_at')->whereNull('intake_rejected_at'),
            'rejected' => $query->whereNotNull('intake_rejected_at'),
            default => null,
        };

        match ($filters->lifecycle) {
            BeneficiaryRegistryReportFiltersDto::LIFECYCLE_CURRENT => $query
                ->where('is_active', true)
                ->whereNull('merged_into_beneficiary_id'),
            BeneficiaryRegistryReportFiltersDto::LIFECYCLE_INACTIVE => $query
                ->where('is_active', false)
                ->whereNull('merged_into_beneficiary_id'),
            BeneficiaryRegistryReportFiltersDto::LIFECYCLE_MERGED => $query
                ->whereNotNull('merged_into_beneficiary_id'),
            default => null,
        };

        if ($filters->search !== null) {
            foreach (preg_split('/\s+/', $filters->search) ?: [] as $word) {
                $term = '%'.mb_strtolower($word).'%';
                $query->where(function (Builder $query) use ($term): void {
                    $query->whereRaw('LOWER(first_name) LIKE ?', [$term])
                        ->orWhereRaw("LOWER(COALESCE(middle_name, '')) LIKE ?", [$term])
                        ->orWhereRaw('LOWER(last_name) LIKE ?', [$term])
                        ->orWhereRaw("LOWER(COALESCE(suffix, '')) LIKE ?", [$term])
                        ->orWhereRaw("LOWER(COALESCE(beneficiary_number, '')) LIKE ?", [$term]);
                });
            }
        }

        return $query;
    }

    private function mapRow(Beneficiary $beneficiary): array
    {
        $intakeStatus = $beneficiary->intakeStatus();
        $lifecycle = $beneficiary->merged_into_beneficiary_id !== null
            ? BeneficiaryRegistryReportFiltersDto::LIFECYCLE_MERGED
            : ($beneficiary->is_active ? 'active' : BeneficiaryRegistryReportFiltersDto::LIFECYCLE_INACTIVE);

        return [
            'id' => $beneficiary->id,
            'beneficiary_number' => $beneficiary->beneficiary_number,
            'full_name' => collect([
                $beneficiary->first_name,
                $beneficiary->middle_name,
                $beneficiary->last_name,
                $beneficiary->suffix,
            ])->filter()->implode(' '),
            'birth_date' => $beneficiary->birth_date?->toDateString(),
            'age' => $beneficiary->birth_date?->age,
            'sex' => $beneficiary->sex,
            'sex_label' => $beneficiary->sex ? Sex::tryFrom((string) $beneficiary->sex)?->label() : null,
            'civil_status_label' => $beneficiary->civil_status?->label(),
            'contact_phone' => $beneficiary->contact_phone,
            'barangay' => $beneficiary->household?->barangay,
            'street' => $beneficiary->household?->street,
            'household_code' => $beneficiary->household?->household_code,
            'official_household_size' => (int) ($beneficiary->official_household_size ?? 0),
            'source' => $beneficiary->user_id !== null
                ? BeneficiaryRegistryReportFiltersDto::SOURCE_PORTAL
                : BeneficiaryRegistryReportFiltersDto::SOURCE_WALK_IN,
            'source_label' => $beneficiary->user_id !== null ? 'Portal' : 'Walk-in',
            'intake_status' => $intakeStatus,
            'intake_status_label' => ucfirst($intakeStatus),
            'lifecycle' => $lifecycle,
            'lifecycle_label' => match ($lifecycle) {
                BeneficiaryRegistryReportFiltersDto::LIFECYCLE_MERGED => 'Merged Duplicate',
                BeneficiaryRegistryReportFiltersDto::LIFECYCLE_INACTIVE => 'Inactive',
                default => 'Active',
            },
            'total_requests' => (int) ($beneficiary->total_requests_count ?? 0),
            'released_requests' => (int) ($beneficiary->released_requests_count ?? 0),
            'total_released_amount' => (float) ($beneficiary->total_released_amount ?? 0),
            'last_request_date' => $beneficiary->last_request_at
                ? date('Y-m-d', strtotime((string) $beneficiary->last_request_at))
                : null,
            'registered_date' => $beneficiary->created_at?->toDateString(),
        ];
    }
}
