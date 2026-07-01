<?php

namespace App\External\Api\Resources\V1\Event;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class EventListResource extends JsonResource
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
            'excerpt' => Str::limit(strip_tags($this->description), 120),
            'start_datetime' => $this->start_datetime?->format('M d, Y g:i A'),
            'end_datetime' => $this->end_datetime?->format('M d, Y g:i A'),
            'location_name' => $this->location_name,
            'banner_url' => $banner
                ? ($banner->disk === 's3'
                    ? $banner->getTemporaryUrl(now()->addMinutes(15), 'optimized')
                    : $banner->getUrl('optimized'))
                : null,
            'created_at' => $this->created_at?->format('M d, Y g:i A'),
        ];
    }
}
