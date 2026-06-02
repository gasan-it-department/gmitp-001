<?php

namespace App\Core\Cemetery\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Interment extends Model
{
    use LogsActivity, SoftDeletes;

    protected $table = 'cemetery_interments';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'decedent_id',
        'plot_id',
        'status',
        'interment_date',
    ];

    protected $casts = [
        'interment_date' => 'date',
    ];

    public function decedent(): BelongsTo
    {
        return $this->belongsTo(Decedent::class, 'decedent_id');
    }

    public function plot(): BelongsTo
    {
        return $this->belongsTo(Plot::class, 'plot_id');
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
                'status',
                'interment_date',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('cemetery_interment');
    }
}
