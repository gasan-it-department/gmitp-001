<?php

namespace App\External\Api\Resources\Event;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventBaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'title'          => $this->title,
            'type'           => [
                'value' => $this->type->value,
                'label' => $this->type->label(),
            ],
            'is_published'   => (bool) $this->is_published,
            'start_datetime' => $this->start_datetime?->format('M d, Y g:i A'),
            'end_datetime'   => $this->end_datetime?->format('M d, Y g:i A'),
            'location_name'  => $this->location_name,
            'created_at'     => $this->created_at?->format('M d, Y g:i A'),
        ];
    }
}
