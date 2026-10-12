<?php

namespace App\External\Api\Request\GoodsDistribution;

use Illuminate\Foundation\Http\FormRequest;

final class SaveDistributionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.requests.intake');
    }

    public function rules(): array
    {
        return [
            'submission_key' => [$this->route('requestId') ? 'nullable' : 'required', 'string', 'max:100'],
            'version' => [$this->route('requestId') ? 'required' : 'nullable', 'integer', 'min:1'],
            'beneficiary_id' => ['required', 'ulid'], 'assisted_household_member_id' => ['nullable', 'ulid'],
            'program_id' => ['required', 'ulid'], 'storage_location_id' => ['required', 'ulid'],
            'notes' => ['nullable', 'string', 'max:2000'], 'lines' => ['required', 'array', 'min:1', 'max:100'],
            'lines.*' => ['array:item_id,quantity'], 'lines.*.item_id' => ['required', 'ulid', 'distinct'],
            'lines.*.quantity' => ['required', 'string', 'regex:/^\\d{1,12}(?:\\.\\d{1,3})?$/D'],
        ];
    }
}
