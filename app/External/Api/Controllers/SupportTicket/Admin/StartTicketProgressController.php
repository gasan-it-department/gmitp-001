<?php

namespace App\External\Api\Controllers\SupportTicket\Admin;

use App\Core\SupportTicket\Actions\StartTicketProgressAction;
use App\Core\SupportTicket\Dto\StartTicketProgressDto;
use App\External\Api\Request\SupportTicket\Admin\StartTicketProgressRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StartTicketProgressController extends Controller
{
    public function __construct(
        private StartTicketProgressAction $startTicketProgress,
    ) {
    }

    public function __invoke(StartTicketProgressRequest $request, string $ticketId): RedirectResponse
    {
        $this->startTicketProgress->execute(
            new StartTicketProgressDto(
                municipalId: app('municipal_id'),
                ticketId: $ticketId,
                actorUserId: $request->user()->id,
                assignedTo: $request->filled('assigned_to') ? $request->string('assigned_to')->toString() : null,
            )
        );

        return back()->with('success', 'Ticket moved to in progress.');
    }
}
