<?php

namespace App\External\Api\Controllers\V1\SupportTicket;

use App\Core\SupportTicket\Actions\ReplyToMyTicketAction;
use App\Core\SupportTicket\Dto\ReplyToTicketDto;
use App\External\Api\Request\SupportTicket\ReplyToTicketRequest;
use App\External\Api\Resources\V1\SupportTicket\SupportTicketReplyResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class StoreTicketReplyController extends Controller
{
    public function __construct(
        private ReplyToMyTicketAction $replyToMyTicket,
    ) {
    }

    public function __invoke(ReplyToTicketRequest $request, string $support_ticket): JsonResponse
    {
        $reply = $this->replyToMyTicket->execute(
            new ReplyToTicketDto(
                municipalId: app('municipal_id'),
                ticketId: $support_ticket,
                userId: $request->user()->id,
                isStaff: false,
                body: $request->string('body')->toString(),
                attachments: $request->file('attachments', []) ?? [],
            ),
        );

        return response()->json([
            'message' => 'Reply sent successfully.',
            'data' => (new SupportTicketReplyResource($reply))->resolve($request),
        ], 201);
    }
}
