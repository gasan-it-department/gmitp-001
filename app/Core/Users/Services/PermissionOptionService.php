<?php

namespace App\Core\Users\Services;

use App\Core\Users\Enums\EnumPermissions;

class PermissionOptionService
{

    public function getPermissionOptions()
    {

        return array_map(fn(EnumPermissions $permission) => [

            'value' => $permission->value,

            'label' => $permission->label(),

        ], EnumPermissions::cases());

    }

}