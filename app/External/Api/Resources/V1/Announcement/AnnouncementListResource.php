<?php

namespace App\External\Api\Resources\V1\Announcement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class AnnouncementListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $cover = $this->getMedia('announcement_images')->first();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'type' => [
                'value' => $this->type->value,
                'label' => $this->type->label(),
            ],
            'excerpt' => Str::limit(strip_tags($this->content), 120),
            'cover_image_url' => $cover
                ? ($cover->disk === 's3'
                    ? $cover->getTemporaryUrl(now()->addMinutes(15), 'optimized')
                    : $cover->getUrl('optimized'))
                : null,
            'created_at' => $this->created_at?->format('M d, Y g:i A'),
        ];
    }
}
