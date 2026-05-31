import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { Head, Link, usePage } from '@inertiajs/react';
import { format, isValid, parse } from 'date-fns';
import { CalendarDays, Landmark, MapPin, PartyPopper, Sparkles, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

type EnumOption = { value: string; label: string };

type PaginationLink = { url: string | null; label: string; active: boolean };

interface EventCard {
    id: string;
    title: string;
    description: string;
    type: EnumOption;
    is_published: boolean;
    start_datetime: string | null;
    end_datetime: string | null;
    location_name: string;
    banner_url: string | null;
    created_at: string | null;
}

interface Props {
    events: {
        data: EventCard[];
        links?: PaginationLink[];
        meta?: { links: PaginationLink[] };
    };
}

type TypeStyle = {
    accent: string;
    stripe: string;
    chip: string;
    hex: string;
    icon: React.ComponentType<{ className?: string }>;
};

const TYPE_STYLES: Record<string, TypeStyle> = {
    festival: {
        accent: 'border-purple-500',
        stripe: 'bg-purple-500',
        chip: 'bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-300',
        hex: '#a855f7',
        icon: PartyPopper,
    },
    government: {
        accent: 'border-blue-500',
        stripe: 'bg-blue-500',
        chip: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300',
        hex: '#3b82f6',
        icon: Landmark,
    },
    community: {
        accent: 'border-emerald-500',
        stripe: 'bg-emerald-500',
        chip: 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-300',
        hex: '#10b981',
        icon: Users,
    },
    holiday: {
        accent: 'border-rose-500',
        stripe: 'bg-rose-500',
        chip: 'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-300',
        hex: '#f43f5e',
        icon: Sparkles,
    },
};

const FALLBACK_STYLE: TypeStyle = {
    accent: 'border-slate-400',
    stripe: 'bg-slate-400',
    chip: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300',
    hex: '#94a3b8',
    icon: CalendarDays,
};

const styleFor = (type: string): TypeStyle => TYPE_STYLES[type] ?? FALLBACK_STYLE;

/**
 * Parses the human-readable datetime string returned by EventBaseResource
 * (PHP format "M d, Y g:i A"  →  "May 31, 2026 6:00 PM"). Returns `null`
 * when the input is missing or unparseable.
 */
const parseEventDate = (formatted: string | null | undefined): Date | null => {
    if (!formatted) return null;
    const parsed = parse(formatted, 'MMM dd, yyyy h:mm a', new Date());
    return isValid(parsed) ? parsed : null;
};

const toDayKey = (date: Date): string => format(date, 'yyyy-MM-dd');

export default function EventClientIndex({ events }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    const list = events?.data ?? [];

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    /** Shape used by FullCalendar. */
    const calendarEvents = useMemo(
        () =>
            list.flatMap((e) => {
                const start = parseEventDate(e.start_datetime);
                if (!start) return [];
                const end = parseEventDate(e.end_datetime);
                const style = styleFor(e.type.value);
                return [
                    {
                        id: e.id,
                        title: e.title,
                        start,
                        // FullCalendar treats `end` as exclusive — bump by 1 day so
                        // multi-day events visually span the full last day.
                        end: end ? new Date(end.getTime() + 24 * 60 * 60 * 1000) : undefined,
                        backgroundColor: style.hex,
                        borderColor: style.hex,
                        textColor: '#ffffff',
                        extendedProps: { type: e.type.value },
                    },
                ];
            }),
        [list],
    );

    /** Events that overlap the clicked date (inclusive of both endpoints). */
    const eventsOnSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        return list.filter((e) => {
            const start = parseEventDate(e.start_datetime);
            if (!start) return false;
            const end = parseEventDate(e.end_datetime) ?? start;
            return selectedDate >= toDayKey(start) && selectedDate <= toDayKey(end);
        });
    }, [list, selectedDate]);

    const handleDateClick = (info: DateClickArg) => {
        setSelectedDate(info.dateStr);
        setDialogOpen(true);
    };

    const selectedDateLabel = selectedDate
        ? format(parse(selectedDate, 'yyyy-MM-dd', new Date()), 'EEEE, MMMM d, yyyy')
        : '';

    return (
        <PublicLayout title="Events" description="">
            <Head title="Events" />

            <div className="container mx-auto max-w-5xl space-y-8 py-10">
                <header className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Upcoming Events</h1>
                    <p className="text-sm text-muted-foreground">
                        Festivals, government activities, and community gatherings in {currentMunicipality.name}.
                    </p>
                </header>

                {/* Calendar — click any date to see what's scheduled. */}
                <section className="rounded-xl border bg-white p-4 shadow-sm">
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        events={calendarEvents}
                        dateClick={handleDateClick}
                        height="auto"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: '',
                        }}
                        dayMaxEvents={3}
                        eventDisplay="block"
                        fixedWeekCount={false}
                    />
                </section>

                {/* Existing scrolling list of event cards — preserved per spec. */}
                {list.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 px-6 py-16 text-center">
                        <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground" />
                        <p className="text-base font-semibold">No events scheduled.</p>
                        <p className="mt-1 text-sm text-muted-foreground">Check back soon — the LGU posts new events regularly.</p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2">
                        {list.map((e) => {
                            const style = styleFor(e.type.value);
                            const Icon = style.icon;

                            return (
                                <Link
                                    key={e.id}
                                    href={`/${slug}/event/${e.id}`}
                                    className={`group flex overflow-hidden rounded-xl border-l-4 bg-white shadow-sm transition-shadow hover:shadow-md ${style.accent}`}
                                >
                                    <div className="flex flex-1 flex-col">
                                        {e.banner_url && (
                                            <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                                <img
                                                    src={e.banner_url}
                                                    alt={e.title}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                                <span className={`absolute top-0 left-0 h-full w-1.5 ${style.stripe}`} />
                                            </div>
                                        )}

                                        <div className="flex flex-1 flex-col gap-3 p-4">
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.chip}`}
                                                >
                                                    <Icon className="h-3 w-3" />
                                                    {e.type.label}
                                                </span>
                                                {e.start_datetime && <span className="text-xs text-muted-foreground">{e.start_datetime}</span>}
                                            </div>

                                            <h2 className="text-base leading-snug font-semibold text-slate-800 group-hover:text-slate-900">
                                                {e.title}
                                            </h2>

                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <MapPin className="h-3 w-3" />
                                                <span className="line-clamp-1">{e.location_name}</span>
                                            </div>

                                            <p className="line-clamp-2 text-sm text-slate-600">{e.description}</p>

                                            <span className="mt-auto text-xs font-medium text-slate-500 group-hover:text-slate-700">Read more →</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Date-click modal */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{selectedDateLabel}</DialogTitle>
                        <DialogDescription>
                            {eventsOnSelectedDate.length > 0
                                ? `${eventsOnSelectedDate.length} event${eventsOnSelectedDate.length > 1 ? 's' : ''} on this day.`
                                : 'Nothing on the calendar for this date.'}
                        </DialogDescription>
                    </DialogHeader>

                    {eventsOnSelectedDate.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <CalendarDays className="mb-2 h-8 w-8 text-muted-foreground opacity-60" />
                            <p className="text-sm text-muted-foreground">No events scheduled for this day.</p>
                        </div>
                    ) : (
                        <ul className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                            {eventsOnSelectedDate.map((e) => {
                                const style = styleFor(e.type.value);
                                const Icon = style.icon;

                                return (
                                    <li key={e.id}>
                                        <Link
                                            href={`/${slug}/event/${e.id}`}
                                            onClick={() => setDialogOpen(false)}
                                            className={`flex items-start gap-3 rounded-lg border border-l-4 bg-white p-3 transition-colors hover:bg-slate-50 ${style.accent}`}
                                        >
                                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h3 className="truncate text-sm font-semibold text-slate-800">{e.title}</h3>
                                                    <Badge variant="secondary" className={style.chip}>
                                                        {e.type.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-slate-600">
                                                    {e.start_datetime}
                                                    {e.end_datetime && e.end_datetime !== e.start_datetime ? ` — ${e.end_datetime}` : ''}
                                                </p>
                                                <p className="flex items-center gap-1 text-xs text-slate-500">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="truncate">{e.location_name}</span>
                                                </p>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </DialogContent>
            </Dialog>
        </PublicLayout>
    );
}
