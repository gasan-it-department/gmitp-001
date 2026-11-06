<?php

namespace App\External\Api\Request\Facility;

use Illuminate\Validation\Rule;
use App\Core\Facility\Enums\FacilityOperatingStatus;

class SetFacilityOperatingStatusRequest extends FacilityMutationRequest
{
    protected string $ability = 'facility.manage';

    public function rules(): array
    {
        return [...parent::rules(),
            'notify_mobile' => ['sometimes', 'boolean'],
            'operating_status' => ['required', Rule::enum(FacilityOperatingStatus::class)],
            'operating_notice' => ['nullable', 'string', 'max:2000', 'required_unless:operating_status,following_schedule'],
            'expected_reopens_at' => ['nullable', 'date_format:Y-m-d\\TH:i', 'after:now'],
            'today_exception' => ['nullable', 'array'],
        ];
    }
}
