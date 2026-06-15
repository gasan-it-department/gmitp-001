<?php

namespace App\External\Api\Request\Cemetery\Decedents;

use Illuminate\Foundation\Http\FormRequest;

class CreateReadinessOverrideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'max:2000'],
            'evidence_reference' => ['required', 'string', 'max:255'],
            'legal_documents_exist' => ['accepted'],
        ];
    }
}
