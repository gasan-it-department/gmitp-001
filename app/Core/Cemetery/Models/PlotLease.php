<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Enums\PlotLeaseStatus;
use App\Core\Cemetery\Traits\BelongsToMunicipality;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class PlotLease extends Model
{
    use BelongsToMunicipality, LogsActivity, SoftDeletes;

    protected $table = 'cemetery_plot_leases';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'municipal_id',
        'created_from_interment_id',
        'plot_id',
        'leaseholder_name',
        'leaseholder_contact',
        'leaseholder_address',
        'leaseholder_relationship',
        'lease_start',
        'lease_end',
        'amount_paid',
        'or_number',
        'status',
        'notes',
    ];

    protected $casts = [
        'lease_start' => 'date',
        'lease_end' => 'date',
        'amount_paid' => 'decimal:2',
        'status' => PlotLeaseStatus::class,
    ];

    public function createdFromInterment(): BelongsTo
    {
        return $this->belongsTo(Interment::class, 'created_from_interment_id');
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
                'created_from_interment_id',
                'plot_id',
                'leaseholder_name',
                'leaseholder_contact',
                'leaseholder_address',
                'leaseholder_relationship',
                'lease_start',
                'lease_end',
                'amount_paid',
                'or_number',
                'status',
                'notes',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('cemetery_plot_lease');
    }
}
