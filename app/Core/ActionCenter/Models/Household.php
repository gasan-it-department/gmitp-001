<?php

namespace App\Core\ActionCenter\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * One row per family unit. Created when a citizen completes their address
 * during profile setup. Members are managed in ac_household_members.
 *
 * The denormalized address columns (province / municipality / barangay / street)
 * are the household's primary address; assistance_requests snapshot a copy of
 * these onto each request so historical addresses are preserved even if the
 * household later moves.
 */
class Household extends Model
{
    use HasUlids, SoftDeletes;

    protected $table = 'ac_households';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'municipal_id',
        'household_code',
        'barangay',
        'barangay_psgc_code',
        'street',
    ];

    public function members(): HasMany
    {
        // The pivot-style table that holds the family composition.
        // Active members live here; moves-out flip is_active = false.
        return $this->hasMany(HouseholdMember::class, 'household_id');
    }

    public function activeMembers(): HasMany
    {
        return $this->members()->where('is_active', true);
    }

    public function assistanceRequests(): HasMany
    {
        return $this->hasMany(AssistanceRequest::class, 'household_id');
    }
}
