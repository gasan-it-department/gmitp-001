<?php

namespace App\External\Api\Request\Procurement;

use App\Core\Procurement\Enums\ProcurementCategory;
use App\Core\Procurement\Enums\ProcurementDocumentType;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Models\ProcurementFundingSource;
use App\External\Api\Rules\MaxTotalFileSize;
use Illuminate\Database\Query\Builder;
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
            'department_id' => [
                'required',
                'string',
                Rule::exists('departments', 'id')->where(
                    fn (Builder $query) => $query
                        ->where('municipal_id', app('municipal_id'))
                        ->where('is_active', true)
                        ->whereNull('deleted_at')
                ),
            ],
            'funding_source_id' => [
                'required',
                'string',
                Rule::exists('procurement_funding_sources', 'id')
                    ->where(fn (Builder $query) => $query->where('is_active', true)),
            ],
            'custom_funding_source' => ['nullable', 'string', 'max:255'],

            // --- CORE DETAILS ---
            'reference_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('procurements', 'reference_number')->ignore($this->procurement),
            ],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'category' => ['required', Rule::enum(ProcurementCategory::class)],
            'status' => ['nullable', 'required_if:is_historical,true', Rule::enum(ProcurementStatus::class)],
            'notes' => [
                'nullable',
                'string',
                'max:1000',
                Rule::prohibitedIf(fn () => $this->input('status') !== ProcurementStatus::CANCELLED->value),
            ],

            // --- FINANCIALS ---
            'abc_amount' => ['required', 'numeric', 'min:0', 'max:9999999999999.99'],
            'contract_amount' => [
                'nullable',
                'numeric',
                'min:0',
                'lte:abc_amount', // Format/Math check stays here
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
            'awarded_date' => [
                'nullable',
                'date',
                'after:closing_date',
            ],
            'failure_reason' => ['nullable', 'string', 'max:1000'],
            'failed_date' => ['nullable', 'date', 'before_or_equal:today'],

            // --- FILE UPLOADS ---
            'documents' => ['nullable', 'array', 'max:10', new MaxTotalFileSize(100)],
            'documents.*.file' => ['required', 'file', 'mimes:pdf', 'max:25600'],
            'documents.*.type' => [
                'required',
                Rule::enum(ProcurementDocumentType::class),
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $status = $this->input('status');
            $abc = (float) $this->input('abc_amount', 0);

            if ($this->boolean('is_historical') && $status === ProcurementStatus::DRAFT->value) {
                $validator->errors()->add('status', 'Historical records must use their actual lifecycle status, not Draft.');
            }

            $fundingSource = ProcurementFundingSource::query()
                ->whereKey($this->input('funding_source_id'))
                ->where('is_active', true)
                ->first();

            if ($fundingSource?->code === 'OTHERS' && blank($this->input('custom_funding_source'))) {
                $validator->errors()->add('custom_funding_source', 'Please specify the funding source.');
            }

            if ($fundingSource?->code !== 'OTHERS' && filled($this->input('custom_funding_source'))) {
                $validator->errors()->add('custom_funding_source', 'A custom funding source is only allowed when Others is selected.');
            }

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
                if ((float) $this->input('contract_amount', 0) <= 0) {
                    $validator->errors()->add('contract_amount', 'The final Contract Amount is required.');
                }
                if (empty($this->input('awarded_date'))) {
                    $validator->errors()->add('awarded_date', 'The Award Date is required.');
                }
            }

            if ($status === ProcurementStatus::FAILED->value) {
                if (blank($this->input('failure_reason'))) {
                    $validator->errors()->add('failure_reason', 'The reason for the failed bidding is required.');
                }
                if (blank($this->input('failed_date'))) {
                    $validator->errors()->add('failed_date', 'The failed bidding date is required.');
                }
            }

            if ($status === ProcurementStatus::CANCELLED->value) {
                if (blank($this->input('notes'))) {
                    $validator->errors()->add('notes', 'The cancellation reason is required.');
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
            'awarded_date.after' => 'The Award Date must be after the Bidding Closing Date.',
            'documents.*.file.mimes' => 'All bidding documents must be in PDF format.',
            'documents.*.file.max' => 'A document exceeds the 25MB limit.',
            'documents.*.type.required' => 'Please select a Document Type for every uploaded file.',
            'documents.*.type.in' => 'Invalid document type selected.',
        ];
    }
}
