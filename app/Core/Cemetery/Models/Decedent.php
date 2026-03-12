<?php

namespace App\Core\Cemetery\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Decedent extends Model
{

    use SoftDeletes;
    protected $table = "cemetery_decedents";

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [

        'id',

        'first_name',

        'last_name',

        'middle_name',

        'suffix',

        'date_of_birth',

        'date_of_death',

        'gender',

        'cause_of_death',

        'death_certificate_no',

        'notes',

        'municipal_id'

    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'date_of_death' => 'date',

    ];
}