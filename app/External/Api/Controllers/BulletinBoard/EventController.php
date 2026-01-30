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

            $event = $this->eventCreateUseCase->execute($dto, $municipalId);

            return redirect()->back()->with('success', 'Event created successfully.');

        } catch (\Throwable $e) {

            return redirect()->back()
                ->with('error', 'Failed to create event: ' . $e->getMessage())
                ->withInput();

            // return response()->json([
            //     'success' => false,
            //     'message' => 'Failed to create event',
            //     'error' => $e->getMessage(),
            // ], 200);

        }
    }

    public function fetch(Request $request)
    {
        //admin fetch
        $municipalId = app('municipal_id');

        $dto = new EventsQueryDto(
            perPage: $request->input('per_page', 30),
            orderBy: $request->input('order_by', 'created_at'),
            direction: $request->input('direction', 'desc'),
            search: $request->input('search')
        );

        $events = $this->getEventsUseCase->execute($municipalId, $dto);

        return EventsResource::collection($events)->additional([
            'success' => true,
        ]);

    }

    public function getPublished(Request $request)
    {
        //public fetch
        try {

            $municipalId = app('municipal_id');

            $dto = new EventsQueryDto(
                perPage: $request->input('per_page', 15),
                orderBy: $request->input('order_by', 'created_at'),
                direction: $request->input('direction', 'desc'),
                search: $request->input('search')
            );

            // This returns LengthAwarePaginator
            $events = $this->getPublished->execute($municipalId, $dto);

            return response()->json([
                'success' => true,
                'data' => EventsResource::collection($events),
                'current_page' => $events->currentPage(),
                'last_page' => $events->lastPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
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
                title: $validated['title'],
                description: $validated['description'],
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
                'message' => 'Event not found.',
            ], 404);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 200);

        }
    }

    public function destroy(Request $request)
    {
        try {

            // 1. Validate that we received an array of IDs
            $validated = $request->validate([
                'ids' => ['required', 'array', 'min:1'],
                'ids.*' => ['ulid', 'distinct'],
            ]);
            // 2. Execute the Bulk Delete
            $count = $this->deleteEvent->execute($validated['ids']);

            if ($count === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No events were deleted.',
                ], 404);
            }

            // 3. Return Success
            return redirect()->back()->with('success', 'Successfully deleted.');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occured please try again later.');

        }
    }

    public function show()
    {

    }

}