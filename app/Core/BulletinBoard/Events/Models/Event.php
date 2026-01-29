<?php

namespace App\Core\BulletinBoard\Events\Models;

use App\Core\Users\Models\User;
use Database\Factories\EventFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Event extends Model
{
    // protected $table = 'events';
    use HasFactory, SoftDeletes;

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

    protected static function newFactory()
    {
        return EventFactory::new();
    }

    public function user()
    {

        return $this->belongsTo(User::class, 'user_id');

    }

}