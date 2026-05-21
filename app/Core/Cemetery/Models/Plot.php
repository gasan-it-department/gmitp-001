<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Enums\PlotTypes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plot extends Model
{
    use SoftDeletes;

    protected $table = 'cemetery_plots';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'municipal_id',
        'section_id',
        'plot_number',
        'name',
        'type',
        'status',
        'total_capacity',
        'coordinates',
    ];

    protected $casts = [
        'type' => PlotTypes::class,
        'status' => PlotStatus::class,
        'total_capacity' => 'integer',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class, 'section_id');
    }

    public function interments(): HasMany
    {
        return $this->hasMany(Interment::class, 'plot_id');
    }

    /**
     * Active interment (not exhumed/transferred). Drives the "who is buried here"
     * lookup on the plot detail screen.
     */
    public function activeInterment(): HasOne
    {
        return $this->hasOne(Interment::class, 'plot_id')
            ->whereIn('status', ['pending', 'interred'])
            ->latestOfMany();
    }
}
