<?php

namespace App\External\Api\Request\Cemetery\Decedents;

use Illuminate\Foundation\Http\FormRequest;

class ReviewCorrectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['approved' => ['required', 'boolean'], 'review_notes' => ['nullable', 'string', 'max:2000']];
    }
}
