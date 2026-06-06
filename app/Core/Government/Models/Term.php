<?php

namespace App\Core\Government\Models;

use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Term extends Model
{
    use LogsActivity;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'gov_terms';

    protected $fillable = [

        'id',

        'name',

        'statutory_start',

        'statutory_end',

        'is_current',

        'municipal_id',

        'slug',

        'is_published'

    ];

    protected $casts = [
        'statutory_start' => 'date',
        'statutory_end' => 'date',
    ];

    public function municipality()
    {
        return $this->belongsTo(Municipality::class, 'municipal_id');
    }

    public function appointments()
    {

        return $this->hasMany(OfficialTerm::class, 'term_id');

    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'statutory_start', 'statutory_end', 'is_current', 'slug', 'is_published'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('government_term');
    }

}