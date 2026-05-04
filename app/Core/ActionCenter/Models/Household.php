<?php

namespace App\Core\ActionCenter\Household\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Household extends Model
{
    use SoftDeletes;
    protected $table = 'ac_households';
    protected $fillable = [


    ];

}