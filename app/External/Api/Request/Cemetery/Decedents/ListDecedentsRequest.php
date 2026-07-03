<?php

namespace App\External\Api\Request\Cemetery\Decedents;

use App\Core\Cemetery\Enums\IdentityStatus;
use App\Core\Cemetery\Enums\RegistrationStatus;
use App\Core\Cemetery\Enums\VitalRecordType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListDecedentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'registration_status' => ['nullable', Rule::enum(RegistrationStatus::class)],
            'identity_status' => ['nullable', Rule::enum(IdentityStatus::class)],
            'vital_record_type' => ['nullable', Rule::enum(VitalRecordType::class)],
            'interment_status' => ['nullable', Rule::in(['interred', 'unassigned', 'exhumed', 'transferred_out'])],
            'death_year' => ['nullable', 'integer', 'digits:4', 'between:1900,'.((int) date('Y') + 1)],
            'per_page' => ['nullable', 'integer', Rule::in([10, 25, 50, 100])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function filters(): array
    {
        return $this->safe()->only([
            'search',
            'registration_status',
            'identity_status',
            'vital_record_type',
            'interment_status',
            'death_year',
            'per_page',
        ]);
    }
}
