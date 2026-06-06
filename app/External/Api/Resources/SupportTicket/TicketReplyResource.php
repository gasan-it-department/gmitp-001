<?php

namespace App\External\Api\Resources\SupportTicket;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A single message on a ticket thread. is_staff drives left/right bubble
 * alignment on the frontend; author name is shown for staff replies and
 * omitted for the requester's own messages.
 */
class TicketReplyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'is_staff'    => (bool) $this->is_staff,
            'body'        => $this->body,
            'author'      => $this->whenLoaded('user', fn () => $this->user ? [
                'id'        => $this->user->id,
                'full_name' => $this->user->full_name,
            ] : null),
            'attachments' => $this->getMedia('support_ticket_reply_attachments')->map(fn ($m) => [
                'id'        => $m->id,
                'name'      => $m->file_name,
                'mime_type' => $m->mime_type,
                'size'      => $m->size,
                'url'       => $m->disk === 's3'
                    ? $m->getTemporaryUrl(now()->addMinutes(15))
                    : $m->getUrl(),
            ])->values(),
            'created_at'  => $this->created_at?->format('M d, Y g:i A'),
        ];
    }
}
