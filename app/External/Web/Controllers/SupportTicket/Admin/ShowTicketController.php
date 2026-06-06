<?php

namespace App\External\Web\Controllers\SupportTicket\Admin;

use App\Core\SupportTicket\Actions\GetAdminTicketDetailsAction;
use App\External\Api\Resources\SupportTicket\AdminTicketDetailsResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ShowTicketController extends Controller
{
    public function __construct(
        private GetAdminTicketDetailsAction $getTicketDetails,
    ) {
    }

    /**
     * $municipal is the URL slug — already validated by municipalityContext
     * middleware which set app('municipal_id'). We ignore it here and rely
     * on the canonical tenant id.
     */
    public function __invoke(string $municipal, string $support_ticket): Response
    {
        $ticket = $this->getTicketDetails->execute(
            municipalId: app('municipal_id'),
            ticketId: $support_ticket,
        );

        return Inertia::render('SupportTicket/Admin/Details/TicketDetails', [
            'ticket' => (new AdminTicketDetailsResource($ticket))->resolve(),
        ]);
    }
}
