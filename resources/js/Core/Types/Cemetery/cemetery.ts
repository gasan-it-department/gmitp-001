// ─── Shared ──────────────────────────────────────────────────────────────

export type PlotStatusValue = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type PlotTypeValue = 'lawn_lot' | 'apartment_niche' | 'bone_ossuary' | 'mausoleum';
export type DecedentTypeValue = 'standard' | 'child' | 'fetal' | 'unknown';
export type IntermentStatusValue = 'pending' | 'interred' | 'exhumed' | 'transferred' | 'unassigned';

export interface SelectOption<T extends string = string> {
    value: T;
    label: string;
}

export interface PlotStatusOption extends SelectOption<PlotStatusValue> {
    tone: string;
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
    interment: {
        id: string;
        status: IntermentStatusValue;
        interment_date: string | null;
        plot: {
            id: string;
            plot_number: string | null;
            name: string | null;
            type: PlotTypeValue | null;
            status: PlotStatusValue | null;
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
    plot_number: string | null;
    name: string | null;
    type: PlotTypeValue | null;
    type_label: string | null;
    status: PlotStatusValue | null;
    status_label: string | null;
    status_tone: string | null;
    total_capacity: number | null;
    section: { id: string; name: string } | null;
}

export type CreatePlotForm = {
    section_id: string;
    plot_number: string;
    name: string;
    type: PlotTypeValue | '';
    status: PlotStatusValue;
    total_capacity: number | '';
};

// ─── Interments ──────────────────────────────────────────────────────────

export type CreateIntermentForm = {
    decedent_id: string;
    plot_id: string;
    interment_date: string;
    status: 'interred' | 'pending';
};
