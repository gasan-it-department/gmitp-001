<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssistanceTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:255',
            ],

            // 2. Standard nullable text field
            'description' => [
                'nullable',
                'string',
                'max:1000'
            ],

            'max_amount' => [
                'nullable',
                'integer',
                'max:50000'
            ],
            'cooldown_months' => [
                'required',
                'integer',
                'min:0',
                'max:60',
            ],
            // 3. Ensure it's a strict boolean true/false from the React Switch
            'is_active' => [
                'nullable',
                'boolean'
            ],

            // 4. MUST be an array if it is provided
            'documents' => ['nullable', 'array'],

            // Validate the objects INSIDE the array
            'documents.*.id' => ['required', 'string', 'exists:ac_document_types,id'],
            'documents.*.is_required' => ['required', 'boolean'],
        ];
    }
}