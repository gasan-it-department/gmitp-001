<?php

namespace App\Core\SupportTicket\Actions;

use App\Core\SupportTicket\Models\SupportTicket;
use Illuminate\Support\Facades\Auth;

class GetMyTicketDetailsAction
{
    public function execute(string $ticketId): SupportTicket
    {
        return SupportTicket::query()
            ->with([
                'media',
                'replies' => fn ($query) => $query
                    ->orderBy('created_at')
                    ->with(['user:id,first_name,last_name', 'media']),
            ])
            ->where('municipal_id', app('municipal_id'))
            ->where('user_id', Auth::id())
            ->whereKey($ticketId)
            ->firstOrFail();
    }
}
