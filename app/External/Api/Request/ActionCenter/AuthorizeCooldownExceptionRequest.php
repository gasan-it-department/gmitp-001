<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

class AuthorizeCooldownExceptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'release_date' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'cooldown_context_fingerprint' => ['required', 'string', 'size:64'],
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
            'confirm' => ['required', 'accepted'],
        ];
    }
}
