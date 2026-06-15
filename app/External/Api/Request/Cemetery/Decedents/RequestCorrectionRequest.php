<?php

namespace App\External\Api\Request\Cemetery\Decedents;

use App\Core\Cemetery\Enums\IdentityStatus;
use App\Core\Cemetery\Enums\VitalRecordType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class RequestCorrectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'proposed_changes' => ['required', 'array', 'min:1'],
            'proposed_changes.*' => ['nullable'],
            'proposed_changes.vital_record_type' => ['nullable', new Enum(VitalRecordType::class)],
            'proposed_changes.identity_status' => ['nullable', new Enum(IdentityStatus::class)],
            'proposed_changes.has_legal_name' => ['nullable', 'boolean'],
            'proposed_changes.first_name' => ['nullable', 'string', 'max:100'],
            'proposed_changes.last_name' => ['nullable', 'string', 'max:100'],
            'proposed_changes.middle_name' => ['nullable', 'string', 'max:100'],
            'proposed_changes.suffix' => ['nullable', 'string', 'max:20'],
            'proposed_changes.memorial_name' => ['nullable', 'string', 'max:255'],
            'proposed_changes.gender' => ['nullable', 'in:MALE,FEMALE,INDETERMINATE'],
            'proposed_changes.date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'proposed_changes.date_of_death' => ['nullable', 'date', 'before_or_equal:today'],
            'proposed_changes.registry_number' => ['nullable', 'string', 'max:255'],
            'proposed_changes.cause_of_death' => ['nullable', 'string', 'max:255'],
            'proposed_changes.place_of_death' => ['nullable', 'string', 'max:255'],
            'proposed_changes.notes' => ['nullable', 'string', 'max:2000'],
            'reason' => ['required', 'string', 'max:2000'],
            'evidence' => ['required', 'file', 'mimes:jpeg,jpg,png,webp,pdf', 'max:10240'],
        ];
    }
}
