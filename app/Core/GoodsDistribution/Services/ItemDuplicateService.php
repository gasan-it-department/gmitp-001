<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\GoodsDistribution\Models\Item;
use Illuminate\Validation\ValidationException;

final class ItemDuplicateService
{
    public const FIELDS = ['id', 'code', 'name', 'base_unit', 'category', 'description', 'is_active'];

    public function __construct(private readonly ItemIdentityService $identity) {}

    public function check(string $municipalId, string $name, string $unit, ?string $excludeId = null): array
    {
        if ($excludeId !== null && ! Item::query()->where('municipal_id', $municipalId)->whereKey($excludeId)->exists()) {
            throw ValidationException::withMessages(['exclude_id' => 'Select an item from this municipality.']);
        }
        $matches = [];
        foreach (Item::query()->where('municipal_id', $municipalId)->when($excludeId, fn ($q) => $q->where('id', '<>', $excludeId))->with('programItems.program')->orderBy('id')->lazy() as $item) {
            $type = $this->identity->matchType($name, $unit, $item->name, $item->base_unit);
            if ($type !== null) {
                $matches[] = [...$item->only(self::FIELDS), 'match_type' => $type,
                    'connected_programs' => $item->programItems->map(fn ($membership) => ['id' => $membership->program_id, 'name' => $membership->program->name, 'is_active' => $membership->is_active])->values()->all()];
            }
        }

        return ['matches' => $matches, 'reviewed_item_ids' => array_values(array_column(array_filter($matches, fn ($m) => $m['match_type'] === 'possible'), 'id'))];
    }

    public function validateSave(string $municipalId, array $data, ?string $excludeId): array
    {
        if ($this->identity->normalize($data['name']) === '') {
            throw ValidationException::withMessages(['name' => 'Enter an item name containing letters or numbers.']);
        }
        $check = $this->check($municipalId, $data['name'], $data['base_unit'], $excludeId);
        if (in_array('exact', array_column($check['matches'], 'match_type'), true)) {
            throw ValidationException::withMessages(['name' => 'An item with this name and base unit already exists, including inactive items.']);
        }
        $reviewed = $data['reviewed_item_ids'] ?? [];
        $current = $check['reviewed_item_ids'];
        if (! is_array($reviewed) || count(array_filter($reviewed, 'is_string')) !== count($reviewed)) {
            throw ValidationException::withMessages(['reviewed_item_ids' => 'Review the current possible duplicates again.']);
        }
        sort($reviewed);
        sort($current);
        if ($reviewed !== $current) {
            throw ValidationException::withMessages(['reviewed_item_ids' => 'Possible duplicates have changed. Review the current matches before saving.']);
        }
        if ($current === []) {
            return [];
        }
        $reason = is_string($data['duplicate_reason'] ?? null) ? trim($data['duplicate_reason']) : '';
        if (mb_strlen($reason) < 5 || mb_strlen($reason) > 1000) {
            throw ValidationException::withMessages(['duplicate_reason' => 'Explain why this is a separate item in 5 to 1000 characters.']);
        }

        return ['reviewed_item_ids' => $current, 'duplicate_reason' => $reason];
    }
}
