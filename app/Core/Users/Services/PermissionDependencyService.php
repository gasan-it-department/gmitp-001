<?php

declare(strict_types=1);

namespace App\Core\Users\Services;

use App\Core\Users\Enums\EnumPermissions;

final class PermissionDependencyService
{
    /**
     * @param  list<string>  $permissions
     * @return list<string>
     */
    public function normalize(array $permissions): array
    {
        $normalized = array_values(array_unique($permissions));
        $position = 0;

        while (isset($normalized[$position])) {
            $permissionValue = $normalized[$position];
            $permission = EnumPermissions::tryFrom($permissionValue);

            if ($permission !== null) {
                foreach ($permission->dependencies() as $dependency) {
                    if (! in_array($dependency, $normalized, true)) {
                        $normalized[] = $dependency;
                    }
                }
            }

            $position++;
        }

        return $normalized;
    }

    /**
     * Normalize requested permissions without allowing an actor to grant an
     * ability or prerequisite they do not already hold.
     *
     * @param  list<string>  $permissions
     * @param  list<string>  $allowedPermissions
     * @return list<string>
     */
    public function normalizeWithin(array $permissions, array $allowedPermissions): array
    {
        $normalized = array_values(array_intersect(
            $this->normalize($permissions),
            $allowedPermissions,
        ));

        do {
            $before = $normalized;

            $normalized = array_values(array_filter(
                $normalized,
                function (string $permissionValue) use ($normalized): bool {
                    $permission = EnumPermissions::tryFrom($permissionValue);

                    if ($permission === null) {
                        return false;
                    }

                    foreach ($permission->dependencies() as $dependency) {
                        if (! in_array($dependency, $normalized, true)) {
                            return false;
                        }
                    }

                    return true;
                },
            ));
        } while ($before !== $normalized);

        return $normalized;
    }
}
