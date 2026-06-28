// ─── Shared ──────────────────────────────────────────────────────────────

export type PlotStatusValue = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type PlotTypeValue = 'lawn_lot' | 'apartment_niche' | 'bone_ossuary' | 'mausoleum';
export type CemeterySiteStatusValue = 'active' | 'inactive' | 'closed';
export type VitalRecordTypeValue = 'death' | 'fetal_death';
export type IdentityStatusValue = 'identified' | 'unidentified';
export type RegistrationStatusValue = 'draft' | 'pending_review' | 'verified' | 'archived';
export type DecedentIntermentStatusFilterValue = 'interred' | 'unassigned';
export type DecedentDocumentTypeValue =
    | 'death_certificate'
    | 'fetal_death_certificate'
    | 'burial_permit'
    | 'police_report'
    | 'medico_legal_report'
    | 'health_office_clearance'
    | 'identity_evidence'
    | 'case_photo'
    | 'other';

/**
 * Surfaced to the UI as the per-decedent assignment state. With the event-typed
 * interment schema there is no DB `status` column — `interred` means an active
 * (non-soft-deleted) interment row exists; `unassigned` means none. The
 * `exhumed`/`transferred` legacy values are kept as types so older UI cells
 * keep compiling, but the API no longer emits them.
 */
export type IntermentStatusValue = 'interred' | 'unassigned' | 'exhumed' | 'transferred' | 'pending';

export type IntermentTypeValue = 'initial' | 'transfer';

export interface SelectOption<T extends string = string> {
    value: T;
    label: string;
}

export interface PlotStatusOption extends SelectOption<PlotStatusValue> {
    tone: string;
}

export interface CemeterySiteListItem {
    id: string;
    name: string;
    psgc_barangay_code: string | null;
    barangay_name: string | null;
    street_name: string | null;
    status: CemeterySiteStatusValue;
    status_label: string;
    notes: string | null;
    sections_count: number;
}

export type CreateCemeterySiteForm = {
    name: string;
    psgc_barangay_code: string;
    street_name: string;
    notes: string;
};

export interface CemeteryBlockListItem {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'maintenance';
    counts: PlotInventoryCounts;
}

export interface CemeterySectionListItem {
    id: string;
    name: string;
    description: string | null;
    status: 'active' | 'inactive' | 'maintenance';
    blocks: CemeteryBlockListItem[];
}

export type CreateCemeterySectionForm = {
    name: string;
    description: string;
};

export type CreateCemeteryBlockForm = {
    name: string;
};

export type BulkGeneratePlotsForm = {
    label_prefix: string;
    start_number: number | '';
    quantity: number | '';
    padding: number | '';
    type: PlotTypeValue | '';
    capacity: number | '';
    row: string;
    position: string;
};

export type GenerateApartmentNichesForm = {
    apartment_name: string;
    floors: number | '';
    rows_per_floor: number | '';
    niches_per_row: number | '';
    row_prefix: string;
    niche_prefix: string;
    niche_padding: number | '';
};

// ─── Spatial hierarchy lookups (passed as Inertia page props) ────────────

export interface SectionLookup {
    id: string;
    name: string;
}

export interface BlockLookup {
    id: string;
    name: string;
    section: SectionLookup | null;
}

// ─── Decedents ───────────────────────────────────────────────────────────

export interface DecedentListItem {
    id: string;
    full_name: string;
    vital_record_type: VitalRecordTypeValue;
    vital_record_label: string;
    identity_status: IdentityStatusValue;
    registration_status: RegistrationStatusValue;
    registration_status_label: string;
    registration_status_tone: string;
    life_stage: 'fetal' | 'infant' | 'child' | 'adult' | null;
    registry_number: string;
    date_of_death: string;
    date_of_registration: string | null;
    interment_status: IntermentStatusValue;
    plot_label: string | null;
}

export interface DecedentListFilters {
    search: string | null;
    registration_status: RegistrationStatusValue | null;
    identity_status: IdentityStatusValue | null;
    vital_record_type: VitalRecordTypeValue | null;
    interment_status: DecedentIntermentStatusFilterValue | null;
    death_year: number | null;
    per_page: number;
}

export interface DecedentProfile {
    id: string;
    version: number;
    first_name: string | null;
    last_name: string | null;
    middle_name: string | null;
    suffix: string | null;
    memorial_name: string | null;
    gender: string | null;
    age_at_death: number | null;
    date_of_birth: string | null;
    date_of_death: string | null;
    date_of_registration: string | null;
    has_legal_name: boolean;
    life_stage: 'fetal' | 'infant' | 'child' | 'adult' | null;
    vital_record_type: VitalRecordTypeValue;
    vital_record_label: string;
    identity_status: IdentityStatusValue;
    registration_status: RegistrationStatusValue;
    registration_status_label: string;
    registration_status_tone: string;
    registry_number: string | null;
    place_of_death: string | null;
    cause_of_death: string | null;
    notes: string | null;
    psgc_municipality_id: string | null;
    psgc_barangay_code: string | null;
    street_name: string | null;
    verified_at: string | null;
    verified_by: string | null;
    avatar_url: string | null;
    documents: {
        id: string;
        type: DecedentDocumentTypeValue;
        type_label: string;
        restricted: boolean;
        document_number: string | null;
        issued_at: string | null;
        notes: string | null;
        file_name: string | null;
        mime_type: string | null;
        download_url: string;
    }[];
    unidentified_details: {
        case_reference: string;
        found_location: string | null;
        date_found: string | null;
        reported_by: string | null;
        reporting_agency: string | null;
        estimated_age: string | null;
        estimated_sex: string | null;
        distinguishing_features: string | null;
        physical_description: string | null;
        requires_medico_legal: boolean;
    } | null;
    audit_timeline: {
        id: number;
        event: string | null;
        description: string;
        causer: string | null;
        changes: Record<string, unknown>;
        properties: Record<string, unknown>;
        evidence_url: string | null;
        created_at: string;
    }[];
    interment_readiness: {
        ready: boolean;
        registration_verified: boolean;
        requirements: { type: DecedentDocumentTypeValue; label: string; satisfied: boolean }[];
        missing: DecedentDocumentTypeValue[];
        via_override: boolean;
        override: { id: string; evidence_reference: string; expires_at: string } | null;
    };
    // Schema pivot: interment is now an event row (type = initial | transfer).
    // No row-level status; existence of the row is the "interred" signal.
    interment: {
        id: string;
        type: IntermentTypeValue;
        notes: string | null;
        interment_date: string | null;
        plot: {
            id: string;
            name: string | null;
            slot_label: string;
            type: PlotTypeValue | null;
            status: PlotStatusValue | null;
            level: number | null;
            position: string | null;
            parent: { id: string; name: string } | null;
            block: { id: string; name: string } | null;
            section: { id: string; name: string } | null;
        } | null;
    } | null;
}

export type RegisterDecedentForm = {
    vital_record_type: VitalRecordTypeValue;
    identity_status: IdentityStatusValue;
    has_legal_name: boolean;
    submission_intent: 'draft' | 'submit';
    version?: number;
    gender: 'MALE' | 'FEMALE' | 'INDETERMINATE' | '';

    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    memorial_name: string;

    place_of_death: string;
    psgc_municipality_id: string;
    psgc_barangay_code: string;
    street_name: string;

    cause_of_death: string;
    registry_number: string;
    date_of_birth: string;
    date_of_death: string;
    date_of_registration: string;

    notes: string;
    avatar: File | null;
    unidentified_details: {
        case_reference: string;
        found_location: string;
        date_found: string;
        reported_by: string;
        reporting_agency: string;
        estimated_age: string;
        estimated_sex: 'MALE' | 'FEMALE' | 'INDETERMINATE' | '';
        distinguishing_features: string;
        physical_description: string;
        requires_medico_legal: boolean;
    };
};

// ─── Plots ───────────────────────────────────────────────────────────────

export interface PlotListItem {
    id: string;
    cemetery_site_id: string;
    name: string | null;
    slot_label: string; // canonical UI identifier (e.g. "A-12", "A-12-L3", "A-12-L3-LEFT")
    parent_plot_id: string | null; // NULL = container or single-capacity
    row: string | null;
    level: number | null;
    position: string | null;
    capacity: number;
    type: PlotTypeValue | null;
    type_label: string | null;
    status: PlotStatusValue | null; // NULL for parent containers — they are not bookable
    status_label: string | null;
    status_tone: string | null;
    block: {
        id: string;
        name: string;
        section: SectionLookup | null;
    } | null;
}

export type PlotInventoryScopeValue = 'top_level' | 'assignable' | 'all';

export interface PlotListFilters {
    search: string | null;
    status: PlotStatusValue | null;
    type: PlotTypeValue | null;
    section_id: string | null;
    block_id: string | null;
    row: string | null;
    scope: PlotInventoryScopeValue;
    per_page: number;
}

/** Leaf-level inventory counts (REQ-2.2) — server-computed, container-excluded. */
export interface PlotInventoryCounts {
    total: number;
    available: number;
    occupied: number;
    reserved: number;
    maintenance: number;
}

export type CreatePlotForm = {
    block_id: string;
    name: string;
    type: PlotTypeValue | '';
    capacity: number | '';
    row: string;
    position: string;
};

// ─── Interments ──────────────────────────────────────────────────────────

export type CreateIntermentForm = {
    decedent_id: string;
    plot_id: string;
    interment_date: string;
    type: IntermentTypeValue;
    notes: string;
    leaseholder_name: string;
    leaseholder_contact: string;
    leaseholder_address: string;
    leaseholder_relationship: string;
    lease_start: string;
    lease_end: string;
    amount_paid: number | '';
    or_number: string;
    lease_notes: string;
};

export type CreateSiteIntermentForm = CreateIntermentForm & {
    cemetery_site_id: string;
};

export interface ReadyDecedentOption {
    id: string;
    display_name: string;
    vital_record_type: VitalRecordTypeValue;
    vital_record_label: string;
    identity_status: IdentityStatusValue;
    registry_number: string | null;
    date_of_death: string | null;
    date_of_death_label: string | null;
}

export interface IntermentListItem {
    id: string;
    decedent_id: string;
    decedent_name: string;
    plot_id: string;
    plot_label: string | null;
    plot_type_label: string | null;
    section_name: string | null;
    block_name: string | null;
    interment_date: string | null;
    interment_date_label: string | null;
    type: IntermentTypeValue;
    type_label: string;
    notes: string | null;
}
