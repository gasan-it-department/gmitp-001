<?php

namespace App\External\Api\Request\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class UnpublishProcurementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'correction_reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }
}
