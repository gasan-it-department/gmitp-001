<?php

namespace App\Core\Cemetery\Interments\Models;

use Illuminate\Database\Eloquent\Model;

class Interment extends Model
{

    // protected $table = 'interments';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [

        'id',

        'plot_id',

        'first_name',

        'last_name',

        'middle_name',

        'extension_name',

        'date_of_birth',

        'date_of_death',

        'gender',

        'cause_of_death',

        'death_certificate_no',

        'notes',

    ];

}