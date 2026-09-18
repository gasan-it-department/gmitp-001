<?php

namespace App\External\Api\Request\ActionCenter\Household;

use App\Core\ActionCenter\Enums\Relationship;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Payload for the "moved out / moved back in" toggle on a household member.
 * The coarse admin gate is enforced by the route middleware group.
 */
class SetHouseholdMemberActiveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_active' => ['required', 'boolean'],
            'relationship' => [
                'nullable',
                Rule::enum(Relationship::class),
                Rule::notIn([Relationship::Head->value]),
            ],
        ];
    }
}
