<?php

namespace App\External\Api\Request\GoodsDistribution;

use App\Core\GoodsDistribution\Enums\StockUnit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class CheckItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.access') && $this->user()->can('goods_distribution.inventory.view') && $this->user()->can('goods_distribution.inventory.manage');
    }

    public function rules(): array
    {
        return ['name' => ['required', 'string', 'max:255'], 'base_unit' => ['required', Rule::enum(StockUnit::class)], 'exclude_id' => ['nullable', 'ulid']];
    }
}
