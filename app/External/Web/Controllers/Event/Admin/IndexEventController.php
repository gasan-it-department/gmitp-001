<?php

namespace App\External\Web\Controllers\Event\Admin;

use App\Core\Event\Actions\GetAdminEventsAction;
use App\Core\Event\Dto\AdminEventFiltersDto;
use App\Core\Event\Enums\EventType;
use App\External\Api\Request\Event\IndexEventRequest;
use App\External\Api\Resources\Event\Admin\AdminEventListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IndexEventController extends Controller
{
    public function __construct(
        private GetAdminEventsAction $listEvents,
    ) {}

    public function __invoke(IndexEventRequest $request): Response
    {
        $filters = AdminEventFiltersDto::fromArray($request->filters());
        $events = $this->listEvents->execute(
            municipalId: app('municipal_id'),
            filters: $filters,
        );

        return Inertia::render('Event/Admin/Index', [
            'events' => AdminEventListResource::collection($events),
            'filters' => $filters->toArray(),
            'type_options' => EventType::toOptions(),
            'schedule_options' => [
                ['value' => AdminEventFiltersDto::SCHEDULE_ONGOING, 'label' => 'Ongoing'],
                ['value' => AdminEventFiltersDto::SCHEDULE_UPCOMING, 'label' => 'Upcoming'],
                ['value' => AdminEventFiltersDto::SCHEDULE_PAST, 'label' => 'Past'],
            ],
            'publication_options' => [
                ['value' => AdminEventFiltersDto::PUBLICATION_PUBLISHED, 'label' => 'Published'],
                ['value' => AdminEventFiltersDto::PUBLICATION_DRAFT, 'label' => 'Draft'],
            ],
            'sort_options' => [
                ['value' => AdminEventFiltersDto::SORT_RELEVANCE, 'label' => 'Most relevant'],
                ['value' => AdminEventFiltersDto::SORT_START_ASC, 'label' => 'Start date (earliest)'],
                ['value' => AdminEventFiltersDto::SORT_START_DESC, 'label' => 'Start date (latest)'],
                ['value' => AdminEventFiltersDto::SORT_UPDATED_DESC, 'label' => 'Recently updated'],
            ],
        ]);
    }
}
