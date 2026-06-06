<?php

namespace App\External\Api\Controllers\SupportTicket\Admin;

use App\Core\SupportTicket\Actions\AcknowledgeTicketAction;
use App\Core\SupportTicket\Dto\AcknowledgeTicketDto;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AcknowledgeTicketController extends Controller
{
    public function __construct(
        private AcknowledgeTicketAction $acknowledgeTicket,
    ) {
    }

    public function __invoke(Request $request, string $ticketId): RedirectResponse
    {
        $this->acknowledgeTicket->execute(
            new AcknowledgeTicketDto(
                municipalId: app('municipal_id'),
                ticketId: $ticketId,
                actorUserId: $request->user()->id,
            )
        );

        return back()->with('success', 'Ticket acknowledged.');
    }
}
