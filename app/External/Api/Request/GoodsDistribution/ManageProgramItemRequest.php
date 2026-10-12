<?php

namespace App\External\Api\Request\GoodsDistribution;

use Illuminate\Foundation\Http\FormRequest;

final class ManageProgramItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.inventory.manage');
    }

    public function rules(): array
    {
        return [
            'item_id' => $this->route('itemId') ? ['prohibited'] : ['required', 'ulid'],
            'is_active' => $this->route('itemId') ? ['required', 'boolean'] : ['prohibited'],
            'reactivate_global' => ['sometimes', 'boolean'],
        ];
    }
}
