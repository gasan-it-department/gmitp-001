<?php

namespace App\Core\Municipality\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class MunicipalitySettings extends Model
{
    use HasFactory, HasUlids, LogsActivity;

    protected $table = 'municipality_settings';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'municipal_id',
        'primary_color_hex',
        'contact_email',
        'trunkline_phone',
        'office_hours',
        'facebook_url',
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
                'primary_color_hex',
                'contact_email',
                'trunkline_phone',
                'office_hours',
                'facebook_url',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('municipality_settings');
    }
}
