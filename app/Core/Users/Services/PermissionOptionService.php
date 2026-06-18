<?php

namespace App\Core\Users\Services;

use App\Core\Users\Enums\EnumPermissions;

class PermissionOptionService
{
    public function getPermissionOptions(): array
    {
        $modules = [];

        foreach (EnumPermissions::cases() as $permission) {
            $module = $permission->module();

            if (! isset($modules[$module->value])) {
                $modules[$module->value] = [
                    'value' => $module->value,
                    'label' => $module->label(),
                    'order' => $module->order(),
                    'permissions' => [],
                ];
            }

            $modules[$module->value]['permissions'][] = [
                'value' => $permission->value,
                'label' => $permission->label(),
                'is_access' => $permission->isAccess(),
            ];
        }

        usort(
            $modules,
            fn (array $a, array $b): int => $a['order'] <=> $b['order'],
        );

        return [
            'modules' => array_map(
                fn (array $module): array => [
                    'value' => $module['value'],
                    'label' => $module['label'],
                    'permissions' => $module['permissions'],
                ],
                $modules,
            ),
        ];
    }
}
