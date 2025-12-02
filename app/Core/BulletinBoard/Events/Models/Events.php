<?php

namespace App\Core\BulletinBoard\Events\Models;

use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Events extends Model
{
    // protected $table = 'events';
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'title',
        'description',
        'municipal_id',
        'event_date',
        'is_published'
    ];

    public function user()
    {

        return $this->belongsTo(User::class, 'user_id');

    }

}