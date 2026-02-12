<?php

namespace App\Core\Government\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfficialTerm extends Model
{

    public $incrementing = false;

    protected $keyType = 'string';

    // protected $table = 'official_terms';

    protected $fillable = [

        'id',

        'term_id',

        'official_id',

        'position_id',

        'actual_start_date',

        'actual_end_date',

        'status',

        'political_party',

        'profile_url',

        'profile_public_id',

    ];

    public function term()
    {
        return $this->belongsTo(Term::class);
    }

    public function official()
    {
        return $this->belongsTo(Official::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

}