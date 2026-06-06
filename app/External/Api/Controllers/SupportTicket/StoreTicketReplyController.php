<?php

namespace App\External\Api\Controllers\SupportTicket;

use App\Core\SupportTicket\Actions\ReplyToTicketAction;
use App\Core\SupportTicket\Dto\ReplyToTicketDto;
use App\Core\Users\Services\UserRoleCheckerService;
use App\External\Api\Request\SupportTicket\ReplyToTicketRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StoreTicketReplyController extends Controller
{
    public function __construct(
        private ReplyToTicketAction $replyToTicket,
        private UserRoleCheckerService $roleChecker,
    ) {
    }

    public function __invoke(ReplyToTicketRequest $request, string $ticketId): RedirectResponse
    {
        $user = $request->user();
        $isStaff = $user && ($this->roleChecker->isAdmin($user) || $this->roleChecker->isSuperAdmin($user));

        $this->replyToTicket->execute(
            new ReplyToTicketDto(
                municipalId: app('municipal_id'),
                ticketId: $ticketId,
                userId: $user?->id,
                isStaff: $isStaff,
                body: $request->string('body')->toString(),
                attachments: $request->file('attachments', []) ?? [],
            )
        );

        return back()->with('success', 'Reply sent.');
    }
}
