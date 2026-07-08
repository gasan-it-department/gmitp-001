<?php

namespace App\External\Api\Controllers\V1\SupportTicket;

use App\Core\SupportTicket\Actions\GetMyTicketDetailsAction;
use App\External\Api\Resources\V1\SupportTicket\SupportTicketDetailsResource;
use App\Http\Controllers\Controller;

class ShowTicketController extends Controller
{
    public function __construct(
        private GetMyTicketDetailsAction $getMyTicketDetails,
    ) {
    }

    public function __invoke(string $support_ticket): SupportTicketDetailsResource
    {
        return new SupportTicketDetailsResource(
            $this->getMyTicketDetails->execute($support_ticket),
        );
    }
}
