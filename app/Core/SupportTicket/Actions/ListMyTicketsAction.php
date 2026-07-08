<?php

namespace App\Core\SupportTicket\Actions;

use App\Core\SupportTicket\Models\SupportTicket;
use Illuminate\Support\Facades\Auth;

class ListMyTicketsAction
{
    public function execute(int $perPage = 10)
    {
        return SupportTicket::query()
            ->select(['id', 'reference_no', 'category', 'priority', 'status', 'subject', 'created_at'])
            ->where('municipal_id', app('municipal_id'))
            ->where('user_id', Auth::id())
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->through(fn (SupportTicket $t) => [
                'id' => $t->id,
                'reference_no' => $t->reference_no,
                'category' => [
                    'value' => $t->category->value,
                    'label' => $t->category->label(),
                ],
                'priority' => [
                    'value' => $t->priority->value,
                    'label' => $t->priority->label(),
                ],
                'status' => [
                    'value' => $t->status->value,
                    'label' => $t->status->label(),
                ],
                'subject' => $t->subject,
                'created_at' => $t->created_at?->format('M d, Y g:i A'),
            ]);
    }
}
