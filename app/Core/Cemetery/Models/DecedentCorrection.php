<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Enums\CorrectionStatus;
use App\Core\Cemetery\Traits\BelongsToMunicipality;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class DecedentCorrection extends Model implements HasMedia
{
    use BelongsToMunicipality, InteractsWithMedia, LogsActivity;

    protected $table = 'cemetery_decedent_corrections';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'municipal_id',
        'decedent_id',
        'base_version',
        'original_values',
        'proposed_changes',
        'reason',
        'status',
        'requested_by',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
        'applied_at',
    ];

    protected $casts = [
        'original_values' => 'array',
        'proposed_changes' => 'array',
        'base_version' => 'integer',
        'status' => CorrectionStatus::class,
        'reviewed_at' => 'datetime',
        'applied_at' => 'datetime',
    ];

    public function decedent(): BelongsTo
    {
        return $this->belongsTo(Decedent::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('evidence')->singleFile()->useDisk('local')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontLogEmptyChanges()
            ->useLogName('cemetery_decedent_correction');
    }
}
