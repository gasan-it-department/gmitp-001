<?php

namespace App\External\Api\Controllers\BulletinBoard;

use App\Core\BulletinBoard\Events\Dto\UpdateEventDto;
use App\Core\BulletinBoard\Events\UseCase\DeleteEventUseCase;
use App\Core\BulletinBoard\Events\UseCase\GetPublishedEventsUseCase;
use App\Core\BulletinBoard\Events\UseCase\CreateEventUseCase;
use App\Core\BulletinBoard\Events\UseCase\GetEventsUseCase;
use App\Core\BulletinBoard\Events\UseCase\UpdateEventUseCase;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Core\BulletinBoard\Events\Dto\CreateEventDto;
use App\Core\BulletinBoard\Events\Dto\EventsQueryDto;
use App\External\Api\Request\BulletinBoard\EventRequest;
use App\External\Api\Resources\BulletinBoard\EventsResource;

class EventController extends Controller
{
    public function __construct(

        protected GetPublishedEventsUseCase $getPublished,

        protected CreateEventUseCase $eventCreateUseCase,

        protected GetEventsUseCase $getEventsUseCase,

        protected DeleteEventUseCase $deleteEvent,

        protected UpdateEventUseCase $updateEvent

    ) {
    }

    public function store(EventRequest $request)
    {
        try {

            $validated = $request->validated();

            $userId = $request->user()->id;

            $municipalId = app('municipal_id');

            $eventDate = \DateTimeImmutable::createFromFormat('Y-m-d', $validated['event_date']);

            $dto = new CreateEventDto(
                title: $validated['title'],
                description: $validated['description'],
                eventDate: $eventDate,
                userId: $userId,
                isPublish: true,
            );

            $this->eventCreateUseCase->execute($dto, $municipalId);

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

            $municipalId = app('municipal_id');

            $events = $this->getEventsUseCase->execute($municipalId);

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

    public function update(EventRequest $request, $id)
    {
        try {

            $validated = $request->validated();

            $userId = auth()->id();

            $eventDate = \DateTimeImmutable::createFromFormat('Y-m-d', $validated['event_date']);


            $dto = new UpdateEventDto(
                title: $validated['description'],
                description: $validated['title'],
                eventDate: $eventDate,
            );

            $event = $this->updateEvent->execute($id, $dto);

            return response()->json([
                'success' => true,
                'data' => $event,
            ]);

        } catch (\DomainException $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {

            return response()->json([
                'success' => false,
                'message' => 'Announcement not found.',
            ], 404);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 200);

        }
    }

    public function destroy(string $id)
    {
        try {

            $this->deleteEvent->execute($id);

            return response()->json([
                'success' => true,
                'message' => 'Event deleted successfully.',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {

            return response()->json([
                'success' => false,
                'message' => 'Event not found.',
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);

        }
    }

    public function show()
    {

    }

}