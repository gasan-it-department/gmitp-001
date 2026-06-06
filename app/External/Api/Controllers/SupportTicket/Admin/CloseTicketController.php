<?php

namespace App\External\Api\Controllers\SupportTicket\Admin;

use App\Core\SupportTicket\Actions\CloseTicketAction;
use App\Core\SupportTicket\Dto\CloseTicketDto;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CloseTicketController extends Controller
{
    public function __construct(
        private CloseTicketAction $closeTicket,
    ) {
    }

    public function __invoke(Request $request, string $ticketId): RedirectResponse
    {
        $this->closeTicket->execute(
            new CloseTicketDto(
                municipalId: app('municipal_id'),
                ticketId: $ticketId,
                actorUserId: $request->user()->id,
            )
        );

        return back()->with('success', 'Ticket closed.');
    }
}
