<?php

namespace App\External\Api\Resources\V1\SupportTicket;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupportTicketSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
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
            ],
            'subject' => $this->subject,
            'created_at' => $this->created_at?->format('M d, Y g:i A'),
        ];
    }
}
