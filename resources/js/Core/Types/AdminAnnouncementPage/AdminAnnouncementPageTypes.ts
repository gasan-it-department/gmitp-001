export interface AnnouncementFormData {
    title: string;
    message: string;
    is_published?: boolean;
}

export interface AnnouncementData{
    title: string;
    message: string;
    is_published?: boolean;
    id: string;
    created_at: string;
}