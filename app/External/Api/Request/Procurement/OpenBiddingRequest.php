<?php

namespace App\External\Api\Request\Procurement;

use Illuminate\Foundation\Http\FormRequest;

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
            'pre_bid_date' => ['required', 'date',],
            'closing_date' => ['required', 'date', 'after:pre_bid_date'],
            'reference_number' => ['required', 'string'],
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