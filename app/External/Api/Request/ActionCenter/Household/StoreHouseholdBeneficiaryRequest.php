<?php

namespace App\External\Api\Request\ActionCenter\Household;

use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\ActionCenter\Enums\EducationalAttainment;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Enums\Sex;
use App\Core\Users\Enums\EnumPermissions;
use App\Shared\Phone\Services\PhoneFormatterService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreHouseholdBeneficiaryRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (! $this->user()?->can(EnumPermissions::ACTION_CENTER_BENEFICIARIES_VERIFY->value)) {
            $this->merge(['verify_now' => false]);
        }
    }

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
            'sex' => ['required', Rule::enum(Sex::class)],
            'birth_date' => ['required', 'date', 'before:today'],
            'religion_id' => ['nullable', 'ulid', 'exists:ac_religions,id'],
            'educational_attainment' => ['nullable', Rule::enum(EducationalAttainment::class)],
            'civil_status' => ['required', Rule::enum(CivilStatus::class)],
            'occupation' => ['required', 'string', 'max:120'],
            'monthly_income' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'contact_phone' => ['nullable', 'string', 'max:30', $this->validPhoneNumber()],
            'relationship' => ['required', Rule::in($this->nonHeadRelationships())],
            'terms_consent' => ['required', 'accepted'],
            'force' => ['nullable', 'boolean'],
            'verify_now' => ['nullable', 'boolean'],
            'identity_id_front' => [
                Rule::requiredIf(fn (): bool => $this->boolean('verify_now')),
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:5120',
            ],
            'identity_id_back' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }

    /** @return array<int, string> */
    private function nonHeadRelationships(): array
    {
        return collect(Relationship::cases())
            ->reject(fn (Relationship $relationship): bool => $relationship === Relationship::Head)
            ->map(fn (Relationship $relationship): string => $relationship->value)
            ->values()
            ->all();
    }

    private function validPhoneNumber(): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail): void {
            if (blank($value)) {
                return;
            }

            if (app(PhoneFormatterService::class)->normalize((string) $value) === null) {
                $fail('Please enter a valid Philippine mobile number.');
            }
        };
    }
}
