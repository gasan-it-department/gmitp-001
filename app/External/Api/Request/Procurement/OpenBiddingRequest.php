<?php

namespace App\External\Api\Request\Procurement;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OpenBiddingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'abc_amount' => ['required', 'numeric', 'min:1'],
            'pre_bid_date' => ['nullable', 'date'],
            'closing_date' => ['required', 'date', 'after:now', 'after_or_equal:pre_bid_date'],
            'reference_number' => [
                'required',
                'string',
                'max:255',
                Rule::unique('procurements', 'reference_number')->ignore($this->route('procurementId')),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'closing_date.after' => 'The closing date must be scheduled after the pre-bid conference.',
            'abc_amount.min' => 'The Approved Budget for the Contract must be greater than zero.',
        ];
    }
}
