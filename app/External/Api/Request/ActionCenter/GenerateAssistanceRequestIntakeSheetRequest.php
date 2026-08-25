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
            'source_of_income' => ['required', 'string', 'max:255'],
            'monthly_income' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'recommendation' => ['required', 'string', 'max:1000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'problem_presented.required' => 'Select at least one problem presented.',
            'problem_presented.min' => 'Select at least one problem presented.',
            'source_of_income.required' => 'Enter the claimant\'s occupation or basic source of income.',
            'monthly_income.required' => 'Enter the claimant\'s monthly income. Enter 0 if none.',
            'monthly_income.min' => 'Monthly income cannot be negative.',
            'recommendation.required' => 'Enter the social worker recommendation.',
        ];
    }
}
