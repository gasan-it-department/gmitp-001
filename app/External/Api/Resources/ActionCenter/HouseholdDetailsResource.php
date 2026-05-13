<?php

namespace App\External\Api\Resources\ActionCenter;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Serialises the citizen's household address for the Apply form.
 *
 * The `municipality` column was dropped from ac_households (redundant with
 * the municipal_id FK), so the display value is sourced from the current
 * tenant context instead.
 */
class HouseholdDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'barangay' => $this->barangay,
            'barangay_psgc_code' => $this->barangay_psgc_code,
            'street' => $this->street,
        ];
    }
}
