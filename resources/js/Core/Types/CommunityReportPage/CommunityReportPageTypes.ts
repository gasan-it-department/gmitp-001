
export interface CommunityReportFormData {
    issue_type: string;
    location: string;
    description: string;
    sender_name?: string;
    contact: string;
    latitude?: string;
    longitude?: string;
    files: File[];
}

export interface CommunityReportData {
    id: string;
    issue_type: string;
    location: string;
    description: string;
    sender_name?: string;
    contact: string;
    latitude?: string;
    longitude?: string;
    status: string;
    files: File[];
}