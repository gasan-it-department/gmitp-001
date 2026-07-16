<?php

namespace App\Core\ActionCenter\Models;

use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * An admin-raised (or system-raised) flag on a beneficiary.
 *
 * severity:
 *   - 'warning'   → advisory; surfaced to admins, does NOT block self-service.
 *   - 'blacklist' → hard block; the eligibility checker refuses ALL standard
 *                   self-service applications while an active blacklist flag
 *                   exists for the identity group.
 *
 * expires_at: NULL = permanent; otherwise the flag stops affecting eligibility
 * once that timestamp passes (the row is kept for audit either way).
 *
 * Written by MergeBeneficiaryAction (duplicate_merge) and the profile-setup
 * duplicate detector (potential_duplicate); read by CheckElegibilityAction.
 */
class BeneficiaryFlag extends Model
{
    use HasUlids;

    public const SEVERITY_WARNING = 'warning';
    public const SEVERITY_BLACKLIST = 'blacklist';

    protected $table = 'ac_beneficiary_flags';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'beneficiary_id',
        'user_id',
        'reason',
        'severity',
        'notes',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(Beneficiary::class, 'beneficiary_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Active = not yet expired (NULL expiry is permanent). Use on either
     * severity; the eligibility checker pairs it with severity = blacklist.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
        });
    }
}
