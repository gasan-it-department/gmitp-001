<?php

namespace App\External\Api\Request\GoodsDistribution;

use Illuminate\Foundation\Http\FormRequest;

final class SaveDistributionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.requests.intake')
            || ($this->route('requestId') && $this->user()->can('goods_distribution.requests.process'));
    }

    public function rules(): array
    {
        $draft = $this->input('intent') === 'draft';

        return [
            'intent' => ['nullable', 'in:draft,submit,save'],
            'submission_key' => [$this->route('requestId') ? 'nullable' : 'required', 'string', 'max:100'],
            'version' => [$this->route('requestId') ? 'required' : 'nullable', 'integer', 'min:1'],
            'beneficiary_id' => ['required', 'ulid'], 'assisted_household_member_id' => ['nullable', 'ulid'],
            'program_id' => ['required', 'ulid'], 'storage_location_id' => ['required', 'ulid'],
            'notes' => ['nullable', 'string', 'max:2000'], 'lines' => ['present', 'array', $draft ? 'min:0' : 'min:1', 'max:100'],
            'lines.*' => ['array:item_id,quantity'], 'lines.*.item_id' => ['required', 'ulid', 'distinct'],
            'lines.*.quantity' => [$draft ? 'nullable' : 'required', 'string', 'regex:/^\\d{1,12}(?:\\.\\d{1,3})?$/D'],
        ];
    }
}
