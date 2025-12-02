
export interface CommunityReportFormData {
    issue_type: string;
    location: string;
    description: string;
    sender_name?: string;
    contact?: string;
    latitude?: string;
    longitude?: string;
    files: File[];
}

export interface CommunityReportData {
    id: string;
    type: string;
    location: string;
    description: string;
    sender_name?: string;
    contact?: string;
    latitude?: string;
    longitude?: string;
    created_at: string;
    status: string;
    files: File[];
}