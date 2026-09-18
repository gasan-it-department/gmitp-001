<?php

namespace App\External\Api\Request\ActionCenter\Household;

use Illuminate\Foundation\Http\FormRequest;

final class SearchHouseholdBeneficiaryCandidatesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'q' => ['required', 'string', 'min:3', 'max:120'],
        ];
    }
}
