<?php

namespace App\External\Api\Resources\Announcement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementBaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'type'         => [
                'value' => $this->type->value,
                'label' => $this->type->label(),
            ],
            'is_published' => (bool) $this->is_published,
            'created_at'   => $this->created_at?->format('M d, Y g:i A'),
        ];
    }
}
