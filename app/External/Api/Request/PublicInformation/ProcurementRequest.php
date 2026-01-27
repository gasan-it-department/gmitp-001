<?php

namespace App\External\Api\Request\PublicInformation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProcurementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reference_number' => [
                'required',
                'string',
                'max:255',
                // Ensure unique ignores current ID on update
                Rule::unique('procurements', 'reference_number')->ignore($this->procurement)
            ],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'status' => ['required', 'string', 'in:OPEN,CLOSED,AWARDED,FAILED'],

            // --- FINANCIALS ---
            'approved_budget' => ['required', 'numeric', 'min:0', 'max:9999999999999.99'],

            'contract_amount' => [
                'nullable',
                'numeric',
                'min:0',
                'required_if:status,AWARDED',
                'lte:approved_budget'
            ],

            // --- WINNER INFO ---
            'winning_bidder' => [
                'nullable',
                'string',
                'max:255',
                'required_if:status,AWARDED'
            ],

            // --- DATES ---
            'pre_bid_date' => ['nullable', 'date'],
            // Logic: Closing date must be after today ONLY if creating a NEW record.
            'closing_date' => [
                'nullable',
                'date',
                $this->isMethod('post') ? 'after_or_equal:today' : ''
            ],
            'award_date' => ['nullable', 'date', 'required_if:status,AWARDED'],

            // --- FILE UPLOADS (UPDATED) ---
            // 1. Validate the array container
            'attachments' => ['nullable', 'array', 'max:10'],

            // 2. Validate the specific "file" key inside the object
            // Note: 25MB = 25600 KB
            'attachments.*.file' => ['required', 'file', 'mimes:pdf', 'max:25600'],

            // 3. Validate the "type" dropdown string
            'attachments.*.type' => ['required', 'string', 'in:INVITATION,BID_DOCS,BULLETIN,NOTICE_OF_AWARD,CONTRACT,NOTICE_TO_PROCEED,OTHERS'],
        ];
    }

    public function messages(): array
    {
        return [
            'reference_number.unique' => 'This Reference Number has already been used.',
            'contract_amount.lte' => 'The Contract Amount cannot be higher than the Approved Budget (ABC).',
            'contract_amount.required_if' => 'The Contract Amount is required when the project is Awarded.',
            'winning_bidder.required_if' => 'Please specify the Winning Bidder for awarded projects.',

            // Updated File Error Messages to match the new structure
            'attachments.*.file.mimes' => 'All documents must be PDF format.',
            'attachments.*.file.max' => 'A file exceeds the 25MB limit.',
            'attachments.*.type.required' => 'Please select a Document Type for every uploaded file.',
            'attachments.*.type.in' => 'Invalid document type selected.',
        ];
    }
}