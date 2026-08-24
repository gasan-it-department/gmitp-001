<?php

namespace App\Core\Department\Actions;

use App\Core\Department\Dto\DepartmentFiltersDto;
use App\Core\Department\Models\Department;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ListDepartmentsAction
{
    public function execute(string $municipalId, DepartmentFiltersDto $filters): LengthAwarePaginator
    {
        $query = Department::query()
            ->where('municipal_id', $municipalId)
            ->when($filters->search, function (Builder $query, string $search) {
                $query->where(function (Builder $query) use ($search) {
                    $term = "%{$search}%";

                    $query
                        ->whereLike('name', $term, caseSensitive: false)
                        ->orWhereLike('code', $term, caseSensitive: false);
                });
            })
            ->when($filters->status, fn (Builder $query, string $status) => $query->where(
                'is_active',
                $status === DepartmentFiltersDto::STATUS_ACTIVE,
            ));

        match ($filters->sort) {
            DepartmentFiltersDto::SORT_NAME_DESC => $query->orderByDesc('name'),
            DepartmentFiltersDto::SORT_CREATED_DESC => $query->orderByDesc('created_at'),
            default => $query->orderBy('name'),
        };

        return $query
            ->orderBy('id')
            ->paginate(DepartmentFiltersDto::PER_PAGE)
            ->withQueryString();
    }
}
