<?php

namespace App\External\Api\Request\GoodsDistribution;

use App\Core\GoodsDistribution\Enums\ReceiptStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class InventoryPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.inventory.view');
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'], 'active' => ['nullable', 'in:active,inactive'],
            'status' => ['nullable', Rule::enum(ReceiptStatus::class)], 'kind' => ['nullable', 'in:sources,locations'],
            'source_id' => ['nullable', 'ulid'], 'location_id' => ['nullable', 'ulid'],
            'program_id' => ['nullable', 'regex:/^(unassigned|[0-9A-HJKMNP-TV-Z]{26})$/i'],
            'expiry' => ['nullable', 'in:expired,soon,none'],
            'tab' => ['nullable', 'in:stock,receipts,movements,items,documents,cooldown,dispatches'], 'include_zero' => ['nullable', 'boolean'],
            'year' => ['nullable', 'integer', 'between:1,9999'], 'quarter' => ['nullable', 'integer', 'between:1,4'],
            'page' => ['nullable', 'integer', 'min:1'], 'batch_page' => ['nullable', 'integer', 'min:1'], 'movement_page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
