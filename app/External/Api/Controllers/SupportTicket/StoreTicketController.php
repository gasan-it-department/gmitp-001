<?php

namespace App\External\Api\Controllers\SupportTicket;

use App\Core\SupportTicket\Actions\SubmitTicketAction;
use App\Core\SupportTicket\Dto\SubmitTicketDto;
use App\Core\SupportTicket\Enums\TicketAudience;
use App\Core\Users\Services\UserRoleCheckerService;
use App\External\Api\Request\SupportTicket\SubmitTicketRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StoreTicketController extends Controller
{
    public function __construct(
        private SubmitTicketAction $submitTicket,
        private UserRoleCheckerService $roleChecker,
    ) {
    }

    public function __invoke(SubmitTicketRequest $request): RedirectResponse
    {
        $user = $request->user();
        $audience = $user && ($this->roleChecker->isAdmin($user) || $this->roleChecker->isSuperAdmin($user))
            ? TicketAudience::STAFF
            : TicketAudience::CITIZEN;

        $this->submitTicket->execute(
            SubmitTicketDto::fromRequest($request, app('municipal_id'), $audience),
        );

        return redirect()
            ->route('supportTicket.index', ['municipality' => app('current_municipality')->slug])
            ->with('success', 'Your support ticket has been submitted.');
    }
}
