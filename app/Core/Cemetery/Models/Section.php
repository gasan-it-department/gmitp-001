<?php

namespace App\Core\Cemetery\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Section extends Model
{
    use LogsActivity;

    protected $table = 'cemetery_sections';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'municipal_id',
        'name',
        'boundary_polygon',
    ];

    public function plots(): HasMany
    {
        return $this->hasMany(Plot::class, 'section_id');
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name',
                'boundary_polygon',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('cemetery_section');
    }
}
