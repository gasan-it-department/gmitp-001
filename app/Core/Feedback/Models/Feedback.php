<?php

namespace App\Core\Feedback\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $fillable = [
        'id',
        'user_id',
        'sender_name',
        'employee_name',
        'subject_type',
        'department_id',
        'rating',
        'message',
        'is_anonymous',
        'ip_address',
        'user_agent',
    ];
}

