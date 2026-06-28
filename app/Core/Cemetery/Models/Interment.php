<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Traits\BelongsToMunicipality;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'interment_date',
        'type',
        'notes',
    ];

    protected $casts = [
        'interment_date' => 'date',
    ];

    public function decedent(): BelongsTo
    {
        return $this->belongsTo(Decedent::class, 'decedent_id');
    }

    /**
     * Always a LEAF/CHILD plot row (BR-4). Reach the container via
     * `$this->plot->parent` when the UI needs to display the parent name.
     */
    public function plot(): BelongsTo
    {
        return $this->belongsTo(Plot::class, 'plot_id');
    }

    public function lease(): HasOne
    {
        return $this->hasOne(PlotLease::class, 'interment_id');
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
                'interment_date',
                'type',
                'notes',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('cemetery_interment');
    }
}
