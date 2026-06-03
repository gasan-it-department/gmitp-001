// ─── Shared ──────────────────────────────────────────────────────────────

export type PlotStatusValue = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type PlotTypeValue = 'lawn_lot' | 'apartment_niche' | 'bone_ossuary' | 'mausoleum';
export type DecedentTypeValue = 'standard' | 'child' | 'fetal' | 'unknown';

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
    decedent_type: DecedentTypeValue | null;
    death_certificate_no: string;
    date_of_death: string;
    date_of_registration: string | null;
    interment_status: IntermentStatusValue;
    plot_label: string | null;
}

export interface DecedentProfile {
    id: string;
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
    decedent_type: DecedentTypeValue | null;
    reference_document_type: string | null;
    reference_document_number: string | null;
    place_of_death: string | null;
    cause_of_death: string | null;
    death_certificate_no: string | null;
    notes: string | null;
    avatar_url: string | null;
    identification: {
        id: number;
        name: string;
        url: string;
        mime_type: string;
    }[];
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
    decedent_type: DecedentTypeValue;
    gender: 'male' | 'female' | '';

    has_official_name: boolean;

    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    memorial_name: string;

    reference_document_number: string;
    reference_document_type: string;
    place_of_death: string;
    psgc_municipal_id: string;
    psgc_barangay_id: string;
    street_name: string;

    cause_of_death: string;
    death_certificate_no: string;
    date_of_birth: string;
    date_of_death: string;
    date_of_registration: string;

    notes: string;
    avatar: File | null;
    identification: File[];
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
