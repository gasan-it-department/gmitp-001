<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Traits\BelongsToMunicipality;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class UnidentifiedDetail extends Model
{
    use BelongsToMunicipality, LogsActivity, SoftDeletes;

    protected $table = 'cemetery_unidentified_details';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id', 'municipal_id', 'decedent_id', 'reference_code', 'case_reference',
        'found_location', 'date_found', 'reported_by', 'reporting_agency',
        'estimated_age', 'estimated_sex', 'distinguishing_features',
        'physical_description', 'requires_medico_legal',
    ];

    protected $casts = [
        'date_found' => 'date',
        'requires_medico_legal' => 'boolean',
    ];

    public function decedent(): BelongsTo
    {
        return $this->belongsTo(Decedent::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontLogEmptyChanges()
            ->useLogName('cemetery_unidentified_detail');
    }
}
