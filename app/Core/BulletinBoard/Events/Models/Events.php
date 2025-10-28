<?php

namespace App\Core\BulletinBoard\Events\Models;

use Illuminate\Database\Eloquent\Model;

class Events extends Model
{
    // protected $table = 'events';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'title',
        'message',
        'event_date_time'
    ];
}