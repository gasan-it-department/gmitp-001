// ─── Shared ──────────────────────────────────────────────────────────────

export type PlotStatusValue = 'available' | 'occupied' | 'maintenance';
export type PlotTypeValue = 'lawn_lot' | 'apartment_niche' | 'bone_ossuary' | 'mausoleum';
export type PlotOccupancyModeValue = 'single' | 'shared' | 'slotted';
export type CemeterySiteStatusValue = 'active' | 'inactive' | 'closed';
export type VitalRecordTypeValue = 'death' | 'fetal_death';
export type IdentityStatusValue = 'identified' | 'unidentified';
export type RegistrationStatusValue = 'draft' | 'pending_review' | 'verified' | 'archived';
export type DecedentIntermentStatusFilterValue = 'interred' | 'unassigned' | 'exhumed' | 'transferred_out';
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
 * (non-soft-deleted) interment row exists; `unassigned` means no current or
 * final cemetery placement; final ended rows surface as `exhumed` or
 * `transferred_out`.
 */
export type IntermentStatusValue = 'interred' | 'unassigned' | 'exhumed' | 'transferred_out' | 'pending';

export type IntermentTypeValue = 'initial' | 'transfer';
export type IntermentEndTypeValue = 'moved' | 'exhumed' | 'transferred_out';
export type CemeteryServiceRequestConsentMethodValue =
    | 'leaseholder_present'
    | 'verbal_authorization'
    | 'written_authorization'
    | 'family_attestation'
    | 'not_applicable';

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

export type UpdateCemeterySiteForm = CreateCemeterySiteForm;

export interface CemeteryBlockListItem {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'maintenance';
    counts: PlotInventoryCounts;
    apartments: {
        id: string;
        name: string;
        slots_count: number;
    }[];
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

export type UpdateCemeterySectionForm = CreateCemeterySectionForm;

export type CreateCemeteryBlockForm = {
    name: string;
};

export type UpdateCemeteryBlockForm = CreateCemeteryBlockForm;

export type BulkGeneratePlotsForm = {
    label_prefix: string;
    start_number: number | '';
    quantity: number | '';
    padding: number | '';
    type: PlotTypeValue | '';
    capacity: number | '';
    area_sqm: number | '';
};

export type GenerateApartmentNichesForm = {
    apartment_name: string;
    start_floor: number | '';
    floors: number | '';
    start_row: number | '';
    rows_per_floor: number | '';
    start_niche: number | '';
    niches_per_row: number | '';
    row_prefix: string;
    niche_prefix: string;
    niche_padding: number | '';
    capacity_per_niche: number | '';
};

export type AddApartmentNichesForm = {
    start_floor: number | '';
    floors: number | '';
    start_row: number | '';
    rows_per_floor: number | '';
    start_niche: number | '';
    niches_per_row: number | '';
    row_prefix: string;
    niche_prefix: string;
    niche_padding: number | '';
    capacity_per_niche: number | '';
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
        interment_eligible: boolean;
        registration_verified: boolean;
        document_complete: boolean;
        pending_documents: boolean;
        requirements: { type: DecedentDocumentTypeValue; label: string; satisfied: boolean }[];
        missing: DecedentDocumentTypeValue[];
    };
    // Schema pivot: interment is now an event row (type = initial | transfer).
    // No row-level status; existence of the row is the "interred" signal.
    interment: {
        id: string;
        type: IntermentTypeValue;
        notes: string | null;
        interment_date: string | null;
        move_url: string;
        can_reverse_move: boolean;
        reverse_move_url: string;
        close_url: string;
        void_url: string;
        plot: {
            id: string;
            name: string | null;
            slot_label: string;
            type: PlotTypeValue | null;
            status: PlotStatusValue | null;
            level: number | null;
            position: string | null;
            profile_url: string;
            parent: { id: string; name: string } | null;
            block: { id: string; name: string } | null;
            section: { id: string; name: string } | null;
            cemetery_site: { id: string; name: string } | null;
            active_lease: PlotLeaseSummary | null;
        } | null;
    } | null;
    interment_history: {
        id: string;
        type: IntermentTypeValue | string;
        type_label: string;
        lifecycle_status: 'active' | 'ended' | 'voided' | IntermentEndTypeValue;
        lifecycle_label: string;
        interment_date: string | null;
        notes: string | null;
        ended_at: string | null;
        end_type: IntermentEndTypeValue | null;
        end_reason: string | null;
        end_notes: string | null;
        transfer_destination: string | null;
        permit_reference: string | null;
        voided_at: string | null;
        void_reason: string | null;
        previous_interment_id: string | null;
        destination_plot_label: string | null;
        destination_plot_profile_url: string | null;
        plot: {
            id: string;
            name: string | null;
            slot_label: string;
            profile_url: string;
            parent: { id: string; name: string } | null;
            block: { id: string; name: string } | null;
            section: { id: string; name: string } | null;
            cemetery_site: { id: string; name: string } | null;
        } | null;
    }[];
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
    parent_plot_id: string | null;
    row: string | null;
    level: number | null;
    position: string | null;
    capacity: number;
    area_sqm: string | number | null;
    occupancy_mode: PlotOccupancyModeValue | null;
    occupancy_mode_label: string | null;
    active_interments_count: number;
    available_capacity: number;
    occupancy_label: string;
    type: PlotTypeValue | null;
    type_label: string | null;
    status: PlotStatusValue | null;
    status_label: string | null;
    status_tone: string | null;
    active_lease: PlotLeaseSummary | null;
    block: {
        id: string;
        name: string;
        section: SectionLookup | null;
    } | null;
}

export interface PlotLeaseSummary {
    id: string;
    created_from_interment_id?: string | null;
    leaseholder_name: string;
    leaseholder_contact: string | null;
    leaseholder_address?: string | null;
    leaseholder_relationship: string | null;
    lease_start: string | null;
    lease_end: string | null;
    amount_paid?: string | number | null;
    or_number: string | null;
    status?: string | null;
    notes?: string | null;
}

export interface PlotProfileInterment {
    id: string;
    decedent_id: string;
    decedent_name: string;
    decedent_profile_url: string;
    interment_date: string | null;
    type: IntermentTypeValue | string;
    type_label: string;
    notes: string | null;
    move_url: string;
    can_reverse_move: boolean;
    reverse_move_url: string;
    close_url: string;
    void_url: string;
}

export interface PlotProfileIntermentHistoryItem {
    id: string;
    decedent_id: string;
    decedent_name: string;
    decedent_profile_url: string;
    interment_date: string | null;
    type: IntermentTypeValue | string;
    type_label: string;
    status_label: string;
    ended_at: string | null;
    end_type: IntermentEndTypeValue | null;
    end_reason: string | null;
    end_notes: string | null;
    transfer_destination: string | null;
    permit_reference: string | null;
    voided_at: string | null;
    void_reason: string | null;
    destination_plot_label: string | null;
    destination_plot_profile_url: string | null;
}

export interface PlotProfileChildNiche {
    id: string;
    slot_label: string;
    status: PlotStatusValue | null;
    status_label: string | null;
    status_tone: string | null;
    capacity: number;
    area_sqm: string | number | null;
    active_interments_count: number;
    occupancy_label: string;
    profile_url: string;
}

export interface PlotActivityTimelineItem {
    id: number;
    event: string | null;
    description: string;
    causer: string | null;
    changes: Record<string, unknown>;
    properties: Record<string, unknown>;
    created_at: string | null;
}

export interface PlotProfile {
    id: string;
    cemetery_site_id: string;
    name: string | null;
    slot_label: string;
    parent_plot_id: string | null;
    type: PlotTypeValue | null;
    type_label: string | null;
    status: PlotStatusValue | null;
    status_label: string | null;
    status_tone: string | null;
    occupancy_mode: PlotOccupancyModeValue | null;
    occupancy_mode_label: string | null;
    capacity: number;
    active_interments_count: number;
    available_capacity: number;
    occupancy_label: string;
    can_accept_more: boolean;
    can_delete: boolean;
    delete_blocked_reason: string | null;
    row: string | null;
    level: number | null;
    position: string | null;
    block: {
        id: string;
        name: string;
        section: SectionLookup | null;
    } | null;
    parent: {
        id: string;
        slot_label: string;
    } | null;
    active_lease: PlotLeaseSummary | null;
    current_interments: PlotProfileInterment[];
    interment_history: PlotProfileIntermentHistoryItem[];
    child_niches: PlotProfileChildNiche[];
    audit_timeline: PlotActivityTimelineItem[];
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
    maintenance: number;
}

export type CreatePlotForm = {
    block_id: string;
    name: string;
    type: PlotTypeValue | '';
    capacity: number | '';
    area_sqm: number | '';
};

export type UpdatePlotDetailsForm = {
    name: string;
    type: PlotTypeValue | '';
    area_sqm: number | '';
};

export type ChangePlotOccupancyForm = {
    occupancy_mode: 'single' | 'shared';
    capacity: number | '';
    reason: string;
};

export type ChangePlotStatusForm = {
    status: 'available' | 'maintenance' | '';
    reason: string;
};

export type DeletePlotForm = {
    reason: string;
};

export type UpdatePlotLeaseForm = {
    leaseholder_name: string;
    leaseholder_contact: string;
    leaseholder_address: string;
    leaseholder_relationship: string;
    lease_start: string;
    lease_end: string;
    amount_paid: number | '';
    or_number: string;
    notes: string;
};

// ─── Interments ──────────────────────────────────────────────────────────

export type CreateIntermentForm = {
    decedent_id: string;
    plot_id: string;
    interment_date: string;
    type: IntermentTypeValue;
    notes: string;
    pending_document_reason: string;
    pending_document_reference: string;
    pending_document_confirmed: boolean;
    requesting_party_name: string;
    requesting_party_contact: string;
    requesting_party_address: string;
    requesting_party_relationship: string;
    requester_is_leaseholder: boolean;
    leaseholder_consent_confirmed: boolean;
    leaseholder_consent_method: CemeteryServiceRequestConsentMethodValue | '';
    leaseholder_consent_reference: string;
    service_request_notes: string;
    authorization_evidence: File | null;
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
    readiness_status: 'ready' | 'pending_documents';
    readiness_status_label: string;
    document_complete: boolean;
    pending_documents: boolean;
    missing_documents: { type: DecedentDocumentTypeValue; label: string }[];
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
    move_url: string;
    can_reverse_move: boolean;
    reverse_move_url: string;
}

export interface IntermentMoveContext {
    id: string;
    decedent_id: string;
    decedent_name: string;
    interment_date: string | null;
    type: IntermentTypeValue;
    type_label: string;
    notes: string | null;
    plot: {
        id: string;
        cemetery_site_id: string;
        slot_label: string;
        type_label: string | null;
        status_label: string | null;
        active_lease: PlotLeaseSummary | null;
        cemetery_site: { id: string; name: string } | null;
        section: SectionLookup | null;
        block: { id: string; name: string } | null;
    } | null;
}

export type MoveIntermentForm = {
    destination_cemetery_site_id: string;
    destination_plot_id: string;
    movement_date: string;
    reason: string;
    notes: string;
    requesting_party_name: string;
    requesting_party_contact: string;
    requesting_party_address: string;
    requesting_party_relationship: string;
    requester_is_leaseholder: boolean;
    leaseholder_consent_confirmed: boolean;
    leaseholder_consent_method: CemeteryServiceRequestConsentMethodValue | '';
    leaseholder_consent_reference: string;
    service_request_notes: string;
    authorization_evidence: File | null;
};

export type ReverseMovedIntermentForm = {
    reason: string;
};

export type VoidIntermentForm = {
    reason: string;
};

export type CloseIntermentForm = {
    _method?: 'patch';
    end_type: Exclude<IntermentEndTypeValue, 'moved'>;
    ended_date: string;
    reason: string;
    notes: string;
    permit_reference: string;
    transfer_destination: string;
    requesting_party_name: string;
    requesting_party_contact: string;
    requesting_party_address: string;
    requesting_party_relationship: string;
    requester_is_leaseholder: boolean;
    leaseholder_consent_confirmed: boolean;
    leaseholder_consent_method: CemeteryServiceRequestConsentMethodValue | '';
    leaseholder_consent_reference: string;
    service_request_notes: string;
    authorization_evidence: File | null;
};

// ─── Reports ────────────────────────────────────────────────────────────────

export type ReportFilterOption = SelectOption & {
    site_id?: string | null;
    section_id?: string | null;
};

export type CemeteryReportFilterOptions = {
    sites: ReportFilterOption[];
    sections: ReportFilterOption[];
    blocks: ReportFilterOption[];
};

export type LeaseReportStateValue = 'expired' | 'expiring_soon' | 'active' | 'no_active_lease' | 'all';

export type LeaseReportFilters = {
    site_id: string | null;
    section_id: string | null;
    block_id: string | null;
    lease_state: LeaseReportStateValue;
    lease_end_from: string | null;
    lease_end_to: string | null;
    expiring_within_days: number;
    per_page: number;
};

export type LeaseReportRow = {
    plot_id: string;
    site_name: string | null;
    section_name: string | null;
    block_name: string | null;
    plot_label: string;
    active_interments_count: number;
    lease_state: LeaseReportStateValue;
    lease_state_label: string;
    leaseholder_name: string | null;
    leaseholder_contact: string | null;
    leaseholder_relationship: string | null;
    lease_start: string | null;
    lease_end: string | null;
    days: number | null;
    days_label: string;
    or_number: string | null;
    amount_paid: string | number | null;
    status_label: string | null;
};

export type PlotInventoryReportScopeValue = 'assignable' | 'containers' | 'all';

export type PlotInventoryReportFilters = {
    site_id: string | null;
    section_id: string | null;
    block_id: string | null;
    type: PlotTypeValue | null;
    status: PlotStatusValue | null;
    occupancy_mode: PlotOccupancyModeValue | null;
    scope: PlotInventoryReportScopeValue;
    per_page: number;
};

export type PlotInventoryReportRow = {
    plot_id: string;
    site_name: string | null;
    section_name: string | null;
    block_name: string | null;
    plot_label: string;
    type: PlotTypeValue | null;
    type_label: string | null;
    status: PlotStatusValue | null;
    status_label: string | null;
    occupancy_mode: PlotOccupancyModeValue | null;
    occupancy_mode_label: string | null;
    active_interments_count: number;
    capacity: number;
    remaining_capacity: number;
    area_sqm: string | number | null;
};

export type MissingDocumentsReportFilters = {
    registration_status: RegistrationStatusValue | null;
    vital_record_type: VitalRecordTypeValue | null;
    missing_document_type: DecedentDocumentTypeValue | null;
    interment_status: DecedentIntermentStatusFilterValue | null;
    per_page: number;
};

export type MissingDocumentsReportRow = {
    decedent_id: string;
    decedent_name: string;
    registry_number: string | null;
    vital_record_type: VitalRecordTypeValue | null;
    vital_record_type_label: string | null;
    date_of_death: string | null;
    interment_status: DecedentIntermentStatusFilterValue;
    interment_status_label: string;
    location_label: string | null;
    missing_document_types: DecedentDocumentTypeValue[];
    missing_documents: { type: DecedentDocumentTypeValue; label: string }[];
    missing_documents_label: string;
    pending_document_reason: string | null;
    pending_document_reference: string | null;
};

export type IntermentLifecycleStatusValue = 'active' | 'moved' | 'exhumed' | 'transferred_out' | 'voided' | 'all';

export type IntermentLifecycleReportFilters = {
    site_id: string | null;
    section_id: string | null;
    block_id: string | null;
    lifecycle_status: IntermentLifecycleStatusValue;
    end_type: IntermentEndTypeValue | null;
    date_from: string | null;
    date_to: string | null;
    per_page: number;
};

export type IntermentLifecycleReportRow = {
    id: string;
    decedent_name: string;
    site_name: string | null;
    section_name: string | null;
    block_name: string | null;
    plot_label: string | null;
    interment_date: string | null;
    lifecycle_status: Exclude<IntermentLifecycleStatusValue, 'all'>;
    lifecycle_label: string;
    end_type: IntermentEndTypeValue | null;
    end_type_label: string | null;
    ended_or_voided_at: string | null;
    transfer_destination: string | null;
    permit_reference: string | null;
    reason: string | null;
    notes: string | null;
};
