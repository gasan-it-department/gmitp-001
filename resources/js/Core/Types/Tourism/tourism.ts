export interface CategoryFormData {
    name: string;
    type: string;
    description?: string;
}

export interface Category {
    id: string;
    name: string;
    type: string;
    description: string;
}