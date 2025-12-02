<?php

namespace App\Core\BulletinBoard\Announcement\Models;

use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Announcement extends Model
{
    // protected $table = 'announcements';
    use SoftDeletes;

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

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}