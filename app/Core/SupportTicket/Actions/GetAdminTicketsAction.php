<?php

namespace App\Core\SupportTicket\Actions;

use App\Core\SupportTicket\Models\SupportTicket;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class GetAdminTicketsAction
{
    /**
     * Paginate support tickets for the given tenant, newest first.
     * Eager loads the requester so the resource can read full_name.
     */
    public function execute(string $municipalId, int $perPage = 20): LengthAwarePaginator
    {
        return SupportTicket::query()
            ->with('user:id,first_name,last_name')
            ->where('municipal_id', $municipalId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
