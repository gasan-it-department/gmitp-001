<?php

namespace App\External\Api\Request\Facility;


class ReplaceWeeklyHoursRequest extends FacilityMutationRequest
{
    protected string $ability = 'facility.manage';

    public function rules(): array
    {
        return [...parent::rules(),
            'days' => ['required', 'array', 'size:7'],
        ];
    }
}
