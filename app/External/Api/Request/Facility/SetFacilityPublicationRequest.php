<?php

namespace App\External\Api\Request\Facility;


class SetFacilityPublicationRequest extends FacilityMutationRequest
{
    protected string $ability = 'facility.publish';

    public function rules(): array
    {
        return [...parent::rules(),
            'is_published' => ['required', 'boolean'],
        ];
    }
}
