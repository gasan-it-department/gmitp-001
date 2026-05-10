<?php

namespace App\External\Api\Resources\ActionCenter;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssistanceTypeDetails extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description ?? '',
            'is_active' => (bool) $this->is_active,
            'max_amount' => (float) $this->max_amount,
            'cooldown_months' => (int) $this->cooldown_months,

            // 🎯 SENIOR MOVE: Safe Relationship Mapping
            // Check if documents are loaded before trying to map them to prevent N+1 queries.
            'documents' => $this->whenLoaded('documents', function () {
                return $this->documents->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'name' => $doc->label,
                        'is_required' => (bool) $doc->pivot->is_required,
                    ];
                });
            }, []),
        ];
    }
}