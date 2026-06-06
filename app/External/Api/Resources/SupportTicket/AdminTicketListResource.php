<?php

namespace App\External\Api\Resources\SupportTicket;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin-facing list row for the support queue. Includes the requester's
 * real name for accountability; guest tickets fall back to the encrypted
 * contact name resolved on the detail view only.
 */
class AdminTicketListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'reference_no' => $this->reference_no,
            'audience'     => [
                'value' => $this->audience->value,
                'label' => $this->audience->label(),
            ],
            'category'     => [
                'value' => $this->category->value,
                'label' => $this->category->label(),
            ],
            'priority'     => [
                'value' => $this->priority->value,
                'label' => $this->priority->label(),
            ],
            'status'       => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
            ],
            'subject'      => $this->subject,
            'requester'    => $this->whenLoaded('user', fn () => $this->user ? [
                'id'        => $this->user->id,
                'full_name' => $this->user->full_name,
            ] : null),
            'created_at'   => $this->created_at?->format('M d, Y g:i A'),
        ];
    }
}
