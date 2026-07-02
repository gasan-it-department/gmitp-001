<?php

namespace App\External\Api\Request\Cemetery\Interments;

use Illuminate\Foundation\Http\FormRequest;

class ReverseMovedIntermentRequest extends FormRequest
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
