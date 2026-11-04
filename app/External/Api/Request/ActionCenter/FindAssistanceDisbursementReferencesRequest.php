<?php

namespace App\External\Api\Request\ActionCenter;

use App\Core\ActionCenter\Enums\AssistanceDisbursementMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FindAssistanceDisbursementReferencesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('action_center.requests.view')
            && $this->user()?->can('action_center.requests.disburse');
    }

    public function rules(): array
    {
        return [
            'method' => ['required', Rule::in(AssistanceDisbursementMethod::values())],
            'reference' => ['required', 'string', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
