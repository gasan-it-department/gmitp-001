<?php

namespace App\External\Api\Resources\V1\Event;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $banner = $this->getFirstMedia('event_banner');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'type' => [
                'value' => $this->type->value,
                'label' => $this->type->label(),
            ],
            'description' => $this->description,
            'start_datetime' => $this->start_datetime?->format('M d, Y g:i A'),
            'end_datetime' => $this->end_datetime?->format('M d, Y g:i A'),
            'location_name' => $this->location_name,
            'banner_url' => $banner
                ? ($banner->disk === 's3'
                    ? $banner->getTemporaryUrl(now()->addMinutes(15))
                    : $banner->getUrl())
                : null,
            'created_at' => $this->created_at?->format('M d, Y g:i A'),
        ];
    }
}
