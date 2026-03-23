<?php

namespace App\Core\Cemetery\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Interment extends Model
{
    use SoftDeletes;
    protected $table = 'cemetery_interments';

    protected $fillable = [

        'id',

        'decedent_id',

        'plot_id',

        'status',

        'interment_date',

    ];
}
