<?php

namespace App\External\Api\Request\GoodsDistribution;

use App\Core\GoodsDistribution\Enums\ReceiptKind;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class SaveStockReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.inventory.manage');
    }

    public function rules(): array
    {
        $quantity = ['nullable', 'string', 'regex:/^\d{1,12}(?:\.\d{1,3})?$/'];

        return [
            'kind' => ['required', Rule::enum(ReceiptKind::class)], 'stock_source_id' => ['required', 'ulid'], 'storage_location_id' => ['required', 'ulid'],
            'received_on' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'], 'reference' => ['nullable', 'string', 'max:150'],
            'notes' => ['nullable', 'string', 'max:2000'], 'draft_fingerprint' => [$this->route('receiptId') ? 'required' : 'nullable', 'string', 'size:64'],
            'lines' => ['required', 'array', 'min:1', 'max:100'], 'lines.*.item_id' => ['required', 'ulid'], 'lines.*.program_id' => ['nullable', 'ulid'],
            'lines.*.quantity' => $quantity, 'lines.*.package_type' => ['nullable', 'in:sack,pack,box'],
            'lines.*.package_count' => ['nullable', 'integer', 'min:1', 'max:2147483647'], 'lines.*.quantity_per_package' => $quantity,
            'lines.*.batch_reference' => ['nullable', 'string', 'max:100'], 'lines.*.expires_on' => ['nullable', 'date_format:Y-m-d'], 'lines.*.notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
