<?php

namespace App\External\Api\Request\Cemetery\Plots;

use Illuminate\Foundation\Http\FormRequest;

class DeletePlotRequest extends FormRequest
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
