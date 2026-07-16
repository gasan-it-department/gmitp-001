<?php

namespace App\External\Api\Controllers\V1\SupportTicket;

use App\Core\SupportTicket\Actions\SubmitTicketAction;
use App\Core\SupportTicket\Dto\SubmitTicketDto;
use App\Core\SupportTicket\Enums\TicketAudience;
use App\External\Api\Request\SupportTicket\SubmitTicketRequest;
use App\External\Api\Resources\V1\SupportTicket\SupportTicketSummaryResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class StoreTicketController extends Controller
{
    public function __construct(
        private SubmitTicketAction $submitTicket,
    ) {
    }

    public function __invoke(SubmitTicketRequest $request): JsonResponse
    {
        $ticket = $this->submitTicket->execute(
            SubmitTicketDto::fromRequest(
                request: $request,
                municipalId: app('municipal_id'),
                audience: TicketAudience::CITIZEN,
            ),
        );

        return response()->json([
            'message' => 'Support ticket submitted successfully.',
            'data' => (new SupportTicketSummaryResource($ticket))->resolve($request),
        ], 201);
    }
}
