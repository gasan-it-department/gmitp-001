<?php

namespace App\External\Api\Controllers\BulletinBoard;

use App\Core\BulletinBoard\Events\Dto\CreateEventDto;
use App\Http\Controllers\Controller;
use App\External\Api\Request\BulletinBoard\EventRequest;
use App\Core\BulletinBoard\Events\Services\CreateEventService;
class EventController extends Controller
{
    public function __construct(protected CreateEventService $eventService)
    {
    }

    public function store(EventRequest $request)
    {
        try {
            $validated = $request->validated();

            $eventDateAndTime = new \DateTimeImmutable(
                $validated['event_date'] . ' ' . $validated['event_time']
            );

            $userId = $request->user()->id;

            $dto = new CreateEventDto(
                title: $validated['title'],
                message: $validated['message'],
                eventDateAndTime: $eventDateAndTime,
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
            ], 500);
        }
    }

    public function index()
    {

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