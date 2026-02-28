
interface Official {

    id: string;
    municipality?: string | null;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string
    profile_url?: string;
    formatted_name: string;

}

interface Appointment {
    id: string;
    term_id: string;
    official_id: string;
    position_id: string;
    actual_start_date: string;
    actual_end_date: string;
}

interface OfficialTerm {
    id: string;
    status: string | null;
    actual_start_date: string;
    actual_end_date: string | null;
    remarks?: string;
    official?: Official;
    position?: Position;

}

interface Term {
    id: string;
    municipality?: string | null;
    name: string;
    statutory_start: string;
    statutory_end: string;
    readable_start: string;
    readable_end: string;
    is_current?: boolean;
    label: string;
    officials_count?: number;
}

interface Position {
    id: string;
    title: string;

    // official?: Official | null;
    // appointment?: Appointment | null;

}