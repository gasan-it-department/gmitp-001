<?php

namespace App\Core\Cemetery\Traits;

use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Tenancy mix-in for Cemetery models (SR-1).
 *
 * Provides a uniform `municipality()` relation and a `forMunicipality()` query
 * scope so every read/write path expresses the tenant boundary the same way.
 *
 * Deliberate non-goal: this trait does NOT install a global scope. Global
 * scopes here would silently bend Spatie Activitylog and MediaLibrary queries
 * (which read by raw key) and surprise unrelated callers. Tenancy stays
 * explicit — every Action / repository call site uses `forMunicipality($id)`
 * or `where('municipal_id', $id)`. The id ALWAYS comes from
 * `app('municipal_id')`, bound by SetMunicipalityContext middleware — never
 * from the request payload (SR-1).
 */
trait BelongsToMunicipality
{
    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class, 'municipal_id');
    }

    /**
     * Convenience scope so call sites read fluently:
     *   `Plot::forMunicipality(app('municipal_id'))->where(...)`.
     */
    public function scopeForMunicipality(Builder $query, string $municipalId): Builder
    {
        return $query->where($this->qualifyColumn('municipal_id'), $municipalId);
    }
}
