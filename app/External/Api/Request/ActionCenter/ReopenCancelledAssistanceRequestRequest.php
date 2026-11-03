<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

final class ReopenCancelledAssistanceRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('action_center.requests.decide') && $this->user()->can('action_center.requests.correct');
    }

    public function rules(): array
    {
        return ['reason' => ['required', 'string', 'min:10', 'max:1000'],
            'context_token' => ['required', 'string', 'size:64'], 'operation_key' => ['required', 'string', 'max:100'],
            'confirm_not_released' => ['required', 'accepted'], 'confirm_papers_invalid' => ['required', 'accepted']];
    }
}
