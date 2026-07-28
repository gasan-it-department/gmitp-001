<?php

namespace App\External\Api\Resources\ActionCenter;

use App\Core\ActionCenter\Enums\PhysicalCopyRequirement;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Override;

class RequiredDocumentResource extends JsonResource
{
    #[Override]
    public function toArray(Request $request)
    {
        $physicalCopyRequirement = PhysicalCopyRequirement::tryFrom(
            (string) ($this->pivot->physical_copy_requirement ?? ''),
        ) ?? PhysicalCopyRequirement::Unspecified;

        return [
            'key' => $this->key,
            'label' => $this->label,
            'description' => $this->description,
            'is_required' => (bool) $this->pivot->is_required,
            'physical_copy_requirement' => $physicalCopyRequirement->value,
            'physical_copy_requirement_label' => $physicalCopyRequirement->label(),
            'sort_order' => (int) ($this->pivot->sort_order ?? 0),
        ];
    }
}
