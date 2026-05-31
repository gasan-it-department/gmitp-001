<?php

namespace App\Core\Municipality\Models;

use App\Core\Municipality\Enums\HotlineCategory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class MunicipalityHotline extends Model
{
    use HasFactory, HasUlids, LogsActivity;

    protected $table = 'municipality_hotlines';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'municipal_id',
        'name',
        'number',
        'category',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'category' => HotlineCategory::class,
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class, 'municipal_id');
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
                'number',
                'category',
                'is_active',
                'sort_order',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('municipality_hotline');
    }
}
