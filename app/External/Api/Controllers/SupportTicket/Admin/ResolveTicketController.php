<?php

namespace App\External\Api\Controllers\SupportTicket\Admin;

use App\Core\SupportTicket\Actions\ResolveTicketAction;
use App\Core\SupportTicket\Dto\ResolveTicketDto;
use App\External\Api\Request\SupportTicket\Admin\ResolveTicketRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class ResolveTicketController extends Controller
{
    public function __construct(
        private ResolveTicketAction $resolveTicket,
    ) {
    }

    public function __invoke(ResolveTicketRequest $request, string $ticketId): RedirectResponse
    {
        $this->resolveTicket->execute(
            new ResolveTicketDto(
                municipalId: app('municipal_id'),
                ticketId: $ticketId,
                actorUserId: $request->user()->id,
                resolutionNote: $request->string('resolution_note')->toString(),
            )
        );

        return back()->with('success', 'Ticket resolved.');
    }
}
