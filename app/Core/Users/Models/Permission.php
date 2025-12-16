<?php

namespace App\Core\Users\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Permission as SpatiePermission;


class Permission extends SpatiePermission
{

    use HasUlids;

    public $incrementing = false;

    protected $keyType = 'string';

}
