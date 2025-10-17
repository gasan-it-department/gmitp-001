<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $fillable = [
        'id',
        'user_id',
        'contact_number',
        'email',
        'name',
        'subject',
        'subject_type',
        'department_id',
        'rating',
        'message',
        'is_anonymous',
        'ip_address',
        'user_agent',
    ];
}

