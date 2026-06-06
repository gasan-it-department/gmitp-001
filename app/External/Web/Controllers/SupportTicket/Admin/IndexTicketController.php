<?php

namespace App\External\Web\Controllers\SupportTicket\Admin;

use App\Core\SupportTicket\Actions\GetAdminTicketsAction;
use App\External\Api\Resources\SupportTicket\AdminTicketListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IndexTicketController extends Controller
{
    public function __construct(
        private GetAdminTicketsAction $listTickets,
    ) {
    }

    public function __invoke(): Response
    {
        $tickets = $this->listTickets->execute(
            municipalId: app('municipal_id'),
            perPage: 20,
        );

        return Inertia::render('SupportTicket/Admin/List/SupportTicketsPage', [
            'tickets' => AdminTicketListResource::collection($tickets),
        ]);
    }
}
