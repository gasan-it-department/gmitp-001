<?php

namespace App\External\Web\Controllers\SupportTicket\Client;

use App\Core\SupportTicket\Actions\CheckEligibilityToSubmitTicketAction;
use App\Core\SupportTicket\Enums\TicketCategory;
use App\Core\SupportTicket\Enums\TicketPriority;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CreateTicketController extends Controller
{
    public function __construct(
        private CheckEligibilityToSubmitTicketAction $checkEligibility,
    ) {
    }

    public function __invoke(): Response
    {
        return Inertia::render('SupportTicket/Client/Create', [
            'categories'  => TicketCategory::toOptions(),
            'priorities'  => TicketPriority::toOptions(),
            'is_eligible' => $this->checkEligibility->execute(Auth::id(), app('municipal_id')),
        ]);
    }
}
