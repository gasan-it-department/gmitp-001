<?php

namespace App\External\Api\Request\ActionCenter\Beneficiary;

use App\Core\ActionCenter\Enums\Sex;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates the admin beneficiary-search filters.
 *
 * Authorisation is handled by the route middleware stack
 * (municipalityContext + admin + permission:action_center.access), so
 * authorize() simply returns true — by the time we reach here the caller is a
 * verified admin scoped to the current municipality.
 *
 * Every field is nullable: an empty payload is a valid "no search yet" state.
 * The action returns an empty result set in that case rather than dumping the
 * whole directory.
 */
class SearchBeneficiaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Free-text name search (multi-word, order-independent — see action).
            'search'     => ['nullable', 'string', 'max:100'],

            // Exact birthdate narrows misspelled-name matches hard.
            'birth_date' => ['nullable', 'date', 'before_or_equal:today'],

            // Partial barangay match.
            'barangay'   => ['nullable', 'string', 'max:100'],

            'sex'        => ['nullable', Rule::in($this->sexValues())],

            'per_page'   => ['nullable', 'integer', 'min:5', 'max:50'],
        ];
    }

    /** @return array<int, string> */
    private function sexValues(): array
    {
        return array_map(fn (Sex $case) => $case->value, Sex::cases());
    }
}
