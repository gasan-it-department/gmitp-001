<?php

namespace App\Core\Cemetery\Models;

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
        'block_id',
        'parent_plot_id',
        'name',
        'type',
        'status',
        'row',
        'level',
        'position',
        'capacity',
    ];

    protected $casts = [
        'type' => PlotTypes::class,
        'status' => PlotStatus::class,
        'level' => 'integer',
        'capacity' => 'integer',
    ];

    public function block(): BelongsTo
    {
        return $this->belongsTo(Block::class, 'block_id');
    }

    /**
     * Container / slot discriminator. NULL parent means this row is itself a
     * container (or a single-capacity plot with no children).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Plot::class, 'parent_plot_id');
    }

    /**
     * Child slots of a multi-capacity parent. Ordered by level for the
     * detail page rendering.
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
     *   {name}                          when no level (single-capacity / parent)
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

                if ($this->level !== null) {
                    $label .= '-L' . $this->level;
                }

                if (filled($this->position)) {
                    $label .= '-' . $this->position;
                }

                return $label;
            }
        );
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'block_id',
                'parent_plot_id',
                'name',
                'type',
                'status',
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
