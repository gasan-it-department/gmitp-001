<?php

namespace App\External\Api\Resources\V1\SupportTicket;

use App\Core\SupportTicket\Enums\TicketStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupportTicketDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'ticket' => [
                'id' => $this->id,
                'reference_no' => $this->reference_no,
                'category' => [
                    'value' => $this->category->value,
                    'label' => $this->category->label(),
                ],
                'priority' => [
                    'value' => $this->priority->value,
                    'label' => $this->priority->label(),
                ],
                'status' => [
                    'value' => $this->status->value,
                    'label' => $this->status->label(),
                    'description' => $this->status->description(),
                ],
                'subject' => $this->subject,
                'description' => $this->description,
                'resolution_note' => $this->resolution_note,
                'can_reopen' => in_array($this->status, [TicketStatus::RESOLVED, TicketStatus::CLOSED], true),
                'created_at' => $this->created_at?->format('M d, Y g:i A'),
                'updated_at' => $this->updated_at?->format('M d, Y g:i A'),
            ],
            'attachments' => $this->getMedia('support_ticket_attachments')
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
            'replies' => $this->whenLoaded(
                'replies',
                fn () => SupportTicketReplyResource::collection($this->replies),
                [],
            ),
            'timeline' => $this->timeline(),
        ];
    }

    private function timeline(): array
    {
        return [
            [
                'key' => 'submitted',
                'label' => 'Submitted',
                'description' => 'Ticket received.',
                'at' => $this->created_at?->format('M d, Y g:i A'),
                'reached' => true,
            ],
            [
                'key' => 'acknowledged',
                'label' => 'Acknowledged',
                'description' => 'Reviewed by support staff.',
                'at' => $this->acknowledged_at?->format('M d, Y g:i A'),
                'reached' => $this->acknowledged_at !== null,
            ],
            [
                'key' => 'in_progress',
                'label' => 'In Progress',
                'description' => 'Support staff is working on it.',
                'at' => $this->in_progress_at?->format('M d, Y g:i A'),
                'reached' => $this->in_progress_at !== null,
            ],
            [
                'key' => 'resolved',
                'label' => 'Resolved',
                'description' => 'A resolution has been provided.',
                'at' => $this->resolved_at?->format('M d, Y g:i A'),
                'reached' => $this->resolved_at !== null,
            ],
            [
                'key' => 'closed',
                'label' => 'Closed',
                'description' => 'Ticket closed.',
                'at' => $this->closed_at?->format('M d, Y g:i A'),
                'reached' => $this->closed_at !== null,
            ],
            [
                'key' => 'reopened',
                'label' => 'Reopened',
                'description' => 'Requester reopened the ticket.',
                'at' => $this->reopened_at?->format('M d, Y g:i A'),
                'reached' => $this->reopened_at !== null,
            ],
        ];
    }
}
