<?php

namespace App\External\Api\Resources\V1\Announcement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'type' => [
                'value' => $this->type->value,
                'label' => $this->type->label(),
            ],
            'content' => $this->content,
            'created_at' => $this->created_at?->format('M d, Y g:i A'),
            'images' => $this->getMedia('announcement_images')
                ->map(fn ($media) => [
                    'url' => $media->disk === 's3'
                        ? $media->getTemporaryUrl(now()->addMinutes(15))
                        : $media->getUrl(),
                ])
                ->values(),
        ];
    }
}
