import { absoluteUrl, SeoSharedData } from '@/components/Seo/PublicSeo';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import eventRoute from '@/routes/event';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { Link, usePage } from '@inertiajs/react';
import { format, isValid, parse } from 'date-fns';
import { CalendarDays, ChevronRight, Landmark, MapPin, PartyPopper, Sparkles, Users } from 'lucide-react';
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
    location_name: string | null;
    banner_url: string | null;
    created_at: string | null;
}

interface Props {
    events: {
        data: EventCard[];
        links?: PaginationLink[];
        meta?: { links: PaginationLink[]; last_page: number; from: number; to: number; total: number };
    };
}

type TypeStyle = {
    accent: string;
    chip: string;
    hex: string;
    icon: React.ComponentType<{ className?: string }>;
};

const TYPE_STYLES: Record<string, TypeStyle> = {
    festival: {
        accent: 'border-purple-500',
        chip: 'bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-300',
        hex: '#a855f7',
        icon: PartyPopper,
    },
    government: {
        accent: 'border-blue-500',
        chip: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300',
        hex: '#3b82f6',
        icon: Landmark,
    },
    community: {
        accent: 'border-emerald-500',
        chip: 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-300',
        hex: '#10b981',
        icon: Users,
    },
    holiday: {
        accent: 'border-rose-500',
        chip: 'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-300',
        hex: '#f43f5e',
        icon: Sparkles,
    },
};

const FALLBACK_STYLE: TypeStyle = {
    accent: 'border-slate-400',
    chip: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300',
    hex: '#94a3b8',
    icon: CalendarDays,
};

const styleFor = (type: string): TypeStyle => TYPE_STYLES[type] ?? FALLBACK_STYLE;

const parseEventDate = (formatted: string | null | undefined): Date | null => {
    if (!formatted) return null;
    const parsed = parse(formatted, 'MMM dd, yyyy h:mm a', new Date());
    return isValid(parsed) ? parsed : null;
};

const toDayKey = (date: Date): string => format(date, 'yyyy-MM-dd');

export default function EventClientIndex({ events }: Props) {
    const { currentMunicipality, seo } = usePage<{ currentMunicipality: Municipality; seo: SeoSharedData }>().props;
    const slug = currentMunicipality.slug;
    const eventsUrl = absoluteUrl(`/${slug}/event`, seo.site_url);

    const list = useMemo(() => events?.data ?? [], [events?.data]);
    const meta = events?.meta;

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

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

    const selectedDateLabel = selectedDate ? format(parse(selectedDate, 'yyyy-MM-dd', new Date()), 'EEEE, MMMM d, yyyy') : '';

    return (
        <PublicLayout
            title="Events and Activities"
            description={`Discover upcoming festivals, government activities, and community events in ${currentMunicipality.name}, Marinduque.`}
            structuredData={{
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: absoluteUrl(`/${slug}/home`, seo.site_url),
                    },
                    { '@type': 'ListItem', position: 2, name: 'Events', item: eventsUrl },
                ],
            }}
        >
            <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
                {/* Header Section */}
                <div className="mb-8 space-y-2 text-center sm:text-left">
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Mga Kaganapan at Aktibidad</h1>
                    <p className="text-sm font-medium text-slate-500">
                        Mga piyesta, aktibidad ng pamahalaan, at pagtitipon sa komunidad ng {currentMunicipality.name}.
                    </p>
                </div>

                {/* Calendar Section — preserved internal props as requested */}
                <section className="mb-10 overflow-hidden rounded-2xl border-2 border-slate-100 bg-white shadow-sm transition-all hover:border-primary/20">
                    <div className="p-4 sm:p-6">
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
                    </div>
                </section>

                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-black tracking-widest text-slate-400 uppercase">Listahan ng mga Kaganapan</h2>
                </div>

                {list.length === 0 ? (
                    <Card className="border-none bg-slate-50/50 shadow-none">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                                <CalendarDays className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Walang nakatakdang kaganapan</h3>
                            <p className="mt-2 max-w-xs text-sm leading-relaxed font-medium text-slate-500">
                                Abangan ang mga susunod na aktibidad at pagtitipon mula sa ating lokal na pamahalaan.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {list.map((e) => {
                                const style = styleFor(e.type.value);
                                const Icon = style.icon;

                                return (
                                    <Link
                                        key={e.id}
                                        href={eventRoute.show.url({
                                            municipality: slug,
                                            event: e.id,
                                        })}
                                        className="group block"
                                    >
                                        <Card className="h-full overflow-hidden border-2 border-slate-100 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md active:scale-[0.99]">
                                            <CardContent className="p-0">
                                                {e.banner_url && (
                                                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                                        <img
                                                            src={e.banner_url}
                                                            alt={e.title}
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex flex-col gap-4 p-5">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-tight uppercase ${style.chip}`}
                                                        >
                                                            <Icon className="h-3 w-3" />
                                                            {e.type.label}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                            <CalendarDays className="h-3 w-3" />
                                                            {e.start_datetime}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <h3 className="line-clamp-2 text-base leading-tight font-extrabold text-slate-800 transition-colors group-hover:text-primary sm:text-lg">
                                                            {e.title}
                                                        </h3>

                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            <span className="line-clamp-1">{e.location_name ?? 'Walang itinakdang lugar'}</span>
                                                        </div>

                                                        <p className="line-clamp-2 text-xs leading-relaxed font-medium text-slate-500">
                                                            {e.description}
                                                        </p>
                                                    </div>

                                                    <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-4">
                                                        <span className="text-xs font-bold text-primary">Alamin ang detalye</span>
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/5 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                                                            <ChevronRight className="h-4 w-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Pagination Section */}
                        {meta && meta.last_page > 1 && (
                            <div className="mt-10 space-y-4 pt-4">
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    {meta.links.map((link, idx) => {
                                        const label = link.label
                                            .replace('&laquo;', '‹')
                                            .replace('&raquo;', '›')
                                            .replace('Previous', '')
                                            .replace('Next', '');

                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="flex h-10 min-w-[40px] items-center justify-center rounded-xl bg-slate-50 px-3 text-xs font-bold text-slate-300"
                                                    dangerouslySetInnerHTML={{ __html: label }}
                                                />
                                            );
                                        }
                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                preserveScroll
                                                className={`flex h-10 min-w-[40px] items-center justify-center rounded-xl px-3 text-xs font-bold transition-all ${
                                                    link.active
                                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                        : 'border-2 border-slate-100 bg-white text-slate-600 hover:border-primary/30 hover:text-primary'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: label }}
                                            />
                                        );
                                    })}
                                </div>
                                <p className="text-center text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                    Ipinapakita ang {meta.from} hanggang {meta.to} ng {meta.total} kaganapan
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Brand Footer */}
                <div className="mt-12 text-center">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-slate-300 uppercase">
                        Ligtas at Mabilis na Serbisyo • {currentMunicipality.name}
                    </p>
                </div>
            </div>

            {/* Date-click modal */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg rounded-2xl border-none shadow-2xl sm:border">
                    <DialogHeader className="space-y-3 pb-4">
                        <DialogTitle className="text-xl font-black text-slate-900">{selectedDateLabel}</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            {eventsOnSelectedDate.length > 0
                                ? `${eventsOnSelectedDate.length} kaganapan sa araw na ito.`
                                : 'Walang nakatakdang kaganapan para sa petsang ito.'}
                        </DialogDescription>
                    </DialogHeader>

                    {eventsOnSelectedDate.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <CalendarDays className="mb-3 h-10 w-10 text-slate-200" />
                            <p className="text-sm font-bold text-slate-400">Magandang araw! Magpahinga muna.</p>
                        </div>
                    ) : (
                        <ul className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                            {eventsOnSelectedDate.map((e) => {
                                const style = styleFor(e.type.value);
                                const Icon = style.icon;

                                return (
                                    <li key={e.id}>
                                        <Link
                                            href={eventRoute.show.url({ municipality: slug, event: e.id })}
                                            onClick={() => setDialogOpen(false)}
                                            className="group block"
                                        >
                                            <div className="flex items-start gap-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 p-4 transition-all hover:border-primary/20 hover:bg-white">
                                                <div
                                                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-2 sm:flex ${style.chip} shadow-sm ring-0`}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h3 className="truncate text-sm font-black tracking-tight text-slate-800 uppercase transition-colors group-hover:text-primary">
                                                            {e.title}
                                                        </h3>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                                            <CalendarDays className="h-3 w-3" />
                                                            {e.start_datetime}
                                                        </p>
                                                        <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                                            <MapPin className="h-3 w-3" />
                                                            <span className="truncate">{e.location_name ?? 'Walang itinakdang lugar'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-slate-300 transition-colors group-hover:text-primary" />
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
