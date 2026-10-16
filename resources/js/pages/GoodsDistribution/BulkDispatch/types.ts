import type { CatalogRecord, InventoryItem, PageData } from '../Inventory/types';

export type BulkStatus = 'draft' | 'approved' | 'dispatched' | 'closed' | 'cancelled';
export type BulkCustodianType = 'staff' | 'barangay_official' | 'other_representative';
export type BulkPurpose = 'community_distribution' | 'home_delivery' | 'school_distribution' | 'emergency_relief' | 'other';
export type BulkCommand = 'approve' | 'withdraw' | 'cancel' | 'dispatch' | 'close' | 'reopen' | 'report' | 'returnGoods' | 'reverse';

export interface BulkLine {
    id: string;
    item_id: string;
    item_name_snapshot: string;
    item_code_snapshot: string;
    base_unit: 'kg' | 'piece';
    quantity: string | null;
}

export interface BulkDispatch {
    id: string;
    reference: string;
    version: number;
    status: BulkStatus;
    program_id: string;
    program_name: string;
    storage_location_id: string;
    storage_name: string;
    requester_name: string | null;
    requester_role: string | null;
    custodian_type: BulkCustodianType;
    custodian_type_label: string;
    custodian_user_id: string | null;
    custodian_name: string | null;
    custodian_role: string | null;
    destination_barangays: string[];
    purpose: BulkPurpose | null;
    purpose_label: string | null;
    purpose_notes: string | null;
    location_notes: string | null;
    paper_reference: string | null;
    created_at: string;
    approved_on: string | null;
    actual_dispatch_on: string | null;
    closed_at: string | null;
    lines: BulkLine[];
}

export interface BulkAllocation {
    id: string;
    line_id: string;
    batch_id: string;
    item_id: string;
    item_name: string;
    base_unit: 'kg' | 'piece';
    status: 'reserved' | 'issued';
    quantity: string;
    issued: string;
    additional_issue_id?: string | null;
    issued_on?: string | null;
    reported_distributed: string;
    returned: string;
    with_staff: string;
    batch_reference: string | null;
    receipt_reference: string;
    source_name: string;
    expires_on: string | null;
}

export interface BulkPreview {
    fingerprint: string;
    allocations: (Pick<BulkAllocation, 'item_name' | 'base_unit' | 'quantity' | 'batch_reference' | 'receipt_reference' | 'source_name' | 'expires_on'> & {
        allocation_id?: string;
        batch_id?: string;
    })[];
}

export interface BulkChoices {
    custodian_types: { value: BulkCustodianType; label: string }[];
    purposes: { value: BulkPurpose; label: string }[];
}

export interface BulkOptions extends BulkChoices {
    programs: CatalogRecord[];
    locations: CatalogRecord[];
    custodians: { id: string; name: string }[];
    barangays: string[];
}

export interface BulkPermissions {
    view: boolean;
    prepare: boolean;
    approve: boolean;
    dispatch: boolean;
    reconcile: boolean;
    correct: boolean;
}

export interface BulkEvent {
    id: string;
    kind: 'distribution' | 'return' | 'reversal';
    occurred_on: string;
    reference: string | null;
    notes: string | null;
    reversal_id: string | null;
    reverses_reconciliation_id: string | null;
    lines: { id: string; item_name: string; quantity: string; base_unit: string }[];
}

export interface BulkPageProps {
    dispatch: BulkDispatch;
    allocations: BulkAllocation[];
    stock: InventoryItem[];
    permissions: BulkPermissions;
    today: string;
    filters: Record<string, string>;
    additionalIssuesReady?: boolean;
    additionalIssues?: PageData<BulkAdditionalIssue>;
    hasPendingAdditionalIssues?: boolean;
    recipientReady?: boolean;
    recipients?: PageData<BulkRecipient>;
    recipientCoverage?: RecipientCoverage[];
    recipientCounts?: { active: number; without_quantities: number };
    recipientBarangays?: string[];
    reconciliations?: PageData<BulkEvent>;
    attachments?: { id: number; name: string; mime_type: string; created_at: string }[];
    history?: { data: { id: number; description: string; actor: string; created_at: string; properties: Record<string, unknown> }[]; links: { next: string | null; prev: string | null } };
    historyChoices?: BulkChoices;
}

export interface BulkAdditionalIssue {
    id: string;
    status: 'pending' | 'approved' | 'issued' | 'cancelled';
    reason: string;
    cancellation_reason: string | null;
    created_at: string;
    approved_on: string | null;
    actual_issue_on: string | null;
    lines: Omit<BulkLine, 'id'>[];
}

export interface BulkRecipient {
    id: string;
    bulk_dispatch_id: string;
    version: number;
    full_name: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    barangay: string | null;
    purok: string | null;
    received_on: string | null;
    collector_name: string | null;
    collector_relationship: string | null;
    paper_reference: string | null;
    paper_row: string | null;
    acknowledgement: 'signature' | 'thumbmark' | null;
    remarks: string | null;
    status: 'active' | 'voided';
    void_reason: string | null;
    created_at: string;
    voided_at: string | null;
    lines: { id: string; bulk_dispatch_line_id: string; item_id: string; item_name_snapshot: string; item_code_snapshot: string; base_unit: 'kg' | 'piece'; quantity: string }[];
}

export interface RecipientCoverage {
    bulk_dispatch_line_id: string;
    item_id: string;
    item_name: string;
    item_code: string;
    base_unit: 'kg' | 'piece';
    reported_distributed: string;
    recorded: string;
    without_details: string;
    excess: string;
    needs_review: boolean;
}
