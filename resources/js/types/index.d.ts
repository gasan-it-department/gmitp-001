import { LucideIcon } from 'lucide-react';
import { User } from '@/Core/Types/User/UserTypes';


export interface Auth {
    user: User;
    roles: {
        isClient: boolean;
        isAdmin: boolean;
        isSuperAdmin: boolean;
    }
    access: ["action-center" | ""]
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    app_name: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

// export interface User {
//     id: string;
//     first_name: string;
//     last_name: string;
//     middle_name?: string;
//     email: string;
//     user_name: string;
//     phone: string;
//     roles: number;
//     role_name: 'client' | 'admin' | 'supera_dmin';
//     avatar?: string;
//     created_at: string;
//     updated_at: string;
//     [key: string]: unknown;
// }
