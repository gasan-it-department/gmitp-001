<?php

namespace App\External\Api\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserSocialAccountResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'provider_name' => $this->provider_name,
            'avatar_url'    => $this->avatar_url,
            'linked_at'     => $this->created_at->toDateString(),
        ];
    }
}
