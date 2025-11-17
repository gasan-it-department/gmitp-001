<?php

namespace App\External\Api\Controllers\BulletinBoard;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Core\BulletinBoard\Events\Dto\CreateEventDto;
use App\Core\BulletinBoard\Events\Dto\EventsQueryDto;
use App\External\Api\Request\BulletinBoard\EventRequest;
use App\Core\BulletinBoard\Events\Services\GetEventsService;
use App\External\Api\Resources\BulletinBoard\EventsResource;
use App\Core\BulletinBoard\Events\Services\CreateEventService;
use App\Core\BulletinBoard\Events\Services\GetPublishedEventsService;

class EventController extends Controller
{
    public function __construct(
        protected GetPublishedEventsService $getPublished,
        protected CreateEventService $eventService,
        protected GetEventsService $getEventsService,
    ) {
    }

    public function store(EventRequest $request)
    {
        try {
            $validated = $request->validated();
            $userId = $request->user()->id;
            $eventDate = \DateTimeImmutable::createFromFormat('Y-m-d', $validated['event_date']);
            $dto = new CreateEventDto(
                title: $validated['title'],
                description: $validated['description'],
                eventDate: $eventDate,
                userId: $userId,
            );

            $this->eventService->execute($dto);

            return response()->json([
                'successs' => true,
                'message' => 'Event created successfully',
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create event',
                'error' => $e->getMessage(),
            ], 200);
        }
    }

    public function fetch()
    {
        try {

            $events = $this->getEventsService->execute();

            return response()->json([
                'success' => true,
                'data' => EventsResource::collection($events),
            ]);

        } catch (\Exception $e) {

            \Log::error('Failed to fetch events: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch events',
            ], 200);

        }
    }

    public function getPublished(Request $request)
    {

        try {

            $municipalId = app('municipal_id');

            $dto = new EventsQueryDto(
                perPage: $request->input('per_page', 10),
                orderBy: $request->input('order_by', 'created_at'),
                direction: $request->input('direction', 'desc'),
            );

            $events = $this->getPublished->execute($municipalId, $dto);

            return response()->json([
                'success' => true,
                'data' => EventsResource::collection($events),
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e,
            ], 200);

        }

    }

    public function show()
    {

    }

    public function update()
    {

    }

    public function destroy()
    {

    }
}