<?php

namespace App\External\Api\Request\ActionCenter\Household;

use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\ActionCenter\Enums\EducationalAttainment;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Enums\Sex;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DeclareHouseholdMemberForAssistanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', 'max:20'],
            'relationship' => ['required', Rule::in($this->nonHeadRelationshipValues())],
            'birth_date' => ['nullable', 'date', 'before_or_equal:today'],
            'sex' => ['nullable', Rule::in($this->sexValues())],
            'civil_status' => ['nullable', Rule::in($this->civilStatusValues())],
            'educational_attainment' => ['nullable', Rule::in($this->educationalAttainmentValues())],
            'occupation' => ['nullable', 'string', 'max:120'],
            'monthly_income' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'religion_id' => ['nullable', 'ulid', Rule::exists('ac_religions', 'id')],
        ];
    }

    /** @return array<int, string> */
    private function nonHeadRelationshipValues(): array
    {
        return array_values(array_filter(
            array_map(fn (Relationship $case) => $case->value, Relationship::cases()),
            fn (string $value) => $value !== Relationship::Head->value,
        ));
    }

    /** @return array<int, string> */
    private function sexValues(): array
    {
        return array_map(fn (Sex $case) => $case->value, Sex::cases());
    }

    /** @return array<int, string> */
    private function civilStatusValues(): array
    {
        return array_map(fn (CivilStatus $case) => $case->value, CivilStatus::cases());
    }

    /** @return array<int, string> */
    private function educationalAttainmentValues(): array
    {
        return array_map(fn (EducationalAttainment $case) => $case->value, EducationalAttainment::cases());
    }
}
