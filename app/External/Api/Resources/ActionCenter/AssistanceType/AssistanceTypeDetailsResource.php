<?php

namespace App\External\Api\Resources\ActionCenter\AssistanceType;

use App\Core\ActionCenter\Contracts\AssistanceRequestFormDefinitionProvider;
use App\Core\ActionCenter\Enums\PhysicalCopyRequirement;
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
            'min_amount' => $this->min_amount !== null ? (float) $this->min_amount : null,
            'cooldown_months' => (int) $this->cooldown_months,
            'cooldown_type' => $this->cooldown_type,
            'cooldown_scope' => $this->cooldown_scope,
            'request_form' => $this->requestFormDefinition(),
            'enabled_generated_documents' => $this->generatedDocumentValues(),

            // Required + optional documents for the public checklist and the
            // admin-controlled document intake flow.
            // Eager-load `documents` in the action to avoid N+1.
            'documents' => $this->whenLoaded('documents', function () {
                return $this->documents
                    ->sortBy(fn ($doc) => $doc->pivot->sort_order ?? 0)
                    ->values()
                    ->map(function ($doc) {
                        $physicalCopyRequirement = PhysicalCopyRequirement::tryFrom(
                            (string) ($doc->pivot->physical_copy_requirement ?? ''),
                        ) ?? PhysicalCopyRequirement::Unspecified;

                        return [
                            'id' => $doc->id,
                            'key' => $doc->key,
                            'name' => $doc->label,
                            'description' => $doc->description,
                            'examples' => $doc->examples,
                            'is_required' => (bool) $doc->pivot->is_required,
                            'physical_copy_requirement' => $physicalCopyRequirement->value,
                            'physical_copy_requirement_label' => $physicalCopyRequirement->label(),
                        ];
                    });
            }, []),
        ];
    }

    private function requestFormDefinition(): array
    {
        $municipalCode = app()->bound('current_municipality')
            ? app('current_municipality')->municipal_code
            : null;

        return app(AssistanceRequestFormDefinitionProvider::class)
            ->for($municipalCode, $this->slug)
            ->toArray();
    }
}
