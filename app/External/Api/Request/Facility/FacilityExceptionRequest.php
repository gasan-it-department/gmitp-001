<?php

namespace App\External\Api\Request\Facility;

use Illuminate\Validation\Rule;
use App\Core\Facility\Enums\FacilityNoticeType;

abstract class FacilityExceptionRequest extends FacilityMutationRequest
{
    protected string $ability = 'facility.manage';

    public function rules(): array
    {
        return [...parent::rules(),
            'notify_mobile' => ['sometimes', 'boolean'],
            'exception_date' => ['required', 'date_format:Y-m-d'], 'end_date' => ['nullable', 'date_format:Y-m-d'],
            'notice_type' => ['required', Rule::enum(FacilityNoticeType::class)], 'is_closed' => ['required', 'boolean'],
            'public_notice' => ['required', 'string', 'max:2000'], 'periods' => ['present', 'array', 'max:12'],
        ];
    }
}
