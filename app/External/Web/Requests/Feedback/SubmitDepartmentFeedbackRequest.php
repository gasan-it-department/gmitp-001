<?php

namespace App\External\Web\Requests\Feedback;

use App\Core\Feedback\Actions\FindActiveFeedbackDepartmentAction;
use App\External\Api\Request\Feedback\SubmitFeedbackRequest;
use Illuminate\Validation\Rule;

class SubmitDepartmentFeedbackRequest extends SubmitFeedbackRequest
{
    public function authorize(): bool
    {
        app(FindActiveFeedbackDepartmentAction::class)->execute(
            (string) $this->route('department'),
            app('municipal_id'),
        );

        return true;
    }

    public function rules(): array
    {
        $rules = parent::rules();
        $rules['department_id'] = ['required', 'ulid', Rule::in([(string) $this->route('department')])];
        $rules['rating'] = ['required', 'integer', 'between:1,5'];

        return $rules;
    }

    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'department_id.in' => 'This feedback must be submitted to the department shown on this page.',
            'rating.required' => 'Please select a rating from 1 to 5 stars.',
        ]);
    }
}
