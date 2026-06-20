<?php

namespace App\Core\ActionCenter\Models;

use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\Users\Models\User;
use Carbon\CarbonImmutable;
use Database\Factories\AssistanceRequestFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * The main transaction table for the Action Center. One row per citizen
 * assistance request. The frozen snapshot payload now lives in the
 * ac_assistance_request_snapshots table; the request row keeps only metadata
 * for the representative/on-behalf block.
 */
class AssistanceRequest extends Model implements HasMedia
{
    use HasFactory, HasUlids, InteractsWithMedia, LogsActivity, SoftDeletes;

    protected $table = 'ac_assistance_requests';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'municipal_id',
        'beneficiary_id',
        'household_id',
        'encoded_by_user_id',
        'reviewed_by_user_id',
        'approved_by_user_id',
        'rejected_by_user_id',
        'cancelled_by_user_id',
        'released_by_user_id',
        'release_reference_number',
        'assistance_type_id',
        'metadata',
        'on_behalf_household_member_id',
        'amount_approved',
        'transaction_number',
        'status',
        'description',
        'remarks',
        'approved_at',
        'released_at',
        'rejected_at',
        'cancelled_at',
        'privacy_consented_at',
        'privacy_notice_version',
    ];

    protected $casts = [
        'status' => AssistanceStatus::class,
        'amount_approved' => 'decimal:2',
        'approved_at' => 'datetime',
        'released_at' => 'datetime',
        'rejected_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'privacy_consented_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'status',
                'amount_approved',
                'remarks',
                'reviewed_by_user_id',
                'approved_by_user_id',
                'rejected_by_user_id',
                'cancelled_by_user_id',
                'released_by_user_id',
                'release_reference_number',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('assistance_request');
    }

    protected static function newFactory()
    {
        return AssistanceRequestFactory::new();
    }

    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(Beneficiary::class, 'beneficiary_id');
    }

    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class, 'household_id');
    }

    public function snapshot(): HasOne
    {
        return $this->hasOne(AssistanceRequestSnapshot::class, 'assistance_request_id');
    }

    public function onBehalfHouseholdMember(): BelongsTo
    {
        return $this->belongsTo(HouseholdMember::class, 'on_behalf_household_member_id');
    }

    public function assistanceType(): BelongsTo
    {
        return $this->belongsTo(AssistanceType::class, 'assistance_type_id');
    }

    public function encodedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'encoded_by_user_id');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by_user_id');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by_user_id');
    }

    public function releasedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'released_by_user_id');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('documents')
            ->acceptsMimeTypes([
                'application/pdf',
                'image/jpeg',
                'image/png',
            ]);

        $this->addMediaCollection('photos')
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
            ]);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->performOnCollections('photos')
            ->width(300)
            ->height(300)
            ->sharpen(10);

        $this->addMediaConversion('web')
            ->performOnCollections('photos')
            ->width(1200)
            ->quality(85);
    }

    public function getRelationshipToBeneficiaryAttribute(): ?Relationship
    {
        $value = data_get($this->metadata, 'relationship_to_beneficiary');

        return $value ? Relationship::tryFrom($value) : null;
    }

    public function getOnBehalfFirstNameAttribute(): ?string
    {
        return data_get($this->metadata, 'on_behalf_first_name');
    }

    public function getOnBehalfMiddleNameAttribute(): ?string
    {
        return data_get($this->metadata, 'on_behalf_middle_name');
    }

    public function getOnBehalfLastNameAttribute(): ?string
    {
        return data_get($this->metadata, 'on_behalf_last_name');
    }

    public function getOnBehalfSuffixAttribute(): ?string
    {
        return data_get($this->metadata, 'on_behalf_suffix');
    }

    public function getOnBehalfDateOfDeathAttribute(): ?CarbonImmutable
    {
        $value = data_get($this->metadata, 'on_behalf_date_of_death');

        return $value ? CarbonImmutable::parse($value) : null;
    }

    public function getOnBehalfBirthDateAttribute(): ?CarbonImmutable
    {
        $value = data_get($this->metadata, 'on_behalf_birth_date');

        return $value ? CarbonImmutable::parse($value) : null;
    }

    public function getRecipientIdExceptionAttribute(): ?string
    {
        return data_get($this->metadata, 'recipient_id_exception');
    }

    public function getRecipientIdExceptionReasonAttribute(): ?string
    {
        return data_get($this->metadata, 'recipient_id_exception_reason');
    }

    public function getSnapshotFirstNameAttribute(): ?string
    {
        return $this->snapshot?->first_name;
    }

    public function getSnapshotLastNameAttribute(): ?string
    {
        return $this->snapshot?->last_name;
    }

    public function getSnapshotMiddleNameAttribute(): ?string
    {
        return $this->snapshot?->middle_name;
    }

    public function getSnapshotSuffixAttribute(): ?string
    {
        return $this->snapshot?->suffix;
    }

    public function getSnapshotSexAttribute(): ?string
    {
        return $this->snapshot?->sex;
    }

    public function getSnapshotBirthDateAttribute(): mixed
    {
        return $this->snapshot?->birth_date;
    }

    public function getSnapshotEducationalAttainmentAttribute(): ?string
    {
        return $this->snapshot?->educational_attainment;
    }

    public function getSnapshotReligionAttribute(): ?string
    {
        return $this->snapshot?->religion;
    }

    public function getSnapshotCivilStatusAttribute(): ?string
    {
        return $this->snapshot?->civil_status;
    }

    public function getSnapshotOccupationAttribute(): ?string
    {
        return $this->snapshot?->occupation;
    }

    public function getSnapshotMonthlyIncomeAttribute(): mixed
    {
        return $this->snapshot?->monthly_income;
    }

    public function getSnapshotHouseholdTotalIncomeAttribute(): mixed
    {
        return $this->snapshot?->household_total_income;
    }

    public function getSnapshotBarangayAttribute(): ?string
    {
        return $this->snapshot?->barangay;
    }

    public function getSnapshotBarangayPsgcCodeAttribute(): ?string
    {
        return $this->snapshot?->barangay_psgc_code;
    }

    public function getSnapshotStreetAttribute(): ?string
    {
        return $this->snapshot?->street;
    }
}
