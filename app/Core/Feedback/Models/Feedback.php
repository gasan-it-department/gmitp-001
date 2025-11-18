<?php

namespace App\Core\Feedback\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{

    protected $table = 'citizen_feedback';
    protected $fillable = [
        'id',
        'user_id',
        'sender_name',
        'employee_name',
        'feedback_target',
        'department_id',
        'rating',
        'message',
        'is_anonymous',
        'ip_address',
        'user_agent',
        'municipal_id',
    ];
    public $incrementing = false; // because you use ULIDs
    protected $keyType = 'string';

    public function attachments()
    {
        return $this->hasMany(FeedbackFiles::class);
    }
}

