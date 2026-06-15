<?php

namespace App\External\Api\Request\Cemetery\Decedents;

use Illuminate\Foundation\Http\FormRequest;

class VerifyDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['approved' => ['required', 'boolean'], 'notes' => ['nullable', 'string', 'max:1000']];
    }
}
