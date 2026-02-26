<?php

namespace App\Core\Government\Models;

use App\Core\Government\Models\Official;
use App\Core\Government\Models\Position;
use App\Core\Government\Models\Term;
use Illuminate\Database\Eloquent\Model;

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

        'profile_url',

        'profile_public_id',

        'municipal_id'

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