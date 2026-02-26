<?php

namespace App\External\Api\Resources\Government;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfficialResource extends JsonResource
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
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'middle_name' => $this->middle_name,
            'suffix' => $this->suffix,
            'gender' => $this->gender,
            'biography' => $this->biography,
            'profile_url' => $this->profile_url,
            'profile_public_id' => $this->profile_public_id,

            'formatted_name' => $this->full_name_with_title,
        ];

    }
}
