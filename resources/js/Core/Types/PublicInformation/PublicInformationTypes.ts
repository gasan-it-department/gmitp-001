
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


export interface ProcurementFile {
    id: string;
    name: string;
    type: string;
    download_link: string;
    view_link: string;
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