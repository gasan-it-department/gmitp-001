<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Enums\CemeteryServiceRequestConsentMethod;
use App\Core\Cemetery\Enums\CemeteryServiceRequestType;
use App\Core\Cemetery\Traits\BelongsToMunicipality;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class CemeteryServiceRequest extends Model implements HasMedia
{
    use BelongsToMunicipality, InteractsWithMedia, LogsActivity, SoftDeletes;

    protected $table = 'cemetery_service_requests';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'municipal_id',
        'requestable_type',
        'requestable_id',
        'request_type',
        'requesting_party_name',
        'requesting_party_contact',
        'requesting_party_address',
        'requesting_party_relationship',
        'requester_is_leaseholder',
        'leaseholder_name_snapshot',
        'leaseholder_contact_snapshot',
        'leaseholder_consent_confirmed',
        'leaseholder_consent_method',
        'leaseholder_consent_reference',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'request_type' => CemeteryServiceRequestType::class,
        'requester_is_leaseholder' => 'boolean',
        'leaseholder_consent_confirmed' => 'boolean',
        'leaseholder_consent_method' => CemeteryServiceRequestConsentMethod::class,
    ];

    public function requestable(): MorphTo
    {
        return $this->morphTo();
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('authorization_evidence')
            ->singleFile()
            ->useDisk('local')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'requestable_type',
                'requestable_id',
                'request_type',
                'requesting_party_name',
                'requesting_party_contact',
                'requesting_party_address',
                'requesting_party_relationship',
                'requester_is_leaseholder',
                'leaseholder_name_snapshot',
                'leaseholder_contact_snapshot',
                'leaseholder_consent_confirmed',
                'leaseholder_consent_method',
                'leaseholder_consent_reference',
                'notes',
                'created_by',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('cemetery_service_request');
    }
}
