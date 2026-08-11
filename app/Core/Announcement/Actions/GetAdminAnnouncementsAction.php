<?php

namespace App\Core\Announcement\Actions;

use App\Core\Announcement\Dto\AdminAnnouncementFiltersDto;
use App\Core\Announcement\Models\Announcement;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class GetAdminAnnouncementsAction
{
    public function execute(string $municipalId, AdminAnnouncementFiltersDto $filters): LengthAwarePaginator
    {
        $query = Announcement::query()
            ->with(['media'])
            ->where('municipal_id', $municipalId)
            ->when($filters->search, fn (Builder $query, string $search) => $query->whereLike(
                'title',
                "%{$search}%",
                caseSensitive: false,
            ))
            ->when($filters->publication, fn (Builder $query, string $publication) => $query->where(
                'is_published',
                $publication === AdminAnnouncementFiltersDto::PUBLICATION_PUBLISHED,
            ))
            ->when($filters->type, fn (Builder $query) => $query->where('type', $filters->type->value));

        match ($filters->sort) {
            AdminAnnouncementFiltersDto::SORT_CREATED_ASC => $query->orderBy('created_at'),
            AdminAnnouncementFiltersDto::SORT_UPDATED_DESC => $query->orderByDesc('updated_at'),
            default => $query->orderByDesc('created_at'),
        };

        return $query
            ->orderBy('id')
            ->paginate(AdminAnnouncementFiltersDto::PER_PAGE)
            ->withQueryString();
    }
}
