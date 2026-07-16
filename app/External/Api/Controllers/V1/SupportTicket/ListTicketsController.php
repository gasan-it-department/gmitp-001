<?php

namespace App\External\Api\Controllers\V1\SupportTicket;

use App\Core\SupportTicket\Actions\ListMyTicketsAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListTicketsController extends Controller
{
    public function __construct(
        private ListMyTicketsAction $listMyTickets,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->integer('per_page', 10), 50));
        $tickets = $this->listMyTickets->execute($perPage);
        $tickets->appends($request->query());

        return response()->json($tickets);
    }
}
