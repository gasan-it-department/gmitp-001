<?php

namespace App\Shared\Models;

use Illuminate\Database\Eloquent\Model;
use App\Core\Users\Infrastructure\Models\User;

class MunicipalityDepartment extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];
}
