
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
    contact_number: string;
    email?: string;
    barangay: string;
    municipality: string;
    province: string;

    // ISOLATED ADDITION
    middle_name: string;
    suffix: string;
    birth_date: string;
    description: string;
    assistance_type: string;
    source: string;
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