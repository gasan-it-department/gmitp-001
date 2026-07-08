<?php

namespace App\External\Api\Resources\V1\SupportTicket;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupportTicketReplyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'is_staff' => (bool) $this->is_staff,
            'body' => $this->body,
            'author' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'full_name' => $this->user->full_name,
            ] : null),
            'attachments' => $this->getMedia('support_ticket_reply_attachments')
                ->map(fn ($media) => [
                    'id' => $media->id,
                    'name' => $media->file_name,
                    'mime_type' => $media->mime_type,
                    'size' => $media->size,
                    'url' => $media->disk === 's3'
                        ? $media->getTemporaryUrl(now()->addMinutes(15))
                        : $media->getUrl(),
                ])
                ->values(),
            'created_at' => $this->created_at?->format('M d, Y g:i A'),
        ];
    }
}
