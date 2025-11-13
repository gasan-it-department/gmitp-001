<?php

namespace App\External\Api\Resources\BulletinBoard;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

        return [
            'id' => $this->id,
            'title' => $this->title,
            'message' => $this->message,
            'is_published' => $this->is_published,
            'created_at' => $this->created_at,
        ];

    }
}
