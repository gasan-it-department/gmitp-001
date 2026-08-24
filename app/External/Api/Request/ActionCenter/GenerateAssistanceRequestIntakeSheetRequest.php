<?php

namespace App\External\Api\Request\ActionCenter;

use App\Core\ActionCenter\Enums\AssistanceIntakeProblem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateAssistanceRequestIntakeSheetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $sourceOfIncome = $this->input('source_of_income');
        $monthlyIncome = $this->input('monthly_income');
        $recommendation = $this->input('recommendation');

        $this->merge([
            'source_of_income' => is_string($sourceOfIncome)
                ? (trim($sourceOfIncome) ?: null)
                : $sourceOfIncome,
            'monthly_income' => $monthlyIncome === '' ? null : $monthlyIncome,
            'recommendation' => is_string($recommendation)
                ? trim($recommendation)
                : $recommendation,
        ]);
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'problem_presented' => ['required', 'array', 'min:1', 'max:4'],
            'problem_presented.*' => [
                'required',
                'string',
                'distinct',
                Rule::enum(AssistanceIntakeProblem::class),
            ],
            'source_of_income' => ['nullable', 'string', 'max:255'],
            'monthly_income' => ['nullable', 'numeric', 'min:0'],
            'recommendation' => ['required', 'string', 'max:1000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'problem_presented.required' => 'Select at least one problem presented.',
            'problem_presented.min' => 'Select at least one problem presented.',
            'recommendation.required' => 'Enter the social worker recommendation.',
        ];
    }
}
