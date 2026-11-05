<?php

namespace App\External\Api\Resources\V1\Facility;

use App\External\Api\Resources\Facility\ClientFacilityDetailsResource;
use Illuminate\Http\Request;

class FacilityDetailsResource extends ClientFacilityDetailsResource
{
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'updated_at' => $this->updated_at?->setTimezone('Asia/Manila')->toAtomString(),
        ];
    }
}
