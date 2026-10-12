import type { CatalogRecord, PageData } from '../Inventory/types';

export type Status = 'pending' | 'under_review' | 'returned' | 'approved' | 'released' | 'cancelled';
export type Permissions = Record<'view' | 'intake' | 'process' | 'decide' | 'release', boolean>;
export interface Person {
    id: string;
    beneficiary_id?: string | null;
    name: string;
    birth_date?: string | null;
    sex?: string;
    relationship?: string;
}
export interface Recipient {
    id: string;
    name: string;
    beneficiary_number: string;
    birth_date: string;
    identity_verified: boolean;
    household_code: string;
    roster: Person[];
}
export interface Snapshot {
    filer: Person;
    subject: Person;
    household_id: string;
    household_code: string;
    barangay: string;
    street: string;
    roster: Person[];
    identity_verified: boolean;
    captured_at: string;
}
export interface GoodsLine {
    id: string;
    item_id: string;
    item_name_snapshot: string;
    item_code_snapshot: string;
    base_unit: 'kg' | 'piece';
    quantity: string;
}
export interface HouseholdSyncPreview {
    snapshot: Snapshot | null;
    fingerprint: string | null;
    changed: boolean;
    identity_changed: boolean;
    error: string | null;
}
export interface DocumentCheck {
    id: string;
    label: string;
    description: string | null;
    is_required: boolean;
    evidence_mode: 'physical' | 'upload' | 'both';
    physical_copy_requirement: string;
    status: 'pending' | 'verified' | 'rejected';
    current_media_id: number | null;
    presented_copy_type: string | null;
    remarks: string | null;
    checked_at: string | null;
    checked_by_user_id: string | null;
}
export interface Allocation {
    id: string;
    distribution_request_line_id: string;
    stock_receipt_line_id: string;
    item_name: string;
    quantity: string;
    base_unit: string;
    status: 'reserved' | 'consumed' | 'cancelled';
    batch_reference: string | null;
    receipt_reference: string;
    expires_on: string | null;
}
export interface GoodsRequest {
    id: string;
    reference: string;
    status: Status;
    version: number;
    beneficiary_id: string;
    assisted_household_member_id: string | null;
    program_id: string;
    program_name: string;
    storage_location_id: string;
    storage_name: string;
    snapshot: Snapshot;
    filing_snapshot: Snapshot;
    handover_snapshot: Snapshot | null;
    notes: string | null;
    transition_reason: string | null;
    created_at: string;
    approved_at: string | null;
    approved_on: string | null;
    released_at: string | null;
    actual_release_on: string | null;
    collector_type: string | null;
    collector_name: string | null;
    collector_relationship: string | null;
    collector_id_type: string | null;
    collector_id_last_four: string | null;
    acknowledgement_reference: string | null;
    release_notes: string | null;
    lines: GoodsLine[];
    documents: DocumentCheck[];
    allocations: Allocation[];
}
export interface Options {
    programs: { id: string; name: string }[];
    locations: { id: string; name: string }[];
}
export interface History {
    data: { id: number; description: string; actor: string; created_at: string; properties: Record<string, unknown> }[];
    next: string | null;
    previous: string | null;
}
export type { CatalogRecord, PageData };
