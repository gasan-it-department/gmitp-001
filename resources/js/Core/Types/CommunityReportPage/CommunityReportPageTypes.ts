
export type CommunityReportFormData = {
    issue_type: string;
    location: string;
    description: string;
    sender_name?: string;
    contact?: string;
    latitude?: string;
    longitude?: string;
    files: File[];
}

export type CommunityReportData = {
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
    resolved_at?: string;
    attachments: CommunityReportAttachments[];
}

export interface CommunityReportAttachments {
    id: string;
    name: string;
    type: string;
    view_url: string;
    download_url: string;
}
