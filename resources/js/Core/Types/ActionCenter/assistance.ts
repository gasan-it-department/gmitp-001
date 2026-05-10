export type AssistanceTypeFormData = {
    name: string;
    description?: string;
    is_active: boolean;
    max_amount: number;
    cooldown_months: number;
    documents: { id: string; is_required: boolean; name: string; }[];

    // [key: string]: any;
}

export interface AssistanceTypeListItem {
    id: string;
    name: string;
    description: string;
    is_active: boolean;
    max_amount: number;
    cooldown_months: number;
    requirements_count: number;
}

export interface AssistanceType {
    id: string;
    name: string;
    max_amount: number;
    cooldown_months: number;
    description: string | null;
    is_active: boolean;
    documents?: any;
    created_at: string;
}
