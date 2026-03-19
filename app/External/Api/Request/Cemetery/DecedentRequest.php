<?php

namespace App\External\Api\Request\Cemetery;

use App\Core\Cemetery\Enums\DecedentTypes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class DecedentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Changed to true. If you have role-based permissions later, 
        // you would check them here (e.g., return $this->user()->can('create_decedents');)
        return true;
    }

    public function prepareForValidation()
    {

        $type = $this->decedent_type;
        $hasOfficialName = $this->has_official_name;

        if ($type === 'standard') {
            $this->merge([
                'memorial_name' => null,
                'reference_document_type' => null,
                'reference_document_number' => null,
            ]);
        } elseif ($type === 'unknown') {
            $this->merge([
                'first_name' => 'null',
                'middle_name' => null,
                'last_name' => null,
                'suffix' => null,
                'memorial_name' => null,
            ]);
        } elseif ($type === 'fetal' || $type === 'child') {
            $this->merge([
                'reference_document_type' => null,
                'reference_document_number' => null,
            ]);

            if (!$hasOfficialName) {
                $this->merge([
                    'first_name' => null,
                    'middle_name' => null,
                    'last_name' => null,
                    'suffix' => null,
                ]);
            }
        } else {
            $this->merge([
                'memorial_name' => null,
            ]);
        }

    }
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Fetch the ID if we are updating an existing record, to ignore it in the unique check
        $decedentId = $this->route('decedent');

        return [
            'decedent_type' => ['required', new Enum(DecedentTypes::class)],
            'first_name' => [
                Rule::requiredIf(function () {
                    $type = DecedentTypes::from($this->decedent_type);
                    $isStandard = $type === DecedentTypes::STANDARD;
                    $isNameChild = in_array($type, [
                        DecedentTypes::FETAL,
                        DecedentTypes::CHILD,
                    ]) && filter_var($this->has_official_name, FILTER_VALIDATE_BOOLEAN);

                    return $isStandard || $isNameChild;
                }),
                'nullable',
                'string',
                'max:100',
                'regex:/^[A-Za-z\s\.]+$/' // Added \. to allow names like "Jr." or "St."
            ],
            'last_name' => [
                Rule::requiredIf(function () {
                    $type = DecedentTypes::from($this->decedent_type);
                    $isStandard = $type === DecedentTypes::STANDARD;
                    $isNameChild = in_array($type, [
                        DecedentTypes::FETAL,
                        DecedentTypes::CHILD,
                    ]) && filter_var($this->has_official_name, FILTER_VALIDATE_BOOLEAN);

                    return $isStandard || $isNameChild;
                }),
                'nullable',
                'string',
                'max:100',
                'regex:/^[A-Za-z\s]+$/'
            ],
            'memorial_name' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[A-Za-z\s]+$/',
                Rule::requiredIf(function () {
                    $isChildType = in_array($this->decedent_type, [
                        DecedentTypes::FETAL->value,
                        DecedentTypes::CHILD->value
                    ]);

                    $noOfficialName = !filter_var($this->has_official_name, FILTER_VALIDATE_BOOLEAN);
                    return $isChildType && $noOfficialName;
                })
            ],

            'middle_name' => ['nullable', 'string', 'max:100', 'regex:/^[A-Za-z\s]+$/'],
            'suffix' => ['nullable', 'string', 'max:15', 'regex:/^[A-Za-z\s]+$/'],

            'psgc_municipal_id' => ['nullable', 'string', 'max:100'],
            'psgc_barangay_id' => ['nullable', 'string', 'max:100'],
            'street_name' => ['nullable', 'string', 'max:100'],

            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'date_of_death' => [
                'nullable',
                'date',
                'before_or_equal:today',
                'after_or_equal:date_of_birth'
            ],
            'date_of_registration' => ['required', 'date', 'before_or_equal:today'],

            'gender' => ['nullable', 'string', 'in:MALE,FEMALE'],
            'cause_of_death' => ['nullable', 'string', 'max:255'],
            'place_of_death' => ['nullable', 'string', 'max:255'],
            'reference_document_type' => [
                'nullable',
                'string',
                Rule::requiredIf(fn() => $this->decedent_type === DecedentTypes::UNKNOWN->value),
            ],
            'reference_document_number' => [
                'nullable',
                'string',
                Rule::requiredIf(fn() => $this->decedent_type === DecedentTypes::UNKNOWN->value),
            ],

            'death_certificate_no' => [
                'nullable',
                'string',
                'max:255',
                // If you are using the cem_gov_ prefix instead of cemetery_, update the table name here
                Rule::unique('cemetery_decedents', 'death_certificate_no')->ignore($decedentId)
            ],

            'notes' => [
                'nullable',
                'string',
                'max:1000',
                Rule::requiredIf(fn() => $this->decedent_type === DecedentTypes::UNKNOWN->value)
            ],
        ];
    }


    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [

            'date_of_birth.before_or_equal' => 'The date of birth cannot be a future date.',

            'date_of_death.before_or_equal' => 'The date of death cannot be a future date.',

            'date_of_death.after_or_equal' => 'The date of death cannot be before the date of birth.',

            'gender.in' => 'Please select a valid gender from the list.',

            'death_certificate_no.unique' => 'This Death Certificate Number is already registered in the system.',

            'reference_document_type.required_if' => 'An authorizing document is legally required for unidentified bodies.',

            'reference_document_number.required_if' => 'Please enter the Blotter or Case Number provided by the agency.',

            'notes.required' => 'Please provide additional information for Unknown decedents to ensure accurate recordsa and addition info.',
        ];
    }
}