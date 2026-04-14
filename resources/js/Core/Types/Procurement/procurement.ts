import { Department } from "../Department/department";

export type ProcurementFormData = {
    reference_number: string;
    title: string;
    category: string;
    status: string;
    abc_amount: number | '';
    contract_amount?: number | null;
    pre_bid_date?: string | null;
    closing_date?: string | null;
    awarded_date?: string | null;
    winning_bidder?: string | null;
    documents: any[];
    department_id?: string | null;
    funding_source_id: string | null;
    is_historical: boolean;
    notes?: string | null;
}

export interface Procurement {
    id: string;
    reference_number: string;
    title: string;
    category: Category;
    status: ProcurementStatus;
    abc_amount: number;       // PHP (float) becomes JS number
    contract_amount: number | null;
    winning_bidder: string | null;
    pre_bid_date: string | null;
    closing_date: string | null;
    awarded_date: string | null;
    created_at: string;
    notes: string;
    department_id: string | null;
    funding_source_id: string | null;
}

export interface ProcurementDetail extends Procurement {
    department: Department;
    funding_source: FundingSource;
    documents: ProcurementFile[];
    prepared_by: {
        id: string;
        full_name: string;
    };
}

export interface ProcurementFile {
    id: string;
    file_name: string;
    type: string;
    file_size: number;
    file_path: string;
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

export interface Category {
    label: string;
    value: string;
}

