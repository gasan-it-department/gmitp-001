<?php

namespace App\Core\ActionCenter\Requests\Models;

use Illuminate\Database\Eloquent\Model;

class AssistanceRequestFile extends Model
{

    // protected $table = 'assistance_request_files';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [

        'id',

        'assistance_request_id',

        'public_id',

        'resource_type',

        'mime_type',

        'file_size',

    ];

    public function request()
    {

        return $this->belongsTo(AssistanceRequest::class, 'assistance_request_id');

    }

}