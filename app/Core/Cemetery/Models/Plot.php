<?php

namespace App\Core\Cemetery\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plot extends Model
{
    use SoftDeletes;

    protected $table = 'cemetery_plots';

    protected $fillable = [

    ];

}
