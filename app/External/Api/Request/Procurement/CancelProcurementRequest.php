<?php

namespace App\External\Api\Request\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class CancelProcurementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cancellation_reason' => ['required', 'string', 'max:1000'],
        ];
    }
}
