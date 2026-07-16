<?php

namespace App\External\Api\Resources\ActionCenter\AssistanceType;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssistanceTypeListResource extends JsonResource
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
            'slug' => $this->slug, // used by the portal card to link to /apply/{slug}

            'name' => $this->name,
            'description' => $this->description,
            'is_active' => (bool) $this->is_active,
            'max_amount' => $this->max_amount !== null ? (float) $this->max_amount : null,
            'cooldown_months' => (int) $this->cooldown_months,

            // 🎯 SENIOR MOVE: The Safe Count
            // Eloquent's withCount('documents') automatically creates a 'documents_count' attribute.
            // The null coalescing operator (?? 0) ensures that if another developer forgets 
            // to add withCount() to their query, the frontend gets a safe 0 instead of a crash.
            'requirements_count' => $this->documents_count ?? 0,
        ];
    }
}
