<?php

namespace App\External\Api\Request\PublicInformation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProcurementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // CHANGE THIS: Return true to allow the request to proceed.
        // Later you can add logic like: return $this->user()->can('create', Procurement::class);
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // --- IDENTIFICATION ---
            // Unique reference number is critical to prevent duplicates
            'reference_number' => [
                'required',
                'string',
                'max:255',
                // Ensure uniqueness but ignore current record if editing
                Rule::unique('procurements', 'reference_number')->ignore($this->procurement)
            ],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'status' => ['required', 'string', 'in:OPEN,CLOSED,AWARDED,FAILED'],

            // --- FINANCIALS ---
            'approved_budget' => ['required', 'numeric', 'min:0', 'max:9999999999999.99'],

            // Logic: Contract amount is required ONLY if status is AWARDED
            // Logic: Contract amount cannot be higher than the ABC (Approved Budget)
            'contract_amount' => [
                'nullable',
                'numeric',
                'min:0',
                'required_if:status,AWARDED',
                'lte:approved_budget' // Must be Less Than or Equal to ABC
            ],

            // --- WINNER INFO ---
            // Logic: Winning bidder is required ONLY if status is AWARDED
            'winning_bidder' => [
                'nullable',
                'string',
                'max:255',
                'required_if:status,AWARDED'
            ],

            // --- DATES ---
            'pre_bid_date' => ['nullable', 'date'],
            'closing_date' => ['nullable', 'date', 'after_or_equal:today'], // Optional: prevent past dates for new posts
            'award_date' => ['nullable', 'date', 'required_if:status,AWARDED'],

            // --- FILE UPLOADS ---
            // Validates the array of files
            'files' => ['nullable', 'array', 'max:5'],
            'files.*' => ['file', 'mimes:pdf', 'max:20480'],

            // REMOVED 'size:files' causing the crash
            'file_types' => ['nullable', 'array'],
            'file_types.*' => ['string', 'in:INVITATION,BID_DOCS,BULLETIN,NOTICE_OF_AWARD,CONTRACT,NOTICE_TO_PROCEED,OTHERS'],
        ];
    }

    /**
     * Custom error messages for better user feedback.
     */
    public function messages(): array
    {
        return [
            'reference_number.unique' => 'This Reference Number has already been used.',
            'contract_amount.lte' => 'The Contract Amount cannot be higher than the Approved Budget (ABC).',
            'contract_amount.required_if' => 'The Contract Amount is required when the project is Awarded.',
            'winning_bidder.required_if' => 'Please specify the Winning Bidder for awarded projects.',
            'files.*.mimes' => 'Only PDF documents are allowed.',
            'files.*.max' => 'Each file must not exceed 20MB.',
        ];
    }
}