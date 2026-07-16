<?php

namespace App\External\Api\Controllers\V1\SupportTicket;

use App\Core\SupportTicket\Actions\ReopenMyTicketAction;
use App\Core\SupportTicket\Dto\ReopenTicketDto;
use App\Core\SupportTicket\Exceptions\InvalidStateTransitionException;
use App\External\Api\Resources\V1\SupportTicket\SupportTicketSummaryResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReopenTicketController extends Controller
{
    public function __construct(
        private ReopenMyTicketAction $reopenTicket,
    ) {
    }

    public function __invoke(Request $request, string $support_ticket): JsonResponse
    {
        try {
            $ticket = $this->reopenTicket->execute(
                new ReopenTicketDto(
                    municipalId: app('municipal_id'),
                    ticketId: $support_ticket,
                    actorUserId: $request->user()->id,
                ),
            );
        } catch (InvalidStateTransitionException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => [
                    'status' => [$exception->getMessage()],
                ],
            ], 422);
        }

        return response()->json([
            'message' => 'Support ticket reopened successfully.',
            'data' => (new SupportTicketSummaryResource($ticket))->resolve($request),
        ]);
    }
}
