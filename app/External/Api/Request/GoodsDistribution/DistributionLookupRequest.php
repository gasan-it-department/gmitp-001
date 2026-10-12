<?php

namespace App\External\Api\Request\GoodsDistribution;

use Illuminate\Foundation\Http\FormRequest;

final class DistributionLookupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.requests.view');
    }

    public function rules(): array
    {
        return ['search' => ['nullable', 'string', 'max:100'], 'program_id' => [$this->route('lookup') === 'items' ? 'required' : 'nullable', 'ulid'], 'beneficiary_id' => ['nullable', 'ulid'], 'page' => ['nullable', 'integer', 'min:1']];
    }
}
