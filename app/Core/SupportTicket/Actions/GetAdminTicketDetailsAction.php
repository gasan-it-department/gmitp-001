<?php

namespace App\Core\SupportTicket\Actions;

use App\Core\SupportTicket\Models\SupportTicket;

class GetAdminTicketDetailsAction
{
    /**
     * Fetch a single ticket for the admin detail view, strictly tenant-scoped.
     *
     * Uses whereKey + firstOrFail (NOT findOrFail) so the tenant scope is
     * preserved — a cross-tenant ID 404s instead of leaking record existence.
     */
    public function execute(string $municipalId, string $ticketId): SupportTicket
    {
        return SupportTicket::query()
            ->with([
                'user:id,first_name,last_name',
                'media',
                'replies' => fn ($q) => $q->orderBy('created_at')->with(['user:id,first_name,last_name', 'media']),
                'activities',
            ])
            ->where('municipal_id', $municipalId)
            ->whereKey($ticketId)
            ->firstOrFail();
    }
}
