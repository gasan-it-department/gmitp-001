<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\GoodsDistribution\Enums\ItemCategory;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\ProgramItem;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

final class ItemLookupService
{
    public function __construct(private readonly ItemIdentityService $identity) {}

    public function search(string $municipalId, string $q = '', ?string $programId = null, int $page = 1, string $catalogScope = 'program'): LengthAwarePaginator
    {
        if ($programId !== null && ! Program::query()->where('municipal_id', $municipalId)->whereKey($programId)->exists()) {
            throw ValidationException::withMessages(['program_id' => 'Select a program from this municipality.']);
        }
        $needle = $this->identity->normalize($q);
        $tokens = $needle === '' ? [] : explode(' ', $needle);
        // Shared PHP normalization keeps Unicode identity/search behavior independent of database collation.
        $memberships = $programId ? ProgramItem::query()->where('municipal_id', $municipalId)->where('program_id', $programId)->get()->keyBy('item_id') : collect();
        $items = Item::query()->select(ItemDuplicateService::FIELDS)->where('municipal_id', $municipalId)
            ->when($catalogScope !== 'shared', fn ($query) => $query->where('is_active', true))
            ->when($programId !== null && $catalogScope !== 'shared', fn ($query) => $query->whereHas('programItems', fn ($query) => $query->where('municipal_id', $municipalId)->where('program_id', $programId)->where('is_active', true)))
            ->with('programItems.program')
            ->withExists(['receiptLines as base_unit_locked' => fn ($query) => $query->where('municipal_id', $municipalId)])
            ->withExists(['receiptLines as program_used' => fn ($query) => $query->where('municipal_id', $municipalId)
                ->where('program_id', $programId)->whereHas('receipt', fn ($receipt) => $receipt->where('municipal_id', $municipalId)->whereNotNull('posted_at'))])
            ->get()->map(function (Item $item) use ($needle, $tokens, $programId, $memberships) {
                $name = $this->identity->normalize($item->name);
                $code = $this->identity->normalize($item->code);
                $category = ItemCategory::tryFrom($item->category ?? '')?->label() ?? $item->category ?? '';
                $text = implode(' ', [$name, $code, $this->identity->normalize($category), $this->identity->normalize($item->description ?? '')]);
                $rank = match (true) {
                    $needle === '' => 0,
                    $needle === $name || $needle === $code => 4,
                    str_starts_with($name, $needle) || str_starts_with($code, $needle) => 3,
                    str_contains($name, $needle) || str_contains($code, $needle) => 2,
                    count(array_filter($tokens, fn ($token) => str_contains($text, $token))) === count($tokens) => 1,
                    default => -1,
                };

                return ['record' => [...$item->only(ItemDuplicateService::FIELDS), 'base_unit_locked' => (bool) $item->base_unit_locked,
                    'program_item_active' => $memberships->get($item->id)?->is_active,
                    'connected_programs' => $item->programItems->map(fn ($membership) => ['id' => $membership->program_id, 'name' => $membership->program->name, 'is_active' => $membership->is_active])->values()->all()],
                    'rank' => $rank, 'program' => $programId !== null && $item->program_used ? 1 : 0, 'name' => $name];
            })->filter(fn ($item) => $item['rank'] >= 0)
            ->sort(fn ($a, $b) => ($b['rank'] <=> $a['rank']) ?: ($b['program'] <=> $a['program']) ?: strcmp($a['name'], $b['name']) ?: strcmp($a['record']['id'], $b['record']['id']))->values();

        return new LengthAwarePaginator($items->forPage($page, 20)->pluck('record')->values(), $items->count(), 20, $page);
    }
}
