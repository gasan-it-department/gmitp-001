<?php

namespace App\Core\ActionCenter\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One row per beneficiary × assistance_type × approved request.
 *
 * Inserted by the approval workflow (NOT at submission). Read by the eligibility
 * checker on every Apply-page load and again server-side in the store action so
 * the citizen can't bypass the front-end gate.
 *
 * - cooldown_expires_at NULL → permanent block (one_time programs like Burial)
 * - cooldown_expires_at FUTURE → on cooldown until that timestamp
 * - cooldown_expires_at PAST → effectively eligible (row kept for audit)
 *
 * For per_household scope (e.g. Financial Assistance E.O.) the inserter writes
 * one row per registered household member at snapshot time, all sharing the
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
        'cooldown_starts_at'  => 'datetime',
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
     * The deceased / subject this cooldown is keyed to, for per-deceased
     * (independent) programs like Burial. NULL for ordinary per-beneficiary or
     * per-household cooldowns.
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
