<?php

namespace App\External\Api\Request\Cemetery\Interments;

use App\Core\Cemetery\Enums\IntermentEndType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class CloseIntermentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'permit_reference' => is_string($this->input('permit_reference'))
                ? mb_strtoupper(trim($this->input('permit_reference')))
                : $this->input('permit_reference'),
            'transfer_destination' => is_string($this->input('transfer_destination'))
                ? trim($this->input('transfer_destination'))
                : $this->input('transfer_destination'),
        ]);
    }

    public function rules(): array
    {
        return [
            'end_type' => ['required', new Enum(IntermentEndType::class), 'not_in:'.IntermentEndType::MOVED->value],
            'ended_date' => ['required', 'date', 'before_or_equal:today'],
            'reason' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'permit_reference' => ['nullable', 'string', 'max:150'],
            'transfer_destination' => ['nullable', 'required_if:end_type,'.IntermentEndType::TRANSFERRED_OUT->value, 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'end_type.not_in' => 'Use the Move Plot flow for internal cemetery movement.',
            'ended_date.before_or_equal' => 'The exhumation or transfer-out date cannot be in the future.',
            'transfer_destination.required_if' => 'Transfer destination is required when transferring remains out.',
        ];
    }
}
