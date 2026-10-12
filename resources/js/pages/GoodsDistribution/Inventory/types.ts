export type CatalogKind = 'items' | 'programs' | 'sources' | 'locations';
export interface CatalogRecord {
    connected_programs?: { id: string; name: string; is_active: boolean }[];
    program_item_active?: boolean | null;
    items_in_stock?: number;
    draft_receipts_count?: number;
    id: string;
    code: string;
    name: string;
    is_active: boolean;
    base_unit?: 'kg' | 'piece';
    base_unit_locked?: boolean;
    category?: string | null;
    description?: string | null;
    source_type?: string;
    contact_name?: string | null;
    contact_phone?: string | null;
    contact_email?: string | null;
    address?: string | null;
    notes?: string | null;
}
export interface ProgramItemRecord {
    id: string;
    program_id: string;
    is_active: boolean;
    item: CatalogRecord;
}
export interface Program extends CatalogRecord {
    items_in_stock?: number;
    draft_receipts_count?: number;
}
export interface PageData<T> {
    data: T[];
    meta: { current_page: number; last_page: number; total: number; from: number | null; to: number | null };
    links: { prev: string | null; next: string | null };
}
export interface Options {
    items: CatalogRecord[];
    sources: CatalogRecord[];
    locations: CatalogRecord[];
    programs: CatalogRecord[];
}
export interface CommonProps {
    canViewDistribution?: boolean;
    program?: Program | null;
    canManage: boolean;
    canAdjust: boolean;
    filters: Record<string, string>;
}
export interface InventoryItem extends CatalogRecord {
    base_unit: 'kg' | 'piece';
    balance: string;
    reserved?: string;
    available?: string;
}
export interface ReceiptSummary {
    id: string;
    receipt_number: string;
    status: 'draft' | 'posted' | 'voided';
    source_name_snapshot?: string;
    storage_location_name_snapshot?: string;
}
export interface ReceiptLine {
    receivable?: boolean;
    item_is_active?: boolean;
    program_item_active?: boolean | null;
    id: string;
    line_number: number;
    item_id: string;
    item_name: string;
    program_id: string | null;
    program_name: string | null;
    base_unit: 'kg' | 'piece';
    quantity: string;
    package_type: string | null;
    package_count: number | null;
    quantity_per_package: string | null;
    batch_reference: string | null;
    expires_on: string | null;
    notes: string | null;
    expiry_state: 'none' | 'expired' | 'soon' | 'current';
    balance: string;
    receipt?: ReceiptSummary;
    unreserved?: string;
    reserved?: string;
    available?: string;
}
export interface Receipt extends ReceiptSummary {
    programs?: { id: string | null; name: string }[];
    is_mixed_program?: boolean;
    kind: 'receipt' | 'opening';
    stock_source_id: string;
    storage_location_id: string;
    source_name: string;
    location_name: string;
    received_on: string;
    reference: string | null;
    notes: string | null;
    posted_at: string | null;
    voided_at: string | null;
    void_reason: string | null;
    created_by: string | null;
    posted_by: string | null;
    voided_by: string | null;
    draft_fingerprint: string | null;
    lines_count?: number;
    lines: ReceiptLine[];
}
export interface Movement {
    distribution_request_id?: string | null;
    item_id?: string;
    item_name?: string;
    program_id?: string | null;
    program_name?: string | null;
    batch_reference?: string | null;
    id: string;
    stock_receipt_line_id: string;
    type: 'receipt' | 'opening' | 'adjustment' | 'reversal' | 'distribution';
    base_unit: 'kg' | 'piece';
    quantity: string;
    reason: string | null;
    reference: string | null;
    reverses_movement_id: string | null;
    reversal_id: string | null;
    occurred_on: string;
    posted_at: string;
    actor: string | null;
    receipt: ReceiptSummary;
}
