<?php

namespace App\Core\Feedback\Models;

use Illuminate\Database\Eloquent\Model;

class FeedbackFiles extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [

        'id',

        'feedback_id',

        'original_name',

        'file_size',

        'public_id',

        'mime_type',
    ];

    public function feedback()
    {
        return $this->belongsTo(Feedback::class);
    }
}