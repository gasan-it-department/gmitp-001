<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Enums\IdentityStatus;
use App\Core\Cemetery\Enums\RegistrationStatus;
use App\Core\Cemetery\Enums\VitalRecordType;
use App\Core\Cemetery\Traits\BelongsToMunicipality;
use App\Core\Users\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Decedent extends Model implements HasMedia
{
    use BelongsToMunicipality, InteractsWithMedia, LogsActivity, SoftDeletes;

    protected $table = 'cemetery_decedents';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'memorial_name',
        'date_of_birth',
        'date_of_death',
        'date_of_registration',
        'decedent_type',
        'vital_record_type',
        'identity_status',
        'registration_status',
        'has_legal_name',
        'place_of_death',
        'gender',
        'cause_of_death',
        'death_certificate_no',
        'registry_number',
        'notes',
        'municipal_id',
        'psgc_municipality_id',
        'psgc_barangay_code',
        'street_name',
        'submitted_at',
        'submitted_by',
        'verified_at',
        'verified_by',
        'version',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'date_of_death' => 'date',
        'date_of_registration' => 'date',
        'vital_record_type' => VitalRecordType::class,
        'identity_status' => IdentityStatus::class,
        'registration_status' => RegistrationStatus::class,
        'has_legal_name' => 'boolean',
        'submitted_at' => 'datetime',
        'verified_at' => 'datetime',
        'version' => 'integer',
    ];

    /**
     * A decedent has at most one active interment lifecycle record. We treat
     * the latest interment row as the "current" one — exhumation/transfer
     * creates a new row via the lifecycle use cases.
     */
    public function currentInterment(): HasOne
    {
        return $this->hasOne(Interment::class, 'decedent_id')->active()->latestOfMany();
    }

    public function latestInterment(): HasOne
    {
        return $this->hasOne(Interment::class, 'decedent_id')->latestOfMany('created_at');
    }

    public function interments(): HasMany
    {
        return $this->hasMany(Interment::class, 'decedent_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DecedentDocument::class);
    }

    public function unidentifiedDetail(): HasOne
    {
        return $this->hasOne(UnidentifiedDetail::class);
    }

    public function readinessOverrides(): HasMany
    {
        return $this->hasMany(IntermentReadinessOverride::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    /**
     * Strict audit trail (REQ — Spatie Activitylog). We log only the business
     * columns and only when they actually change. Tenancy/identity columns
     * (id, municipal_id) are intentionally excluded — they never mutate.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'first_name',
                'last_name',
                'middle_name',
                'suffix',
                'memorial_name',
                'date_of_birth',
                'date_of_death',
                'date_of_registration',
                'vital_record_type',
                'identity_status',
                'registration_status',
                'has_legal_name',
                'place_of_death',
                'gender',
                'cause_of_death',
                'death_certificate_no',
                'registry_number',
                'notes',
                'psgc_municipality_id',
                'psgc_barangay_code',
                'street_name',
                'submitted_at',
                'submitted_by',
                'verified_at',
                'verified_by',
                'version',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('cemetery_decedent');
    }

    /** Private profile photo and evidence retained for each authorized correction. */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')
            ->singleFile()
            ->useDisk('local')
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
                'image/webp',
            ]);

        $this->addMediaCollection('correction_evidence')
            ->useDisk('local')
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
                'image/webp',
                'application/pdf',
            ]);
    }

    /**
     * Derived age at death — null when either date is missing.
     */
    protected function age(): Attribute
    {
        return Attribute::make(
            get: function (): ?int {
                if (! $this->date_of_birth || ! $this->date_of_death) {
                    return null;
                }

                return (int) Carbon::parse($this->date_of_birth)
                    ->diffInYears(Carbon::parse($this->date_of_death));
            }
        );
    }

    protected function lifeStage(): Attribute
    {
        return Attribute::make(
            get: function (): ?string {
                if ($this->vital_record_type === VitalRecordType::FETAL_DEATH) {
                    return 'fetal';
                }

                $age = $this->age;
                if ($age === null) {
                    return null;
                }

                return match (true) {
                    $age < 1 => 'infant',
                    $age < 18 => 'child',
                    default => 'adult',
                };
            }
        );
    }
}
