<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Enums\PlotLeaseStatus;
use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Enums\PlotTypes;
use App\Core\Cemetery\Traits\BelongsToMunicipality;
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

class Plot extends Model
{
    use BelongsToMunicipality, LogsActivity, SoftDeletes;

    protected $table = 'cemetery_plots';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'municipal_id',
        'cemetery_site_id',
        'block_id',
        'parent_plot_id',
        'name',
        'type',
        'status',
        'occupancy_mode',
        'row',
        'level',
        'position',
        'capacity',
    ];

    protected $casts = [
        'type' => PlotTypes::class,
        'status' => PlotStatus::class,
        'occupancy_mode' => PlotOccupancyMode::class,
        'level' => 'integer',
        'capacity' => 'integer',
    ];

    public function block(): BelongsTo
    {
        return $this->belongsTo(Block::class, 'block_id');
    }

    /**
     * Apartment parent/child grouping. Standard plots stay parentless even
     * when they allow shared occupancy.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Plot::class, 'parent_plot_id');
    }

    /**
     * Child niches of an apartment parent. Ordered by level for detail views.
     */
    public function slots(): HasMany
    {
        return $this->hasMany(Plot::class, 'parent_plot_id')
            ->orderBy('level');
    }

    public function interments(): HasMany
    {
        return $this->hasMany(Interment::class, 'plot_id');
    }

    public function leases(): HasMany
    {
        return $this->hasMany(PlotLease::class, 'plot_id');
    }

    public function activeLease(): HasOne
    {
        return $this->hasOne(PlotLease::class, 'plot_id')
            ->where('status', PlotLeaseStatus::ACTIVE->value)
            ->latestOfMany();
    }

    /**
     * Current interment on this leaf/slot. Exhumation soft-deletes the row,
     * so the SoftDeletes scope surfaces only the active occupant.
     * `latestOfMany` guards against any legacy duplicates.
     */
    public function activeInterment(): HasOne
    {
        return $this->hasOne(Interment::class, 'plot_id')->latestOfMany();
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    /**
     * Canonical slot identifier for UI display (SR-7).
     *   {name}                          when no level
     *   {name}-L{level}                 when stacked
     *   {name}-L{level}-{position}      when a grid position is also set
     *
     * Example: "A-12", "A-12-L3", "A-12-L3-LEFT".
     */
    public function slotLabel(): Attribute
    {
        return Attribute::make(
            get: function (): string {
                $label = (string) $this->name;

                if ($this->type === PlotTypes::APARTMENT_NICHE && $this->level !== null) {
                    $parts = ['F'.$this->level];

                    if (filled($this->row)) {
                        $parts[] = (string) $this->row;
                    }

                    if (filled($this->position)) {
                        $parts[] = (string) $this->position;
                    }

                    return $label.'-'.implode('-', $parts);
                }

                if ($this->level !== null) {
                    $label .= '-L'.$this->level;
                }

                if (filled($this->position)) {
                    $label .= '-'.$this->position;
                }

                return $label;
            }
        );
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'cemetery_site_id',
                'block_id',
                'parent_plot_id',
                'name',
                'type',
                'status',
                'occupancy_mode',
                'row',
                'level',
                'position',
                'capacity',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('cemetery_plot');
    }
}
