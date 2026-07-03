<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Traits\BelongsToMunicipality;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Interment extends Model
{
    use BelongsToMunicipality, LogsActivity, SoftDeletes;

    protected $table = 'cemetery_interments';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'municipal_id',
        'decedent_id',
        'plot_id',
        'previous_interment_id',
        'interment_date',
        'type',
        'notes',
        'ended_at',
        'ended_by',
        'end_type',
        'end_reason',
        'end_notes',
        'transfer_destination',
        'permit_reference',
        'voided_at',
        'voided_by',
        'void_reason',
    ];

    protected $casts = [
        'interment_date' => 'date',
        'ended_at' => 'datetime',
        'voided_at' => 'datetime',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query
            ->whereNull('ended_at')
            ->whereNull('voided_at');
    }

    public function scopeEnded(Builder $query): Builder
    {
        return $query->whereNotNull('ended_at');
    }

    public function scopeVoided(Builder $query): Builder
    {
        return $query->whereNotNull('voided_at');
    }

    public function decedent(): BelongsTo
    {
        return $this->belongsTo(Decedent::class, 'decedent_id');
    }

    public function plot(): BelongsTo
    {
        return $this->belongsTo(Plot::class, 'plot_id');
    }

    public function previousInterment(): BelongsTo
    {
        return $this->belongsTo(Interment::class, 'previous_interment_id');
    }

    public function nextInterments(): HasMany
    {
        return $this->hasMany(Interment::class, 'previous_interment_id');
    }

    public function activeNextInterment(): HasOne
    {
        return $this->hasOne(Interment::class, 'previous_interment_id')->active()->latestOfMany();
    }

    public function endedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ended_by');
    }

    public function voidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'decedent_id',
                'plot_id',
                'previous_interment_id',
                'interment_date',
                'type',
                'notes',
                'ended_at',
                'ended_by',
                'end_type',
                'end_reason',
                'end_notes',
                'transfer_destination',
                'permit_reference',
                'voided_at',
                'voided_by',
                'void_reason',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('cemetery_interment');
    }
}
