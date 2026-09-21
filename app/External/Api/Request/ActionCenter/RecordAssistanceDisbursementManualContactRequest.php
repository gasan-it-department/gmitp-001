<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecordAssistanceDisbursementManualContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'channel' => ['required', Rule::in(['phone_call', 'in_person', 'other'])],
            'note' => ['required', 'string', 'min:10', 'max:500'],
        ];
    }
}
