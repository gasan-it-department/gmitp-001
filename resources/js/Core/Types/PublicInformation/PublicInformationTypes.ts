export interface ProcurementFormData {
    [key: string]: any;

    reference_number: string;
    title: string;
    category: string;
    status: string;
    approved_budget: number;
    contract_amount?: number | null;
    pre_bid_date?: string | null;
    closing_date?: string | null;
    award_date?: string | null;
    winning_bidder?: string | null;
    attachments: any[];
}

export interface Procurement {
    id: string;

    reference_number: string;
    title: string;
    category: string;

    status: string;

    approved_budget: number;       // PHP (float) becomes JS number
    contract_amount: number | null;
    winning_bidder: string | null;

    pre_bid_date: string | null;
    closing_date: string | null;
    award_date: string | null;
    created_at: string;

    // The array of files
    files?: ProcurementFile[];
}

export type ProcurementStatus = 'Draft' | 'Open' | 'Evaluating' | 'Awarded' | 'Failed' | 'Cancelled';

export interface ProcurementListItem {

    id: string;
    reference_number: string;
    title: string;
    abc_amount: number;
    category: string;
    status: ProcurementStatus;
    closing_date: string;

}

export interface ProcurementFile {
    id: string;
    name: string;
    type: string;
    download_url: string;
    view_url: string;
}

export interface BiddingFormData {
    title: string;
    type: string;
    deadline: string;
    budget: number;
    year: string;
    files: File[]
}

export interface BiddingData {
    id: string;
    title: string;
    type: string;
    deadline: string;
    budget: number;
    year: string;
    files: File[]
}

export interface AwardsFormData {
    id: string;
    title: string;
    type: string;
    deadline: string;
    budget: number;
    year: string;
    files: File[]
}

export interface AwardsData {
    id?: string;
    title: string;
    reference_number: string;
    category: string;
    approved_budget: number;
    status: string | null;
    pre_bid_date: string | null;
    closing_date: string | null;
    winning_bidder: string | null;
    award_date: string | null;
    created_at: string;
    files?: ProcurementFile[];
}






export interface CitizenCharterFormData {
    id: string;
    title: string;
    type: string;
    deadline: string;
    budget: number;
    year: string;
    files: File[]
}

export interface CitizenCharterData {
    id: string;
    title: string;
    type: string;
    deadline: string;
    budget: number;
    year: string;
    files: File[]
}