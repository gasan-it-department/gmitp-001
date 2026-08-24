<?php

namespace App\Core\Event\Actions;

use App\Core\Event\Dto\AdminEventFiltersDto;
use App\Core\Event\Models\Event;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class GetAdminEventsAction
{
    public function execute(string $municipalId, AdminEventFiltersDto $filters): LengthAwarePaginator
    {
        $now = CarbonImmutable::now(config('app.timezone'));

        $query = Event::query()
            ->with(['media'])
            ->where('municipal_id', $municipalId)
            ->when($filters->search, function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->whereLike('title', "%{$search}%", caseSensitive: false)
                        ->orWhereLike('location_name', "%{$search}%", caseSensitive: false);
                });
            })
            ->when($filters->type, fn (Builder $query) => $query->where('type', $filters->type->value))
            ->when($filters->publication, fn (Builder $query, string $publication) => $query->where(
                'is_published',
                $publication === AdminEventFiltersDto::PUBLICATION_PUBLISHED,
            ))
            ->when($filters->dateFrom, fn (Builder $query, string $date) => $query->whereRaw(
                'COALESCE(end_datetime, start_datetime) >= ?',
                [CarbonImmutable::parse($date, config('app.timezone'))->startOfDay()],
            ))
            ->when($filters->dateTo, fn (Builder $query, string $date) => $query->where(
                'start_datetime',
                '<=',
                CarbonImmutable::parse($date, config('app.timezone'))->endOfDay(),
            ));

        $this->applySchedule($query, $filters, $now);
        $this->applySort($query, $filters, $now);

        return $query
            ->orderBy('id')
            ->paginate(AdminEventFiltersDto::PER_PAGE)
            ->withQueryString();
    }

    private function applySchedule(Builder $query, AdminEventFiltersDto $filters, CarbonImmutable $now): void
    {
        match ($filters->schedule) {
            AdminEventFiltersDto::SCHEDULE_ONGOING => $query
                ->where('start_datetime', '<=', $now)
                ->where('end_datetime', '>=', $now),
            AdminEventFiltersDto::SCHEDULE_UPCOMING => $query->where('start_datetime', '>', $now),
            AdminEventFiltersDto::SCHEDULE_PAST => $query->where(function (Builder $query) use ($now): void {
                $query
                    ->where('end_datetime', '<', $now)
                    ->orWhere(function (Builder $query) use ($now): void {
                        $query
                            ->whereNull('end_datetime')
                            ->where('start_datetime', '<=', $now);
                    });
            }),
            default => null,
        };
    }

    private function applySort(Builder $query, AdminEventFiltersDto $filters, CarbonImmutable $now): void
    {
        match ($filters->sort) {
            AdminEventFiltersDto::SORT_START_ASC => $query->orderBy('start_datetime'),
            AdminEventFiltersDto::SORT_START_DESC => $query->orderByDesc('start_datetime'),
            AdminEventFiltersDto::SORT_UPDATED_DESC => $query->orderByDesc('updated_at'),
            default => $this->applyRelevanceSort($query, $now),
        };
    }

    private function applyRelevanceSort(Builder $query, CarbonImmutable $now): void
    {
        $query
            ->orderByRaw(
                'CASE WHEN start_datetime <= ? AND end_datetime >= ? THEN 0 WHEN start_datetime > ? THEN 1 ELSE 2 END',
                [$now, $now, $now],
            )
            ->orderByRaw(
                'CASE WHEN start_datetime <= ? AND end_datetime >= ? THEN end_datetime END ASC',
                [$now, $now],
            )
            ->orderByRaw('CASE WHEN start_datetime > ? THEN start_datetime END ASC', [$now])
            ->orderByRaw(
                'CASE WHEN start_datetime <= ? AND (end_datetime < ? OR end_datetime IS NULL) THEN COALESCE(end_datetime, start_datetime) END DESC',
                [$now, $now],
            );
    }
}
