<?php

namespace App\Core\BulletinBoard\Announcement\Models;

use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Database\Factories\AnnouncementFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Announcement extends Model
{
    // protected $table = 'announcements';
    use SoftDeletes, HasFactory;
    // 3. Use Trait
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

    protected static function newFactory()
    {
        return AnnouncementFactory::new();
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}