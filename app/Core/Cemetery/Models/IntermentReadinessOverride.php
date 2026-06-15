<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Traits\BelongsToMunicipality;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class IntermentReadinessOverride extends Model
{
    use BelongsToMunicipality, LogsActivity;

    protected $table = 'cemetery_interment_readiness_overrides';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id', 'municipal_id', 'decedent_id', 'missing_requirements', 'reason',
        'evidence_reference', 'expires_at', 'consumed_at', 'created_by', 'consumed_by',
    ];

    protected $casts = [
        'missing_requirements' => 'array',
        'expires_at' => 'datetime',
        'consumed_at' => 'datetime',
    ];

    public function decedent(): BelongsTo
    {
        return $this->belongsTo(Decedent::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isUsable(): bool
    {
        return $this->consumed_at === null && $this->expires_at->isFuture();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontLogEmptyChanges()
            ->useLogName('cemetery_interment_readiness_override');
    }
}
