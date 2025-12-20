import { MunicipalityType } from "../Municipality/MunicipalityTypes";

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    phone: string;
    email: string;
    user_name: string;
    avatarUrl: string
    roles: string[];
    direct_permission: string[];
    all_permission: string[];
    municipality?: MunicipalityType;
}

export interface Permission {
    id: string;
    value: string;
    label: string;
}
