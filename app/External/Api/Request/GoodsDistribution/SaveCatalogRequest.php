<?php

namespace App\External\Api\Request\GoodsDistribution;

use App\Core\GoodsDistribution\Enums\CatalogKind;
use App\Core\GoodsDistribution\Enums\CooldownScope;
use App\Core\GoodsDistribution\Enums\CooldownUnit;
use App\Core\GoodsDistribution\Enums\ItemCategory;
use App\Core\GoodsDistribution\Enums\StockUnit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class SaveCatalogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.inventory.manage');
    }

    public function rules(): array
    {
        $kind = CatalogKind::from($this->route('catalog'));

        return [
            'code' => ['exclude'],
            'name' => ['required', 'string', 'max:255'], 'is_active' => ['required', 'boolean'],
            'confirm_shared_change' => ['sometimes', 'boolean'],
            ...match ($kind) {
                CatalogKind::Items => [
                    'base_unit' => ['required', Rule::enum(StockUnit::class)],
                    // Updates also validate under lock to preserve only the record's unchanged legacy category.
                    'category' => ['nullable', 'string', 'max:50', ...($this->route('recordId') ? [] : [Rule::enum(ItemCategory::class)])],
                    'description' => ['nullable', 'string', 'max:2000'],
                    'reviewed_item_ids' => ['sometimes', 'array'], 'reviewed_item_ids.*' => ['required', 'ulid', 'distinct'],
                    'duplicate_reason' => ['nullable', 'string'],
                ],
                CatalogKind::Programs => ['description' => ['nullable', 'string', 'max:2000'],
                    'cooldown_enabled' => ['sometimes', 'boolean'], 'cooldown_scope' => ['sometimes', Rule::enum(CooldownScope::class)],
                    'cooldown_duration' => ['nullable', 'integer', 'min:1', 'max:3650'],
                    'cooldown_unit' => ['nullable', Rule::enum(CooldownUnit::class)]],
                CatalogKind::Sources => [
                    'source_type' => ['required', 'in:private_donor,government,lgu,other,unknown'],
                    'contact_name' => ['nullable', 'string', 'max:255'], 'contact_phone' => ['nullable', 'string', 'max:40'],
                    'contact_email' => ['nullable', 'email', 'max:255'], 'notes' => ['nullable', 'string', 'max:2000'],
                ],
                CatalogKind::Locations => ['address' => ['nullable', 'string', 'max:2000'], 'notes' => ['nullable', 'string', 'max:2000']],
            },
        ];
    }
}
