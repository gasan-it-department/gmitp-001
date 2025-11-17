<?php

namespace App\Core\BulletinBoard\Announcement\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    // protected $table = 'announcements';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'title',
        'municipal_id',
        'message',
        'is_published',
    ];
}