<?php

namespace App\External\Api\Request\GoodsDistribution;

use Illuminate\Foundation\Http\FormRequest;

final class AdjustStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.inventory.adjust');
    }

    public function rules(): array
    {
        return [
            'operation_key' => ['required', 'uuid'], 'reason' => ['required', 'string', 'min:5', 'max:1000'],
            'reference' => ['required', 'string', 'max:150'],
            ...($this->route('lineId') ? ['direction' => ['required', 'in:add,remove'], 'quantity' => ['required', 'string', 'regex:/^\d{1,12}(?:\.\d{1,3})?$/']] : []),
        ];
    }
}
