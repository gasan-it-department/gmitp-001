<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Enums\DecedentTypes;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
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
    use InteractsWithMedia, LogsActivity, SoftDeletes;

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
        'reference_document_type',
        'reference_document_number',
        'place_of_death',
        'gender',
        'cause_of_death',
        'death_certificate_no',
        'notes',
        'municipal_id',
        'address_id',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'date_of_death' => 'date',
        'date_of_registration' => 'date',
        'decedent_type' => DecedentTypes::class,
    ];

    /**
     * A decedent has at most one active interment lifecycle record. We treat
     * the latest interment row as the "current" one — exhumation/transfer
     * creates a new row via the lifecycle use cases.
     */
    public function currentInterment(): HasOne
    {
        return $this->hasOne(Interment::class, 'decedent_id')->latestOfMany();
    }

    public function interments(): HasMany
    {
        return $this->hasMany(Interment::class, 'decedent_id');
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
                'decedent_type',
                'reference_document_type',
                'reference_document_number',
                'place_of_death',
                'gender',
                'cause_of_death',
                'death_certificate_no',
                'notes',
                'address_id',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('cemetery_decedent');
    }

    /**
     * Identification layer (Spatie MediaLibrary). `avatar` is a single profile
     * photo; `identification` holds the supporting documents (IDs, reference
     * papers) and accepts multiple files including PDFs.
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

        $this->addMediaCollection('identification')
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
}
