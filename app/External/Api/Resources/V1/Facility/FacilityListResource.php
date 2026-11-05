<?php

namespace App\External\Api\Resources\V1\Facility;

use App\External\Api\Resources\Facility\FacilityBaseResource;
use Illuminate\Http\Request;

class FacilityListResource extends FacilityBaseResource
{
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'updated_at' => $this->updated_at?->setTimezone('Asia/Manila')->toAtomString(),
        ];
    }
}
