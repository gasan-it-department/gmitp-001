<?php

namespace App\Core\Municipality\Models;

use Illuminate\Database\Eloquent\Model;

class MunicipalitySettings extends Model
{

    // protected $table = 'municipality_settings';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [

        'id',

        'municipal_id',

        'home_banner_public_id',

    ];

}