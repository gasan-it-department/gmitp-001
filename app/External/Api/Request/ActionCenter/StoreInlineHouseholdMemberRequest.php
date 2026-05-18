<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates the inline "Add a new family member" form on the Apply page.
 *
 * Only the fields the citizen can practically know about a relative are
 * required (name + relationship). The admin completes the rest during the
 * interview.
 */
class StoreInlineHouseholdMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name'   => ['required', 'string', 'max:100'],
            'last_name'    => ['required', 'string', 'max:100'],
            'middle_name'  => ['nullable', 'string', 'max:100'],
            'suffix'       => ['nullable', 'string', 'max:20'],
            'relationship' => ['required', 'in:spouse,parent,child,sibling'],
            'birth_date'   => ['nullable', 'date', 'before_or_equal:today'],
            'sex'          => ['nullable', 'in:male,female'],
        ];
    }
}
