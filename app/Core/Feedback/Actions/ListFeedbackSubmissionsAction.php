<?php

namespace App\Core\Feedback\Actions;

use App\Core\Feedback\Dto\AdminFeedbackFiltersDto;
use App\Core\Feedback\Models\FeedbackSubmission;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ListFeedbackSubmissionsAction
{
    public function execute(AdminFeedbackFiltersDto $filters, string $municipalId): LengthAwarePaginator
    {
        $query = FeedbackSubmission::query()
            ->with(['department:id,name', 'media'])
            ->where('municipal_id', $municipalId);

        $query
            ->when($filters->search, fn (Builder $query, string $search) => $this->applySearch($query, $search))
            ->when($filters->departmentId, fn (Builder $query, string $departmentId) => $query->where('department_id', $departmentId))
            ->when($filters->subject, fn (Builder $query, string $subject) => $query->where('subject', $subject))
            ->when($filters->rating, fn (Builder $query, int $rating) => $query->where('rating', $rating))
            ->when($filters->dateFrom, fn (Builder $query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters->dateTo, fn (Builder $query, string $date) => $query->whereDate('created_at', '<=', $date));

        $this->applyVisibilityFilter($query, $filters);
        $this->applyTargetFilter($query, $filters);
        $this->applyAttachmentFilter($query, $filters);
        $this->applySort($query, $filters);

        return $query->paginate($filters->perPage)->withQueryString();
    }

    private function applySearch(Builder $query, string $search): void
    {
        $term = "%{$search}%";

        $query->where(function (Builder $query) use ($term): void {
            $query->where('subject', 'like', $term)
                ->orWhere('message', 'like', $term)
                ->orWhere('employee_name', 'like', $term)
                ->orWhereHas('department', fn (Builder $departmentQuery) => $departmentQuery->where('name', 'like', $term));
        });
    }

    private function applyVisibilityFilter(Builder $query, AdminFeedbackFiltersDto $filters): void
    {
        match ($filters->visibility) {
            AdminFeedbackFiltersDto::VISIBILITY_ANONYMOUS => $query->where('is_anonymous', true),
            AdminFeedbackFiltersDto::VISIBILITY_IDENTIFIED => $query->where('is_anonymous', false),
            default => null,
        };
    }

    private function applyTargetFilter(Builder $query, AdminFeedbackFiltersDto $filters): void
    {
        match ($filters->target) {
            AdminFeedbackFiltersDto::TARGET_EMPLOYEE => $query->whereNotNull('employee_name')->where('employee_name', '!=', ''),
            AdminFeedbackFiltersDto::TARGET_DEPARTMENT => $query
                ->whereNotNull('department_id')
                ->where(fn (Builder $query) => $query->whereNull('employee_name')->orWhere('employee_name', '')),
            AdminFeedbackFiltersDto::TARGET_UNASSIGNED => $query->whereNull('department_id'),
            default => null,
        };
    }

    private function applyAttachmentFilter(Builder $query, AdminFeedbackFiltersDto $filters): void
    {
        match ($filters->hasAttachments) {
            AdminFeedbackFiltersDto::HAS_ATTACHMENTS_YES => $query->whereHas('media', fn (Builder $query) => $query->where('collection_name', 'attachments')),
            AdminFeedbackFiltersDto::HAS_ATTACHMENTS_NO => $query->whereDoesntHave('media', fn (Builder $query) => $query->where('collection_name', 'attachments')),
            default => null,
        };
    }

    private function applySort(Builder $query, AdminFeedbackFiltersDto $filters): void
    {
        match ($filters->sort) {
            AdminFeedbackFiltersDto::SORT_OLDEST => $query->oldest('created_at'),
            AdminFeedbackFiltersDto::SORT_RATING_HIGH => $query->orderByRaw('rating IS NULL')->orderByDesc('rating')->latest('created_at'),
            AdminFeedbackFiltersDto::SORT_RATING_LOW => $query->orderByRaw('rating IS NULL')->orderBy('rating')->latest('created_at'),
            default => $query->latest('created_at'),
        };
    }
}
