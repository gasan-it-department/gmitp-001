<?php

namespace App\External\Api\Request\GoodsDistribution;

use App\Core\GoodsDistribution\Enums\DistributionStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class RecipientProfilePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.requests.view');
    }

    public function rules(): array
    {
        return [
            'tab' => ['nullable', 'in:overview,received,requests'], 'program_id' => ['nullable', 'ulid'],
            'status' => ['nullable', Rule::enum(DistributionStatus::class)], 'role' => ['nullable', 'in:all,recipient,filer'],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => array_filter(['nullable', 'date_format:Y-m-d', $this->filled('from') ? 'after_or_equal:from' : null]),
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
