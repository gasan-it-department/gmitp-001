
interface Official {

    id: string;
    municipality?: string | null;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string
    profile_url?: string;
    full_name?: string;

}

interface Appointment {
    id: string;
    term_id: string;
    official_id: string;
    position_id: string;
    actual_start_date: string;
    actual_end_date: string;
}

interface Term {
    id: string;
    municipality?: string | null;
    name: string;
    statutory_start: string;
    statutory_end: string;
    is_current: boolean;
}

interface Position {
    id: string;
    title: string;

    official?: Official | null;
    appointment?: Appointment | null;

}