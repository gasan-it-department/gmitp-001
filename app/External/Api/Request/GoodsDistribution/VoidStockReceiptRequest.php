<?php

namespace App\External\Api\Request\GoodsDistribution;

use Illuminate\Foundation\Http\FormRequest;

final class VoidStockReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.inventory.manage') || $this->user()->can('goods_distribution.inventory.adjust');
    }

    public function rules(): array
    {
        return ['reason' => ['required', 'string', 'min:5', 'max:1000']];
    }
}
