import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const { auth } = usePage<SharedData>().props;
    const permissions = auth.permissions ?? auth.user?.all_permission ?? [];
    const isSuperAdmin = auth.roles?.isSuperAdmin === true;

    const can = (permission: string): boolean => isSuperAdmin || permissions.includes(permission);
    const canAny = (requiredPermissions: string[]): boolean =>
        isSuperAdmin || requiredPermissions.some((permission) => permissions.includes(permission));

    return { can, canAny, isSuperAdmin, permissions };
}
