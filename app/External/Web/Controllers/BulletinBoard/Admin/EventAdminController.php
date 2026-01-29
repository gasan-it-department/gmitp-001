<?php

namespace App\External\Web\Controllers\BulletinBoard\Admin;

use inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Core\BulletinBoard\Events\Dto\EventsQueryDto;
use App\Core\BulletinBoard\Events\UseCase\GetEventsUseCase;
use App\External\Api\Resources\BulletinBoard\EventsResource;

class EventAdminController extends Controller
{
    public function index(Request $request, GetEventsUseCase $getEventsUseCase)
    {

        $municipalId = app('municipal_id');

        $dto = EventsQueryDto::fromRequest($request);

        $events = $getEventsUseCase->execute($municipalId, $dto);

        return Inertia::render('BulletinBoard/Event/Admin/List/EventsIndex', [

            'events' => EventsResource::collection($events),

            'municipality' => app('current_municipality'),
            // 'filters' => $request->only(['search', 'order_by', 'direction']),

        ]);
    }
}