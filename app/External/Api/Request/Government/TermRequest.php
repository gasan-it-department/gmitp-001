<?php

namespace App\External\Api\Request\Government;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class TermRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $municipalId = app('municipal_id');
        // If you are editing, you need the current term ID to ignore it
        $termId = $this->route('termId');

        return [
            'name' => [
                'required',
                'string',
                'max:100',
                // Check uniqueness ONLY within the same municipality
                Rule::unique('gov_terms', 'name')
                    ->where('municipal_id', $municipalId)
                    ->ignore($termId)
            ],

            'statutory_start' => [
                'required',
                'date',
                'before_or_equal:' . now()->endOfYear()->format('Y-m-d'),
                // Allow multiple towns to have the same date, but block it within ONE town
                Rule::unique('gov_terms', 'statutory_start')
                    ->where('municipal_id', $municipalId)
                    ->ignore($termId)
            ],

            'statutory_end' => [
                'required',
                'date',
                'after:statutory_start',
                Rule::unique('gov_terms', 'statutory_end')
                    ->where('municipal_id', $municipalId)
                    ->ignore($termId)
            ],

            'is_current' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'statutory_end.after' => 'The term end date must be after the start date.',
            'name.unique' => 'A term with this name already exists.',
        ];
    }
}
