<?php

namespace App\External\Api\Resources\BulletinBoard;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventsResource extends JsonResource
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

            'description' => $this->description,

            'event_date' => $this->event_date,

            'created_at' => $this->created_at,

            'author' => $this->whenLoaded('user', function ($user) {

                return [

                    'id' => $user->id,

                    'name' => $user->first_name . ' ' . $user->last_name,

                ];

            }),
        ];

    }
}
