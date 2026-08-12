<?php

namespace App\Core\ActionCenter\Models;

use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\ActionCenter\Enums\EducationalAttainment;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Image\Enums\Fit;
use Spatie\Image\Enums\Orientation;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * The permanent identity record for any person served by the MSWD —
 * online citizens (linked via user_id) and walk-ins (user_id = NULL).
 *
 * One row per real person, forever. Never hard-deleted.
 */
class Beneficiary extends Model implements HasMedia
{
    use HasUlids, InteractsWithMedia, LogsActivity, SoftDeletes;

    public const AVATAR_DISPLAY_CONVERSION = 'avatar-display';

    public const IDENTITY_DISPLAY_CONVERSION = 'identity-display';

    protected $table = 'ac_beneficiaries';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $attributes = [
        'is_active' => true,
    ];

    protected $fillable = [
        'household_id',
        'user_id',
        // Intrinsic tenant key. INVARIANT: always equals household.municipal_id
        // (the household is the source of truth) — it's a denormalised mirror
        // that also lets us enforce unique(user_id, municipal_id): one portal
        // login owns one beneficiary PER municipality, so a citizen served by
        // more than one LGU exists as separate, independently-owned records.
        'municipal_id',
        // Lifecycle flag (default true). Reserved for a future moved-out/deceased
        // flow that retires a record while keeping its history; nothing reads it
        // yet. Mirrors ac_household_members.is_active.
        'is_active',
        // Non-destructive duplicate merge: when set, THIS row is a duplicate
        // that was merged into the referenced canonical beneficiary. NULL for a
        // normal standalone record. See MergeBeneficiaryAction.
        'merged_into_beneficiary_id',
        'identity_verified_at',
        'identity_verified_by_user_id',
        'intake_rejected_at',
        'intake_rejected_by_user_id',
        'intake_rejection_reason',
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
        'contact_phone',
        // Data Privacy Act (RA 10173) consent record — captured at profile setup.
        'terms_consented_at',
        'terms_version',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'terms_consented_at' => 'datetime',
        'monthly_income' => 'decimal:2',
        'is_active' => 'boolean',
        'identity_verified_at' => 'datetime',
        'intake_rejected_at' => 'datetime',
        'civil_status' => CivilStatus::class,
        'educational_attainment' => EducationalAttainment::class,
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
                'contact_phone',
                'is_active',
                // The merge link is an admin identity decision — audit it.
                'merged_into_beneficiary_id',
                'identity_verified_at',
                'identity_verified_by_user_id',
                'intake_rejected_at',
                'intake_rejected_by_user_id',
                'intake_rejection_reason',
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

    public function identityVerifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'identity_verified_by_user_id');
    }

    public function intakeRejector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'intake_rejected_by_user_id');
    }

    public function scopeIdentityVerified(Builder $query): Builder
    {
        return $query->whereNotNull('identity_verified_at');
    }

    public function scopePendingIdentityVerification(Builder $query): Builder
    {
        return $query
            ->whereNull('identity_verified_at')
            ->whereNull('intake_rejected_at');
    }

    public function scopeIntakeRejected(Builder $query): Builder
    {
        return $query->whereNotNull('intake_rejected_at');
    }

    public function isIdentityVerified(): bool
    {
        return $this->identity_verified_at !== null;
    }

    public function isIntakeRejected(): bool
    {
        return $this->intake_rejected_at !== null;
    }

    public function intakeStatus(): string
    {
        if ($this->identity_verified_at !== null) {
            return 'verified';
        }

        if ($this->intake_rejected_at !== null) {
            return 'rejected';
        }

        return 'pending';
    }

    /**
     * The canonical record THIS row was merged into (when it's a duplicate).
     * NULL for a standalone / canonical record.
     */
    public function mergedInto(): BelongsTo
    {
        return $this->belongsTo(Beneficiary::class, 'merged_into_beneficiary_id');
    }

    /**
     * The duplicate records that were merged INTO this (canonical) row. Empty
     * for an ordinary record. The identity group = $this + these.
     */
    public function mergedDuplicates(): HasMany
    {
        return $this->hasMany(Beneficiary::class, 'merged_into_beneficiary_id');
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

    /**
     * Profile photo, captured by the admin during the interview (webcam → PC →
     * upload). `singleFile()` means a new upload REPLACES the previous one —
     * one current photo per beneficiary, no orphans. Lives on the same private
     * disk as request documents; served only through the authenticated
     * ShowBeneficiaryAvatarController, never a public URL.
     *
     * Only beneficiaries carry a photo. Household-member roster rows do not —
     * they earn one only once they're promoted to a beneficiary.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')
            ->singleFile()
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
                'image/webp',
            ]);

        $this->addMediaCollection('identity_id_front')
            ->singleFile()
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
                'application/pdf',
            ]);

        $this->addMediaCollection('identity_id_back')
            ->singleFile()
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
                'application/pdf',
            ]);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion(self::AVATAR_DISPLAY_CONVERSION)
            ->performOnCollections('avatar')
            ->fit(Fit::Crop, 512, 512)
            ->format('webp')
            ->quality(84)
            ->nonQueued();

        if (
            $media !== null
            && ! in_array($media->mime_type, ['image/jpeg', 'image/png'], true)
        ) {
            return;
        }

        $rotation = Orientation::tryFrom(
            (int) ($media?->getCustomProperty('display_rotation', 0) ?? 0),
        ) ?? Orientation::Rotate0;

        $this->addMediaConversion(self::IDENTITY_DISPLAY_CONVERSION)
            ->performOnCollections('identity_id_front', 'identity_id_back')
            ->orientation($rotation)
            ->fit(Fit::Max, 1800, 1800)
            ->format('webp')
            ->quality(88)
            ->nonQueued();
    }
}
