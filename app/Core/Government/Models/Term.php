<?php

namespace App\Core\Government\Models;

use Illuminate\Database\Eloquent\Model;

class Term extends Model
{

    public $incrementing = false;

    protected $keyType = 'string';

    // protected $table = 'terms';

    protected $fillable = [

        'id',

        'name',

        'statutory_start',

        'statutory_end',

        'is_current',

        'municipal_id'

    ];

    protected $casts = [
        'statutory_start' => 'date',
        'statutory_end' => 'date',
    ];

}