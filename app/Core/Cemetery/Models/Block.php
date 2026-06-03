<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Traits\BelongsToMunicipality;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Block extends Model
{
    use BelongsToMunicipality, LogsActivity, SoftDeletes;

    protected $table = 'cemetery_blocks';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'municipal_id',
        'section_id',
        'name',
        'status',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class, 'section_id');
    }

    public function plots(): HasMany
    {
        return $this->hasMany(Plot::class, 'block_id');
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['section_id', 'name', 'status'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('cemetery_block');
    }
}
