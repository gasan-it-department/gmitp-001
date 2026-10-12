<?php

namespace App\External\Api\Request\GoodsDistribution;

use Illuminate\Foundation\Http\FormRequest;

final class SearchItemsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.access') && $this->user()->can('goods_distribution.inventory.view');
    }

    public function rules(): array
    {
        return ['q' => ['nullable', 'string', 'max:255'], 'program_id' => ['nullable', 'ulid'], 'page' => ['sometimes', 'integer', 'min:1'], 'catalog_scope' => ['sometimes', 'in:program,shared']];
    }
}
