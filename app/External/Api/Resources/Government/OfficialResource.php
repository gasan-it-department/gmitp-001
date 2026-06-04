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

        $portrait = $this->getFirstMedia('official_portrait');
        $profileUrl = $portrait
            ? ($portrait->disk === 's3'
                ? $portrait->getTemporaryUrl(now()->addMinutes(15), 'optimized')
                : $portrait->getUrl('optimized'))
            : null;

        return [
            'id' => $this->id,

            'first_name' => $this->first_name,

            'last_name' => $this->last_name,

            'middle_name' => $this->middle_name,

            'suffix' => $this->suffix,

            'gender' => $this->gender,

            'biography' => $this->biography,

            'profile_url' => $profileUrl,

            'formatted_name' => $this->full_name_with_title,

            'appointments_count' => $this->appointments_count,

            'active_appointments_exists' => (bool) $this->active_appointments_exists,

            'appointments' => OfficialTermResource::collection($this->whenLoaded('appointments')),
        ];

    }
}
