export interface ReportOption {
    value: string;
    label: string;
}

export interface ReportPaginator<T> {
    data: T[];
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
        to: number | null;
        total: number;
    };
}

export interface AssistanceRequestReportFilters {
    search: string | null;
    status: string | null;
    assistance_type_id: string | null;
    barangay: string | null;
    source: string | null;
    date_basis: 'submitted' | 'released';
    date_from: string | null;
    date_to: string | null;
    per_page: number;
}

export interface AssistanceRequestReportRow {
    id: string;
    transaction_number: string;
    submitted_date: string | null;
    beneficiary_number: string | null;
    filer_name: string;
    assisted_person: string;
    filed_for_self: boolean;
    source: 'portal' | 'walk_in';
    source_label: string;
    barangay: string | null;
    assistance_type: string | null;
    status: string | null;
    status_label: string;
    amount_approved: number | null;
    reviewer_name: string | null;
    reviewed_date: string | null;
    approver_name: string | null;
    approved_date: string | null;
    released_date: string | null;
    release_reference_number: string | null;
    description: string | null;
}

export interface BeneficiaryRegistryReportFilters {
    search: string | null;
    barangay: string | null;
    sex: string | null;
    verification: string | null;
    source: string | null;
    lifecycle: 'current' | 'inactive' | 'merged' | 'all';
    per_page: number;
}

export interface BeneficiaryRegistryReportRow {
    id: string;
    beneficiary_number: string | null;
    full_name: string;
    birth_date: string | null;
    age: number | null;
    sex: string | null;
    sex_label: string | null;
    civil_status_label: string | null;
    contact_phone: string | null;
    barangay: string | null;
    street: string | null;
    household_code: string | null;
    official_household_size: number;
    source: 'portal' | 'walk_in';
    source_label: string;
    intake_status: 'pending' | 'verified' | 'rejected';
    intake_status_label: string;
    lifecycle: 'active' | 'inactive' | 'merged';
    lifecycle_label: string;
    total_requests: number;
    released_requests: number;
    total_released_amount: number;
    last_request_date: string | null;
    registered_date: string | null;
}
