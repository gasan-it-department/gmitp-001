export type Option = { value: string; label: string };
export type FacilityAddressOption = { id: string; name: string };
export type FacilityAddressParts = {
    barangay: string;
    street: string;
};
export const emptyAddressParts = (): FacilityAddressParts => ({ barangay: '', street: '' });
export const formatAddressParts = (parts: FacilityAddressParts): string =>
    [parts.street, parts.barangay]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(', ');
export type Period = { opening_minute: number; closing_minute: number };
export type WeeklyDay = { day_of_week: number; is_closed: boolean; periods: Period[] };
export type ScheduleException = {
    id: string;
    exception_date: string;
    notice_type: string;
    is_closed: boolean;
    public_notice: string;
    periods: Period[];
};
export type Availability = {
    timezone: string;
    date: string;
    computed_at: string;
    next_refresh_at: string;
    is_open: boolean | null;
    status: string;
    label: string;
    closes_at: string | null;
    next_opens_at: string | null;
    expected_reopens_at: string | null;
    today_periods: Period[];
    notice: string | null;
    notice_type: string | null;
};
export type FacilitySummary = {
    id: string;
    name: string;
    type: Option;
    location_name: string | null;
    address: string | null;
    image_url: string | null;
    availability: Availability;
};
export type FacilityDetails = FacilitySummary & {
    description: string | null;
    contact_name: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    weekly_days: WeeklyDay[];
    exceptions: ScheduleException[];
};
export type AdminFacilitySummary = FacilitySummary & { is_published: boolean; revision: number; operating_status: string };
export type AdminFacility = FacilityDetails &
    AdminFacilitySummary & {
        operating_notice: string | null;
        expected_reopens_at_input: string | null;
        audit_log: { id: number; description: string; created_at: string }[];
    };
export type FacilityPagination<T> = { data: T[]; meta: { links: { url: string | null; label: string; active: boolean }[] } };

export const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const defaultPeriod = (): Period => ({ opening_minute: 480, closing_minute: 1020 });
export const inputTime = (minute: number): string =>
    `${String(Math.floor((minute % 1440) / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
export const parseTime = (value: string): number => {
    const [hour, minute] = value.split(':').map(Number);
    return hour * 60 + minute;
};
export const displayMinute = (minute: number): string => {
    if (minute === 1440) return 'Midnight (end of day)';
    const hour = Math.floor(minute / 60);
    return `${hour % 12 || 12}:${String(minute % 60).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
};
export const displayPeriods = (periods: Period[]): string =>
    periods.length ? periods.map((period) => `${displayMinute(period.opening_minute)}–${displayMinute(period.closing_minute)}`).join(', ') : 'Closed';
export const displayInstant = (instant: string): string =>
    new Intl.DateTimeFormat('en-PH', {
        timeZone: 'Asia/Manila',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(instant));
// Parse date-only strings without allowing the visitor's timezone to change the calendar date.
export const displayDate = (date: string): string =>
    new Intl.DateTimeFormat('en-PH', {
        timeZone: 'Asia/Manila',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(`${date}T00:00:00+08:00`));
