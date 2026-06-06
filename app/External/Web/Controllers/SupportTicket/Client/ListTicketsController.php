<?php

namespace App\External\Web\Controllers\SupportTicket\Client;

use App\Core\SupportTicket\Actions\ListMyTicketsAction;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ListTicketsController extends Controller
{
    public function __construct(
        protected ListMyTicketsAction $listMyTicketsAction,
    ) {
    }

    public function __invoke(): Response
    {
        $tickets = $this->listMyTicketsAction->execute();

        return Inertia::render('SupportTicket/Client/List', [
            'tickets' => $tickets,
        ]);
    }
}
