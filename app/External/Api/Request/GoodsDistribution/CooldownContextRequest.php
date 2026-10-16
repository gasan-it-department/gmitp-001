<?php

namespace App\External\Api\Request\GoodsDistribution;

use Illuminate\Foundation\Http\FormRequest;

final class CooldownContextRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.requests.view');
    }

    public function rules(): array
    {
        $saved = (bool) $this->route('requestId');

        return ['program_id' => [$saved ? 'exclude' : 'required', 'ulid'],
            'beneficiary_id' => [$saved ? 'exclude' : 'required', 'ulid'],
            'assisted_household_member_id' => [$saved ? 'exclude' : 'nullable', 'ulid'],
            'actual_release_on' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:today']];
    }
}
