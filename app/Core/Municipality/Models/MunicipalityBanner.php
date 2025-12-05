<?php

namespace App\Core\Municipality\Models;

use Illuminate\Database\Eloquent\Model;

class MunicipalityBanner extends Model
{

    // protected $table = 'municipality_banners';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [

        'id',

        'public_id',

        'municipal_id',

        'position',

    ];
}