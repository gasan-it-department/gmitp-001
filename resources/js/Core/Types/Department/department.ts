export interface Department {
    id: string;
    label: string;
    code: string;
    name: string;
}

export interface DepartmentListItem {
    id: string;
    name: string;
    code: string;
    is_active: boolean;
}

export interface DepartmentDetail {
    id: string;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    logo_url: string | null;
    created_at: string | null;
}
