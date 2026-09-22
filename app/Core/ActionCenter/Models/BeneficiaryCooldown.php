<?php

namespace App\Core\ActionCenter\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One row per beneficiary, assistance type, and released request.
 *
 * Inserted atomically by the release workflow. Read by the eligibility
 * checker on every Apply-page load and again server-side in the store action so
 * the citizen can't bypass the front-end gate.
 *
 * - cooldown_expires_at NULL → permanent block for one_time programs
 * - cooldown_expires_at FUTURE → on cooldown until that timestamp
 * - cooldown_expires_at PAST → effectively eligible (row kept for audit)
 *
 * For per_household scope the release action writes one row per active linked
 * household member at release time, all sharing the
 * same household_id so the lookup index stays single-column on household_id.
 */
class BeneficiaryCooldown extends Model
{
    use HasUlids;

    protected $table = 'ac_beneficiary_cooldowns';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'beneficiary_id',
        'assistance_type_id',
        'assistance_request_id',
        'household_member_id',
        'household_id',
        'cooldown_starts_at',
        'cooldown_expires_at',
    ];

    protected $casts = [
        'cooldown_starts_at' => 'datetime',
        'cooldown_expires_at' => 'datetime',
    ];

    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(Beneficiary::class, 'beneficiary_id');
    }

    public function assistanceType(): BelongsTo
    {
        return $this->belongsTo(AssistanceType::class, 'assistance_type_id');
    }

    public function assistanceRequest(): BelongsTo
    {
        return $this->belongsTo(AssistanceRequest::class, 'assistance_request_id');
    }

    /**
     * Roster member captured for a household-scoped release. Null for a
     * beneficiary-scoped cooldown.
     */
    public function householdMember(): BelongsTo
    {
        return $this->belongsTo(HouseholdMember::class, 'household_member_id');
    }

    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class, 'household_id');
    }
}
