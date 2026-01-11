<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BeneficiaryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Set to true to allow the request to be handled by the controller.
        // For a production app, you might add logic here to check if the user is
        // authenticated or has the correct role.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [

            'first_name' => ['required', 'string', 'max:255', 'regex:/^[\p{L}\s\-\'\.]+$/u'],

            'last_name' => ['required', 'string', 'max:255', 'regex:/^[\p{L}\s\-\'\.]+$/u'],

            'middle_name' => ['nullable', 'string', 'max:255', 'min:2', 'regex:/^[\p{L}\s\-\'\.]+$/u'],

            'suffix' => ['nullable', 'string', 'max:255', 'regex:/^[\p{L}\s\-\'\.]+$/u'],

            'birth_date' => ['required', 'date'],

            'province' => ['required', 'string', 'max:255',],

            'municipality' => ['required', 'string', 'max:255'],

            'barangay' => ['required', 'string', 'max:255'],

        ];
    }
}
