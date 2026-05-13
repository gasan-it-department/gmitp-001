<?php

namespace App\External\Api\Resources\ActionCenter;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssistanceTypeDetailsResource extends JsonResource
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
            'slug' => $this->slug,
            'name' => $this->name,
            'description' => $this->description ?? '',
            'is_active' => (bool) $this->is_active,
            'max_amount' => $this->max_amount !== null ? (float) $this->max_amount : null,
            'min_amount' => (float) $this->min_amount,
            'cooldown_months' => (int) $this->cooldown_months,
            'cooldown_type' => $this->cooldown_type,
            'cooldown_scope' => $this->cooldown_scope,

            // Required + optional documents for the upload form.
            // Eager-load `documents` in the action to avoid N+1.
            'documents' => $this->whenLoaded('documents', function () {
                return $this->documents
                    ->sortBy(fn($doc) => $doc->pivot->sort_order ?? 0)
                    ->values()
                    ->map(fn($doc) => [
                        'id' => $doc->id,
                        'key' => $doc->key,                       // used as the form input name + storage collection
                        'name' => $doc->label,
                        'description' => $doc->description,
                        'examples' => $doc->examples,
                        'is_required' => (bool) $doc->pivot->is_required,
                    ]);
            }, []),
        ];
    }
}
