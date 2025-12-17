export interface User {
    id: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    phone: string;
    email: string;
    user_name: string;
    roles: string[];
    direct_permission: string[];
    all_permission: string[];
}