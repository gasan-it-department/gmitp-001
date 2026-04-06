<?php

namespace App\External\Api\Request\Procurement;

use App\Core\Procurement\Enums\ProcurementCategory;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\External\Api\Rules\MaxTotalFileSize;
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
            'is_historical' => 'required|boolean',
            // --- RELATIONSHIPS ---
            'department_id' => ['required', 'string', 'exists:departments,id'],
            'funding_source_id' => ['required', 'string', 'exists:procurement_funding_sources,id'],

            // --- CORE DETAILS ---
            'reference_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('procurements', 'reference_number')->ignore($this->procurement)
            ],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::enum(ProcurementCategory::class)],
            'status' => ['nullable', 'required_if:is_historical,true', Rule::enum(ProcurementStatus::class)],
            'notes' => ['nullable', 'string', 'max:1000'],

            // --- FINANCIALS ---
            'abc_amount' => ['required', 'numeric', 'min:0', 'max:9999999999999.99'],
            'contract_amount' => [
                'nullable',
                'numeric',
                'min:0',
                'lte:abc_amount' // Format/Math check stays here
            ],

            // --- WINNER INFO ---
            'winning_bidder' => ['nullable', 'string', 'max:255'],

            // --- DATES & TIMELINES ---
            'pre_bid_date' => ['nullable', 'date'],
            'closing_date' => [
                'nullable',
                'date',
                'after:pre_bid_date', // Chronology check stays here
            ],
            'award_date' => [
                'nullable',
                'date',
                'after:closing_date', // Chronology check stays here
            ],

            // --- FILE UPLOADS ---
            'documents' => ['nullable', 'array', 'max:10', new MaxTotalFileSize(100)],
            'documents.*.file' => ['required', 'file', 'mimes:pdf', 'max:25600'],
            'documents.*.type' => [
                'required',
                'string',
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $status = $this->input('status');
            $abc = (float) $this->input('abc_amount', 0);

            // --- 1. THE "PUBLISHED" TIER ---
            // If it's anything OTHER than Draft or Cancelled, it needs the core project data.
            $publishedStatuses = [
                ProcurementStatus::OPEN->value,
                ProcurementStatus::EVALUATING->value,
                ProcurementStatus::AWARDED->value,
                ProcurementStatus::FAILED->value,
            ];

            if (in_array($status, $publishedStatuses)) {
                if ($abc <= 0) {
                    $validator->errors()->add('abc_amount', 'The Approved Budget (ABC) is required and must be greater than 0.');
                }
                // if (empty($this->input('department_id'))) {
                //     $validator->errors()->add('department_id', 'The End-User Department is required.');
                // }
                // if (empty($this->input('funding_source_id'))) {
                //     $validator->errors()->add('funding_source_id', 'The Funding Source is required.');
                // }
                if (empty($this->input('reference_number'))) {
                    $validator->errors()->add('reference_number', 'PhilGEPS Reference Number is required.');
                }
                if (empty($this->input('closing_date'))) {
                    $validator->errors()->add('closing_date', 'A Deadline (Closing Date) is required.');
                }
                // 1 Million Peso Rule
                if ($abc >= 1000000 && empty($this->input('pre_bid_date'))) {
                    $validator->errors()->add('pre_bid_date', 'Projects with ABC of 1M or above require a Pre-Bid Conference date.');
                }
            }

            // --- 2. THE "AWARDED" TIER ---
            if ($status === ProcurementStatus::AWARDED->value) {
                if (empty($this->input('winning_bidder'))) {
                    $validator->errors()->add('winning_bidder', 'You must specify the Winning Bidder.');
                }
                if (empty($this->input('contract_amount'))) {
                    $validator->errors()->add('contract_amount', 'The final Contract Amount is required.');
                }
                if (empty($this->input('award_date'))) {
                    $validator->errors()->add('award_date', 'The Award Date is required.');
                }
            }

            // --- 3. THE "EXPLANATION" TIER (Failed/Cancelled) ---
            if ($status === ProcurementStatus::FAILED->value || $status === ProcurementStatus::CANCELLED->value) {
                if (empty($this->input('notes'))) {
                    $validator->errors()->add('notes', 'Please provide a reason or BAC Resolution number in the notes for this status.');
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'status.required_if' => 'The status is required.',
            'reference_number.unique' => 'This PhilGEPS Reference Number has already been used.',
            'contract_amount.lte' => 'The Contract Amount cannot be higher than the ABC Amount.',
            'closing_date.after' => 'The Bidding Closing Date must be after the Pre-Bid Date.',
            'award_date.after' => 'The Award Date must be after the Bidding Closing Date.',
            'documents.*.file.mimes' => 'All bidding documents must be in PDF format.',
            'documents.*.file.max' => 'A document exceeds the 25MB limit.',
            'documents.*.type.required' => 'Please select a Document Type for every uploaded file.',
            'documents.*.type.in' => 'Invalid document type selected.',
        ];
    }
}