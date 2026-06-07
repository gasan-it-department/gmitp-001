<?php

namespace App\Core\ActionCenter\Models;

use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * The permanent identity record for any person served by the MSWD —
 * online citizens (linked via user_id) and walk-ins (user_id = NULL).
 *
 * One row per real person, forever. Never hard-deleted.
 */
class Beneficiary extends Model
{
    use HasUlids, SoftDeletes, LogsActivity;

    protected $table = 'ac_beneficiaries';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'household_id',
        'user_id',
        'beneficiary_number',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'sex',
        'birth_date',
        'religion_id',
        'educational_attainment',
        'civil_status',
        'occupation',
        'monthly_income',
        // Data Privacy Act (RA 10173) consent record — captured at profile setup.
        'terms_consented_at',
        'terms_version',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'terms_consented_at' => 'datetime',
        'monthly_income' => 'decimal:2',
        'civil_status' => CivilStatus::class,

    ];

    /**
     * Only log the fields an admin is permitted to edit (hard identity).
     * Excludes FK columns and system-managed consent timestamps — those
     * don't need a human-readable change entry.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'first_name',
                'middle_name',
                'last_name',
                'suffix',
                'sex',
                'birth_date',
                'religion_id',
                'educational_attainment',
                'civil_status',
                'occupation',
                'monthly_income',
            ])
            ->logOnlyDirty()        // skip no-op saves
            ->dontLogEmptyChanges() // skip if nothing actually changed
            ->useLogName('beneficiary');
    }

    /**
     * The household this beneficiary belongs to.
     * For online citizens, this is the household they are the head of
     * (created during profile completion).
     */
    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class, 'household_id');
    }

    /**
     * Optional link to a portal account.
     * NULL for walk-ins encoded directly by the admin.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * The beneficiary's stated religion (optional). Used by the request DTO
     * to snapshot the religion *name* on each filed request, so that historical
     * records survive any future re-naming of the religion row.
     */
    public function religion(): BelongsTo
    {
        return $this->belongsTo(Religion::class, 'religion_id');
    }

    /**
     * Every request this beneficiary has filed over time.
     */
    public function assistanceRequests(): HasMany
    {
        return $this->hasMany(AssistanceRequest::class, 'beneficiary_id');
    }

    /**
     * Convenience: full name in display form.
     */
    public function getFullNameAttribute(): string
    {
        return trim(implode(' ', array_filter([
            $this->first_name,
            $this->middle_name,
            $this->last_name,
            $this->suffix,
        ])));
    }
}
