<?php

namespace App\Core\CommunityReport\Actions;

use App\Core\CommunityReport\Dto\AdminReportFiltersDto;
use App\Core\CommunityReport\Models\ReportSubmission;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class GetAdminReportSubmissionsAction
{
    /**
     * Paginate community reports for the given tenant, newest first.
     * Eager loads the reporter so the resource can read full_name.
     */
    public function execute(string $municipalId, ?AdminReportFiltersDto $filters = null): LengthAwarePaginator
    {
        $filters ??= AdminReportFiltersDto::fromArray([]);

        $query = ReportSubmission::query()
            ->with('user:id,first_name,last_name')
            ->where('municipal_id', $municipalId);

        if ($filters->search) {
            $search = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $filters->search).'%';

            $query->where(function ($query) use ($search) {
                $query
                    ->where('location_text', 'like', $search)
                    ->orWhere('description', 'like', $search)
                    ->orWhereHas('user', function ($query) use ($search) {
                        $query
                            ->where('first_name', 'like', $search)
                            ->orWhere('last_name', 'like', $search);
                    });
            });
        }

        if ($filters->status) {
            $query->where('status', $filters->status->value);
        }

        if ($filters->category) {
            $query->where('category', $filters->category->value);
        }

        if ($filters->visibility === AdminReportFiltersDto::VISIBILITY_ANONYMOUS) {
            $query->where('is_anonymous', true);
        }

        if ($filters->visibility === AdminReportFiltersDto::VISIBILITY_IDENTIFIED) {
            $query->where('is_anonymous', false);
        }

        if ($filters->dateFrom) {
            $query->whereDate('created_at', '>=', $filters->dateFrom);
        }

        if ($filters->dateTo) {
            $query->whereDate('created_at', '<=', $filters->dateTo);
        }

        $filters->sort === AdminReportFiltersDto::SORT_OLDEST
            ? $query->orderBy('created_at')
            : $query->orderByDesc('created_at');

        return $query
            ->paginate($filters->perPage)
            ->withQueryString();
    }
}
