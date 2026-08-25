<?php

namespace App\External\Api\Request\ActionCenter;

use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\ActionCenter\Enums\EducationalAttainment;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Enums\Sex;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\UseCase\Household\StoreHouseholdMemberAction;
use App\Shared\Phone\Services\PhoneFormatterService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ResubmitBeneficiaryProfileCorrectionRequest extends FormRequest
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
            'sex' => ['required', Rule::in($this->sexValues())],
            'birth_date' => ['required', 'date', 'before:today'],
            'religion_id' => ['nullable', 'ulid', 'exists:ac_religions,id'],
            'educational_attainment' => ['nullable', Rule::in($this->educationalAttainmentValues())],
            'identity_id_front' => [
                Rule::requiredIf(fn () => ! $this->hasExistingIdentityDocument('identity_id_front')),
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:5120',
            ],
            'identity_id_back' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'civil_status' => ['required', Rule::in($this->civilStatusValues())],
            'occupation' => ['required', 'string', 'max:120'],
            'monthly_income' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'contact_phone' => ['required', 'string', 'max:30', $this->validPhoneNumber()],
            'barangay' => ['required', 'string', 'max:100'],
            'barangay_code' => ['nullable', 'string', 'max:20'],
            'street' => ['nullable', 'string', 'max:255'],
            'terms_consent' => ['required', 'accepted'],
            'household_members' => ['nullable', 'array', 'max:'.StoreHouseholdMemberAction::ACTIVE_MEMBER_HARD_LIMIT],
            'household_members.*.first_name' => ['required_with:household_members.*', 'string', 'max:100'],
            'household_members.*.last_name' => ['required_with:household_members.*', 'string', 'max:100'],
            'household_members.*.middle_name' => ['nullable', 'string', 'max:100'],
            'household_members.*.suffix' => ['nullable', 'string', 'max:20'],
            'household_members.*.relationship' => ['required_with:household_members.*', Rule::in($this->relationshipValues())],
            'household_members.*.birth_date' => ['nullable', 'date', 'before_or_equal:today'],
            'household_members.*.sex' => ['nullable', Rule::in($this->sexValues())],
            'household_members.*.civil_status' => ['nullable', Rule::in($this->civilStatusValues())],
            'household_members.*.educational_attainment' => ['nullable', Rule::in($this->educationalAttainmentValues())],
            'household_members.*.occupation' => ['nullable', 'string', 'max:120'],
            'household_members.*.monthly_income' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'household_members.*.religion_id' => ['nullable', 'ulid', 'exists:ac_religions,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'birth_date.before' => 'Date of birth must be in the past.',
            'identity_id_front.required' => 'Please upload the front of your valid ID.',
            'identity_id_front.mimes' => 'The ID front must be a JPG, PNG, or PDF file.',
            'identity_id_front.max' => 'The ID front must be 5 MB or smaller.',
            'identity_id_back.mimes' => 'The ID back must be a JPG, PNG, or PDF file.',
            'identity_id_back.max' => 'The ID back must be 5 MB or smaller.',
            'contact_phone.required' => 'Please provide a phone number where MSWD can contact you.',
            'occupation.required' => 'Please describe your current occupation. Enter "None" or "Unemployed" if applicable.',
            'monthly_income.required' => 'Please enter your monthly income. Enter 0 if none.',
            'monthly_income.min' => 'Monthly income cannot be negative.',
            'terms_consent.accepted' => 'You must agree to the Data Privacy notice before resubmitting your correction.',
        ];
    }

    private function hasExistingIdentityDocument(string $collection): bool
    {
        $beneficiary = Beneficiary::query()
            ->with('media')
            ->where('user_id', $this->user()?->id)
            ->where('municipal_id', app('municipal_id'))
            ->first();

        return $beneficiary?->getFirstMedia($collection) !== null;
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

    /** @return array<int, string> */
    private function relationshipValues(): array
    {
        return array_map(fn (Relationship $case) => $case->value, Relationship::cases());
    }

    private function validPhoneNumber(): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail): void {
            if ($value === null || $value === '') {
                return;
            }

            if (app(PhoneFormatterService::class)->normalize((string) $value) === null) {
                $fail('Please enter a valid Philippine mobile number.');
            }
        };
    }
}
