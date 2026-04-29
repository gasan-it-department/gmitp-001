<?php

namespace App\Core\ActionCenter\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AssistanceType extends Model
{
    use HasUlids, SoftDeletes;
    protected $table = 'ac_assistance_types';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'description',
        'is_active',
        'required_documents',
    ];

    protected $casts = [
        'required_documents' => 'array',
    ];

    public function requests()
    {
        return $this->hasMany(AssistanceRequest::class, 'assistance_type_id');
    }
}

