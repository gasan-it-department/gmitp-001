interface DecedentListItem {
    id: string;
    full_name: string;
    death_certificate_no?: string;
    date_of_death: string;
}

export type RegisterDecedentForm = {
    decedent_type: 'standard' | 'child' | 'fetal' | 'unknown';
    gender: 'male' | 'female' | '';

    has_official_name: boolean;

    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    memorial_name: string;

    // Identifiers & Locations
    reference_document_number: string;
    reference_document_type: string;
    place_of_death: string;
    psgc_municipal_id: string;
    psgc_barangay_id: string;
    street_name: string;

    // Medical & Dates
    cause_of_death: string;
    death_certificate_no: string;
    date_of_birth: string;
    date_of_death: string;
    date_of_registration: string;

    // Administrative
    notes: string;
}