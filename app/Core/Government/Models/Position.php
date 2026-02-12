<?php

namespace App\Core\Government\Models;

use Illuminate\Database\Eloquent\Model;

class Position extends Model
{

    public $incrementing = false;

    protected $keyType = 'string';

    // protected $table = 'positions';

    protected $fillable = [

        'id',

        'title',

        'rank',

        'category',

    ];

}