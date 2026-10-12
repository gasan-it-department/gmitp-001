<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\ProgramItem;
use App\Core\GoodsDistribution\Models\StockReceipt;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

final class ProgramItemService
{
    public function activeProgram(string $municipalId, string $programId): Program
    {
        $program = Program::query()->where('municipal_id', $municipalId)->whereKey($programId)->firstOrFail();
        if (! $program->is_active) {
            throw ValidationException::withMessages(['program_id' => 'This program is inactive.']);
        }

        return $program;
    }

    public function requireEnabled(string $municipalId, string $programId, string $itemId, string $errorKey): void
    {
        if (! ProgramItem::query()->where('municipal_id', $municipalId)->where('program_id', $programId)->where('item_id', $itemId)->where('is_active', true)->exists()) {
            throw ValidationException::withMessages([$errorKey => 'Enable this item in the selected program before receiving stock.']);
        }
    }

    public function forReceipt(StockReceipt $receipt): Collection
    {
        return ProgramItem::query()->where('municipal_id', $receipt->municipal_id)
            ->whereIn('program_id', $receipt->lines->pluck('program_id')->filter())
            ->whereIn('item_id', $receipt->lines->pluck('item_id'))
            ->get()->keyBy(fn ($membership) => $membership->program_id.':'.$membership->item_id);
    }
}
