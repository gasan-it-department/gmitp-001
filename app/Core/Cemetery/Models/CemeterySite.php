<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Enums\CemeterySiteStatus;
use App\Core\Cemetery\Traits\BelongsToMunicipality;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class CemeterySite extends Model
{
    use BelongsToMunicipality, LogsActivity, SoftDeletes;

    protected $table = 'cemetery_sites';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'municipal_id',
        'name',
        'psgc_barangay_code',
        'street_name',
        'status',
        'notes',
    ];

    protected $casts = [
        'status' => CemeterySiteStatus::class,
    ];

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class, 'cemetery_site_id');
    }

    public function plots(): HasMany
    {
        return $this->hasMany(Plot::class, 'cemetery_site_id');
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
                'psgc_barangay_code',
                'street_name',
                'status',
                'notes',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('cemetery_site');
    }
}
