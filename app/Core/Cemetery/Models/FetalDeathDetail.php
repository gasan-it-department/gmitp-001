<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Traits\BelongsToMunicipality;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class FetalDeathDetail extends Model
{
    use BelongsToMunicipality, LogsActivity, SoftDeletes;

    protected $table = 'cemetery_fetal_death_details';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id', 'municipal_id', 'decedent_id', 'gestational_age_weeks',
        'fetal_weight_grams', 'mother_name',
    ];

    protected $casts = [
        'gestational_age_weeks' => 'integer',
        'fetal_weight_grams' => 'integer',
    ];

    public function decedent(): BelongsTo
    {
        return $this->belongsTo(Decedent::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontLogEmptyChanges()
            ->useLogName('cemetery_fetal_death_detail');
    }
}
