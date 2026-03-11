export type EventFormData = {
    title: string;
    description: string;
    event_date: string;
    id: string;
};

export type EventData = {
    id: string;
    title: string;
    description: string;
    event_date: string;
    created_at: string;
    is_published?: boolean;
};
