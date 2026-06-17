<?php

namespace App\External\Api\Request\ActionCenter\Beneficiary;

use App\Core\ActionCenter\Models\Beneficiary;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReplaceBeneficiaryIdentityDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'document' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'reason' => [
                Rule::requiredIf(fn () => $this->beneficiaryIsVerified()),
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'document.required' => 'Please choose an ID document to upload.',
            'document.mimes' => 'The ID document must be a JPG, PNG, or PDF file.',
            'document.max' => 'The ID document must be 5 MB or smaller.',
            'reason.required' => 'Please enter a reason when replacing a verified beneficiary ID.',
            'reason.max' => 'The reason must be 1000 characters or fewer.',
        ];
    }

    private function beneficiaryIsVerified(): bool
    {
        $beneficiaryId = $this->route('beneficiaryId');

        if (! is_string($beneficiaryId) && ! is_numeric($beneficiaryId)) {
            return false;
        }

        return Beneficiary::query()
            ->whereKey((string) $beneficiaryId)
            ->whereNotNull('identity_verified_at')
            ->exists();
    }
}
