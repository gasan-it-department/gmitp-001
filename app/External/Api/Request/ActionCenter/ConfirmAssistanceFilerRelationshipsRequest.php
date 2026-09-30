<?php

namespace App\External\Api\Request\ActionCenter;

use App\Core\ActionCenter\Enums\Relationship;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ConfirmAssistanceFilerRelationshipsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'roster_fingerprint' => ['required', 'string', 'size:64'],
            'filer_relationships' => ['required', 'array'],
            'filer_relationships.*' => ['required', Rule::in(array_map(fn (Relationship $case) => $case->value, Relationship::cases()))],
            'correction_reason' => ['nullable', 'string', 'min:10', 'max:1000'],
        ];
    }
}
