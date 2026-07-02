<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Dto\Decedents\DecedentListFiltersDto;
use App\Core\Cemetery\Models\Decedent;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ListDecedentsAction
{
    public function execute(string $municipalId, ?DecedentListFiltersDto $filters = null): LengthAwarePaginator
    {
        $filters ??= new DecedentListFiltersDto(
            search: null,
            registrationStatus: null,
            identityStatus: null,
            vitalRecordType: null,
            intermentStatus: null,
            deathYear: null,
        );

        return Decedent::query()
            ->with(['currentInterment.plot', 'unidentifiedDetail'])
            ->where('municipal_id', $municipalId)
            ->when($filters->registrationStatus, fn (Builder $query, string $status) => $query
                ->where('registration_status', $status))
            ->when($filters->identityStatus, fn (Builder $query, string $status) => $query
                ->where('identity_status', $status))
            ->when($filters->vitalRecordType, fn (Builder $query, string $type) => $query
                ->where('vital_record_type', $type))
            ->when($filters->deathYear, fn (Builder $query, int $year) => $query
                ->whereYear('date_of_death', $year))
            ->when($filters->intermentStatus, function (Builder $query, string $status): void {
                if ($status === 'interred') {
                    $query->whereHas('interments', fn (Builder $intermentQuery) => $intermentQuery->active());

                    return;
                }

                $query->whereDoesntHave('interments', fn (Builder $intermentQuery) => $intermentQuery->active());
            })
            ->when($filters->search, fn (Builder $query, string $search) => $this->applySearch($query, $search))
            ->orderByDesc('date_of_registration')
            ->paginate($filters->perPage)
            ->withQueryString();
    }

    private function applySearch(Builder $query, string $search): void
    {
        $term = '%'.mb_strtolower(trim($search)).'%';
        $columns = [
            'first_name',
            'middle_name',
            'last_name',
            'suffix',
            'memorial_name',
            'registry_number',
            'death_certificate_no',
        ];

        $query->where(function (Builder $query) use ($columns, $term): void {
            foreach ($columns as $column) {
                $query->orWhereRaw("LOWER({$column}) LIKE ?", [$term]);
            }

            $query->orWhereHas('unidentifiedDetail', fn (Builder $detailQuery) => $detailQuery
                ->whereRaw('LOWER(case_reference) LIKE ?', [$term]));
        });
    }
}
