<?php

namespace App\Core\SupportTicket\Actions;

use App\Core\SupportTicket\Models\SupportTicket;

class CheckEligibilityToSubmitTicketAction
{
    private const DAILY_LIMIT = 5;

    /**
     * Check if a user is allowed to submit a new support ticket.
     * Logic: Max 5 tickets per user per municipality per day.
     * Guests (no user id) are not rate-limited here and should be throttled
     * at the HTTP layer instead.
     */
    public function execute(?string $userId, string $municipalId): bool
    {
        if ($userId === null) {
            return true;
        }

        $count = SupportTicket::query()
            ->where('municipal_id', $municipalId)
            ->where('user_id', $userId)
            ->whereDate('created_at', now()->toDateString())
            ->count();

        return $count < self::DAILY_LIMIT;
    }
}
