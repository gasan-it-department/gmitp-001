
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
}

export interface Beneficiary {
    id: string;
    name: string;
    first_name: string;
    last_name: string;
    contact_number: string;
    email?: string;
    barangay: string;
    municipality: string;
    province: string;
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