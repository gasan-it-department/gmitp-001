import { MunicipalityType } from '../Municipality/MunicipalityTypes';
import { UserSocialAccount } from './user';

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    phone: string;
    email: string;
    roles: string[];
    direct_permission: string[];
    all_permission: string[];
    municipality?: MunicipalityType;
    social_accounts: UserSocialAccount[];
    is_active: boolean;
    deactivated_at?: string | null;
}

export interface Permission {
    value: string;
    label: string;
    is_access: boolean;
}

export interface PermissionModule {
    value: string;
    label: string;
    permissions: Permission[];
}

export interface PermissionCatalog {
    modules: PermissionModule[];
}
