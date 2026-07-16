<?php

namespace App\External\Api\Request\Cemetery\Decedents;

use Illuminate\Foundation\Http\FormRequest;

class DeleteDraftDecedentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'max:1000'],
        ];
    }
}
