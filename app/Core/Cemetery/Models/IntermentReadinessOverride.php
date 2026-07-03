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
        'evidence_reference', 'consumed_at', 'created_by', 'consumed_by',
        'consumed_by_interment_id',
    ];

    protected $casts = [
        'missing_requirements' => 'array',
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

    public function consumedByInterment(): BelongsTo
    {
        return $this->belongsTo(Interment::class, 'consumed_by_interment_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontLogEmptyChanges()
            ->useLogName('cemetery_interment_readiness_override');
    }
}
