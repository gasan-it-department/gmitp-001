
export interface AssistanceRequest {
    id: string;
    created_at: string;
    amount: string | null;
    transaction_number: string;
    assistance_type: string;
    description: string;
    status: string;
    user_id: string;
    beneficiary?: Beneficiary;
    remarks?: string;
}

export interface Beneficiary {
    id: string;
    name: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    suffix: string;
    email?: string;
    // address?: string;
    barangay: string;
    municipality: string;
    province: string;
    birth_date: string;
    source: string;
    contact_number?: string;
}

export interface ActionCenterFormData {
    first_name: string;
    last_name: string;
    middle_name: string;
    suffix: string;
    birth_date: string;
    // address: string;
    province: string;
    municipality: string;
    barangay: string;
    assistance_type: string;
    description?: string;
    documents: File[];
}

export interface AssistanceRequestResponse {
    request: AssistanceRequest[];
    message: string;
}

export interface AssistanceStatus {
    value: string;
    label: string;
}

export interface AssistanceOption {
    value: string;
    label: string;
}

export interface AssistanceOptionsResponse {
    success: boolean;
    data: AssistanceOption[];
}