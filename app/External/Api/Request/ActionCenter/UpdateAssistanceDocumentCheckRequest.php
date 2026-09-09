<?php

namespace App\External\Api\Request\ActionCenter;

use App\Core\ActionCenter\Enums\AssistanceRequestDocumentCheckStatus;
use App\Core\ActionCenter\Enums\PhysicalCopyRequirement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAssistanceDocumentCheckRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(AssistanceRequestDocumentCheckStatus::values())],
            'media_id' => ['nullable', 'integer'],
            'media_version' => ['nullable', 'string', 'size:64'],
            'presented_copy_type' => ['nullable', Rule::in(PhysicalCopyRequirement::presentedValues())],
            'physical_inspected' => ['required', 'boolean'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
