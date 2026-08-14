import type { FormDataConvertible } from '@inertiajs/core';
import { Department } from '../Department/department';

export type ProcurementFormData = {
    reference_number: string;
    title: string;
    description?: string | null;
    category: string;
    status: string;
    abc_amount: number | '';
    contract_amount?: number | null;
    pre_bid_date?: string | null;
    closing_date?: string | null;
    awarded_date?: string | null;
    winning_bidder?: string | null;
    failure_reason?: string | null;
    failed_date?: string | null;
    documents: FormDataConvertible[];
    department_id?: string | null;
    funding_source_id: string | null;
    is_historical: boolean;
    published_at?: string | null;
    notes?: string | null;
    custom_funding_source?: string | null;
};

export interface Procurement {
    id: string;
    reference_number: string | null;
    title: string;
    description?: string | null;
    category: Category;
    status: ProcurementStatus;
    abc_amount: number; // PHP (float) becomes JS number
    contract_amount: number | null;
    winning_bidder: string | null;
    pre_bid_date: string | null;
    closing_date: string | null;
    awarded_date: string | null;
    published_at?: string | null;
    failure_reason?: string | null;
    failed_date?: string | null;
    cancellation_reason?: string | null;
    created_at: string;
    notes: string | null;
    department_id: string | null;
    funding_source_id: string | null;
    custom_funding_source?: string | null;
}

export interface ProcurementDetail extends Procurement {
    department: Department | null;
    funding_source: FundingSource | null;
    media: ProcurementFile[];
    prepared_by: {
        id: string;
        full_name: string;
    } | null;
}

export type ProcurementLabeledValue = string | { value?: string; label?: string; name?: string } | null | undefined;

const PROCUREMENT_STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    open: 'Open for bidding',
    evaluating: 'Under evaluation',
    awarded: 'Awarded',
    failed: 'Failed bidding',
    cancelled: 'Cancelled',
};

const PROCUREMENT_CATEGORY_LABELS: Record<string, string> = {
    goods: 'Goods',
    infrastructure: 'Infrastructure projects',
    consulting: 'Consulting services',
    furniture_and_fixtures: 'Furniture & fixtures',
    office_supplies: 'Office supplies',
    office_equipment: 'Office equipment',
    vehicles: 'Vehicles & transportation',
    medical_supplies: 'Medical & laboratory supplies',
    others: 'Others',
};

export const getProcurementValue = (value: ProcurementLabeledValue): string => {
    if (!value) return 'unknown';
    return (typeof value === 'string' ? value : value.value || value.name || 'unknown').toLowerCase();
};

const humanizeProcurementValue = (value: string): string =>
    value
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^\w|\s\w/g, (letter) => letter.toUpperCase());

export const getProcurementStatusLabel = (status: ProcurementLabeledValue): string => {
    const value = getProcurementValue(status);
    if (value === 'unknown') return 'Status unavailable';
    return PROCUREMENT_STATUS_LABELS[value] || (typeof status === 'object' && status?.label) || humanizeProcurementValue(value);
};

export const getProcurementCategoryLabel = (category: ProcurementLabeledValue): string => {
    const value = getProcurementValue(category);
    if (value === 'unknown') return 'Category unavailable';
    return PROCUREMENT_CATEGORY_LABELS[value] || (typeof category === 'object' && category?.label) || humanizeProcurementValue(value);
};

export interface ProcurementFile {
    [key: string]: FormDataConvertible;
    id: string | number;
    file_name: string;
    url: string;
    download_url?: string;
    type?: string;
    type_label?: string;
    mime_type?: string;
    size?: number;
    collection?: string;
}

export type ProcurementStatus = 'draft' | 'open' | 'evaluating' | 'awarded' | 'failed' | 'cancelled';

export interface ProcurementListItem {
    id: string;
    reference_number: string;
    title: string;
    abc_amount: number;
    category: string;
    status: ProcurementStatus;
    closing_date: string;
}

export interface FundingSource {
    id: string;
    code: string;
    name: string;
    label?: string;
}

export interface ProcurementSelectOption {
    value: string;
    label: string;
    color?: string;
    allowed_statuses?: string[];
}

export interface Category {
    label: string;
    value: string;
}
