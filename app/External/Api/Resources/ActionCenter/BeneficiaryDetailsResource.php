<?php

namespace App\External\Api\Resources\ActionCenter;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Serialises the authenticated citizen's identity for the Apply form.
 *
 * Used as a read-only block — the citizen cannot edit these fields
 * inline on the apply page. They follow an "Edit profile" link to amend.
 *
 * NOTE: Inertia reads JsonResource via jsonSerialize() → resolve(),
 * which does NOT add a "data" wrapper, so no withoutWrapping() needed.
 */
class BeneficiaryDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,   // getFullNameAttribute() accessor
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'suffix' => $this->suffix,
            'sex' => $this->sex,
            'birth_date' => $this->birth_date?->toDateString(),
            'educational_attainment' => $this->educational_attainment,
        ];
    }
}
