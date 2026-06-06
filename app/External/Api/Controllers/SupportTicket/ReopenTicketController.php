<?php

namespace App\External\Api\Controllers\SupportTicket;

use App\Core\SupportTicket\Actions\ReopenTicketAction;
use App\Core\SupportTicket\Dto\ReopenTicketDto;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReopenTicketController extends Controller
{
    public function __construct(
        private ReopenTicketAction $reopenTicket,
    ) {
    }

    public function __invoke(Request $request, string $ticketId): RedirectResponse
    {
        $this->reopenTicket->execute(
            new ReopenTicketDto(
                municipalId: app('municipal_id'),
                ticketId: $ticketId,
                actorUserId: $request->user()?->id,
            )
        );

        return back()->with('success', 'Ticket reopened.');
    }
}
