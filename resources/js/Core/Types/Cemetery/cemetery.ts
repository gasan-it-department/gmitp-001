// ─── Shared ──────────────────────────────────────────────────────────────

export type PlotStatusValue = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type PlotTypeValue = 'lawn_lot' | 'apartment_niche' | 'bone_ossuary' | 'mausoleum';
export type VitalRecordTypeValue = 'death' | 'fetal_death';
export type IdentityStatusValue = 'identified' | 'unidentified';
export type RegistrationStatusValue = 'draft' | 'pending_review' | 'verified' | 'archived';
export type DocumentVerificationStatusValue = 'pending' | 'verified' | 'rejected' | 'superseded';
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
    verified_at: string | null;
    verified_by: string | null;
    avatar_url: string | null;
    documents: {
        id: string;
        supersedes_id: string | null;
        type: DecedentDocumentTypeValue;
        type_label: string;
        restricted: boolean;
        document_number: string | null;
        issued_at: string | null;
        notes: string | null;
        verification_status: DocumentVerificationStatusValue;
        verified_at: string | null;
        verified_by: string | null;
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
    fetal_details: {
        gestational_age_weeks: number | null;
        fetal_weight_grams: number | null;
        mother_name: string | null;
    } | null;
    corrections: {
        id: string;
        base_version: number;
        status: 'pending' | 'approved' | 'rejected';
        reason: string;
        original_values: Record<string, unknown>;
        proposed_changes: Record<string, unknown>;
        requested_by: string | null;
        reviewed_by: string | null;
        review_notes: string | null;
        evidence_url: string | null;
        created_at: string;
    }[];
    audit_timeline: {
        id: number;
        event: string | null;
        description: string;
        causer: string | null;
        changes: Record<string, unknown>;
        properties: Record<string, unknown>;
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
    psgc_municipal_id: string;
    psgc_barangay_id: string;
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
    fetal_details: {
        gestational_age_weeks: number | '';
        fetal_weight_grams: number | '';
        mother_name: string;
    };
    documents: {
        type: DecedentDocumentTypeValue | '';
        document_number: string;
        issued_at: string;
        notes: string;
        file: File | null;
    }[];
};

// ─── Plots ───────────────────────────────────────────────────────────────

export interface PlotListItem {
    id: string;
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
};
