<?php

namespace App\External\Api\Request\Cemetery\Decedents;

use App\Core\Cemetery\Enums\IdentityStatus;
use App\Core\Cemetery\Enums\VitalRecordType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class CorrectDecedentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'version' => ['required', 'integer', 'min:1'],
            'changes' => ['required', 'array', 'min:1'],
            'changes.*' => ['nullable'],
            'changes.vital_record_type' => ['nullable', new Enum(VitalRecordType::class)],
            'changes.identity_status' => ['nullable', new Enum(IdentityStatus::class)],
            'changes.has_legal_name' => ['nullable', 'boolean'],
            'changes.first_name' => ['nullable', 'string', 'max:100'],
            'changes.last_name' => ['nullable', 'string', 'max:100'],
            'changes.middle_name' => ['nullable', 'string', 'max:100'],
            'changes.suffix' => ['nullable', 'string', 'max:20'],
            'changes.memorial_name' => ['nullable', 'string', 'max:255'],
            'changes.gender' => ['nullable', 'in:MALE,FEMALE,INDETERMINATE'],
            'changes.date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'changes.date_of_death' => ['nullable', 'date', 'before_or_equal:today'],
            'changes.registry_number' => ['nullable', 'string', 'max:255'],
            'changes.cause_of_death' => ['nullable', 'string', 'max:255'],
            'changes.place_of_death' => ['nullable', 'string', 'max:255'],
            'changes.notes' => ['nullable', 'string', 'max:2000'],
            'reason' => ['required', 'string', 'max:2000'],
            'evidence' => ['required', 'file', 'mimes:jpeg,jpg,png,webp,pdf', 'max:10240'],
        ];
    }
}
