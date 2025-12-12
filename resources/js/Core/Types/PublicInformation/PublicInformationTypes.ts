
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
    id: string;
    title: string;
    reference_number: string;
    category: string;
    approved_budget: number;
    status: string;
    pre_bid_date: string;
    closing_date: string;
    winning_bidder: string;
    award_date: string;
    created_at: string;
    files?: ProcurementFile[];
}

export interface ProcurementFile {
    id: string;
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