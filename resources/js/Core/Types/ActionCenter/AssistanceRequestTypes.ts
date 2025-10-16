
export interface AssistanceRequest {
    id: string;
    created_at: string;
    transaction_number: string;
    assistance_type: string;
    description: string;
    status: string;
    user_id: string;
    beneficiary: Beneficiary;
}

export interface Beneficiary {
    id: string;
    first_name: string;
    last_name: string;
    middle_name?: string | null;
    suffix?: string | null;
    birth_date: string;
    contact_number: string;
    province: string;
    municipality: string;
    barangay: string;
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