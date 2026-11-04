<?php

namespace App\Core\ActionCenter\Services;

use App\Core\ActionCenter\Enums\AssistanceDisbursementStatus;
use App\Core\ActionCenter\Models\AssistanceDisbursement;
use Illuminate\Database\Eloquent\Builder;

class AssistanceDisbursementReferenceService
{
    public function matches(string $municipalId, string $method, string $reference, ?string $excludeId = null): Builder
    {
        return AssistanceDisbursement::query()
            ->where('municipal_id', $municipalId)
            ->where('method', $method)
            ->where('instrument_reference_number', $reference)
            ->when($excludeId !== null, fn (Builder $query) => $query->whereKeyNot($excludeId));
    }

    public function blocking(Builder $query): Builder
    {
        return $query->where('status', '!=', AssistanceDisbursementStatus::Voided->value);
    }

    public function containing(Builder $query, string $search): Builder
    {
        $literal = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], mb_strtolower(trim($search)));

        return $query->whereRaw("LOWER(instrument_reference_number) LIKE ? ESCAPE '!'", ['%'.$literal.'%']);
    }
}
