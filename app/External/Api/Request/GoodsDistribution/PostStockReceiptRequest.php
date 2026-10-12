<?php

namespace App\External\Api\Request\GoodsDistribution;

use Illuminate\Foundation\Http\FormRequest;

final class PostStockReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.inventory.manage');
    }

    public function rules(): array
    {
        return ['draft_fingerprint' => ['required', 'string', 'size:64']];
    }
}
