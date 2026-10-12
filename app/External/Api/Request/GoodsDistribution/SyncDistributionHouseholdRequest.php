<?php

namespace App\External\Api\Request\GoodsDistribution;

use Illuminate\Foundation\Http\FormRequest;

final class SyncDistributionHouseholdRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.requests.intake') || $this->user()->can('goods_distribution.requests.process');
    }

    public function rules(): array
    {
        return ['version' => ['required', 'integer', 'min:1'], 'operation_key' => ['required', 'string', 'max:100'],
            'registry_fingerprint' => ['required', 'string', 'regex:/^[a-f0-9]{64}$/'], 'household_reviewed' => ['required', 'accepted']];
    }
}
