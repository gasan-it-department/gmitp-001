<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Traits\BelongsToMunicipality;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Section extends Model
{
    use BelongsToMunicipality, LogsActivity, SoftDeletes;

    protected $table = 'cemetery_sections';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'municipal_id',
        'name',
        'description',
        'status',
    ];

    public function blocks(): HasMany
    {
        return $this->hasMany(Block::class, 'section_id');
    }

    /**
     * Reach plots without joining through block in queries.
     */
    public function plots(): HasManyThrough
    {
        return $this->hasManyThrough(
            Plot::class,
            Block::class,
            'section_id',  // FK on cemetery_blocks
            'block_id',    // FK on cemetery_plots
            'id',          // PK on cemetery_sections
            'id',          // PK on cemetery_blocks
        );
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'description', 'status'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('cemetery_section');
    }
}
