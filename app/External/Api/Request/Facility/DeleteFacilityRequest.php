<?php

namespace App\External\Api\Request\Facility;


class DeleteFacilityRequest extends FacilityMutationRequest
{
    protected string $ability = 'facility.delete';

    public function rules(): array
    {
        return [...parent::rules(),
            
        ];
    }
}
