<?php

namespace App\External\Api\Resources\Facility;

use Illuminate\Http\Request;

class AdminFacilityListResource extends FacilityBaseResource
{
    public function toArray(Request $request): array
    {
        return [...parent::toArray($request), 'is_published' => $this->is_published, 'revision' => $this->revision,
            'operating_status' => $this->operating_status->value];
    }
}
