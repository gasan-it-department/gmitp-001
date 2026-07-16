<?php

namespace App\External\Api\Request\ActionCenter\Household;

use App\Core\ActionCenter\Enums\HeadDepartureDisposition;
use App\Core\ActionCenter\Enums\Relationship;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangeHouseholdHeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'successor_member_id' => ['nullable', 'ulid', 'exists:ac_household_members,id'],
            'current_head_disposition' => [
                'nullable',
                Rule::enum(HeadDepartureDisposition::class),
            ],
            'former_head_relationship' => [
                'nullable',
                Rule::enum(Relationship::class),
                Rule::notIn([Relationship::Head->value]),
                'required_if:current_head_disposition,'.HeadDepartureDisposition::RemainsMember->value,
            ],
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ];
    }
}
