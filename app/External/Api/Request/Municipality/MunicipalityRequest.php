<?php

namespace App\External\Api\Request\Municipality;

use Illuminate\Foundation\Http\FormRequest;

class MunicipalityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
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
            'name' => 'required|string|max:255',
            'municipal_code' => 'required|string|min:3|max:50',
            'is_active' => 'sometimes|boolean',
            'zip_code' => 'required|string|max:20',
        ];
    }
}
