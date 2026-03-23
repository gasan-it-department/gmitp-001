<?php

namespace App\Core\Department\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use HasUlids, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'is_active',
    ];

}