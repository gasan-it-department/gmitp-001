import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, CalendarRange, Landmark, MapPin, PartyPopper, Sparkles, Users } from 'lucide-react';

type EnumOption = { value: string; label: string };

interface EventDetail {
    id: string;
    title: string;
    description: string;
    type: EnumOption;
    is_published: boolean;
    start_datetime: string | null;
    end_datetime: string | null;
    location_name: string;
    created_at: string | null;
    banner_url: string | null;
}

interface Props {
    event: EventDetail;
}

type TypeStyle = {
    chip: string;
    placeholder: string;
    icon: React.ComponentType<{ className?: string }>;
};

const TYPE_STYLES: Record<string, TypeStyle> = {
    festival: {
        chip: 'bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-300',
        placeholder: 'bg-purple-50 text-purple-300',
        icon: PartyPopper,
    },
    government: {
        chip: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300',
        placeholder: 'bg-blue-50 text-blue-300',
        icon: Landmark,
    },
    community: {
        chip: 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-300',
        placeholder: 'bg-emerald-50 text-emerald-300',
        icon: Users,
    },
    holiday: {
        chip: 'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-300',
        placeholder: 'bg-rose-50 text-rose-300',
        icon: Sparkles,
    },
};

const styleFor = (type: string): TypeStyle =>
    TYPE_STYLES[type] ?? {
        chip: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300',
        placeholder: 'bg-slate-50 text-slate-300',
        icon: CalendarDays,
    };

export default function EventClientShow({ event }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    const style = styleFor(event.type.value);
    const Icon = style.icon;

    return (
        <PublicLayout title={event.title} description="">
            <Head title={event.title} />

            <div className="container mx-auto max-w-3xl space-y-6 py-10">
                <Link href={`/${slug}/event`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
                    </Button>
                </Link>

                <Card className="overflow-hidden p-0">
                    {/* Hero banner */}
                    {event.banner_url ? (
                        <div className="aspect-[21/9] w-full overflow-hidden bg-slate-100">
                            <img src={event.banner_url} alt={event.title} className="h-full w-full object-cover" />
                        </div>
                    ) : (
                        <div className={`flex aspect-[21/9] w-full items-center justify-center ${style.placeholder}`}>
                            <Icon className="h-20 w-20" />
                        </div>
                    )}

                    <CardContent className="space-y-6 p-6 sm:p-8">
                        {/* Title block */}
                        <div className="space-y-3">
                            <Badge variant="secondary" className={`inline-flex items-center gap-1 ${style.chip}`}>
                                <Icon className="h-3 w-3" />
                                {event.type.label}
                            </Badge>
                            <h1 className="text-3xl leading-tight font-bold tracking-tight text-slate-900">{event.title}</h1>
                        </div>

                        {/* Schedule + location */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex items-start gap-3 rounded-lg border bg-slate-50/40 p-3">
                                <CalendarRange className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                                <div className="text-sm">
                                    <p className="font-medium text-slate-700">When</p>
                                    <p className="text-slate-600">{event.start_datetime ?? '—'}</p>
                                    <p className="text-xs text-slate-500">to {event.end_datetime ?? '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-lg border bg-slate-50/40 p-3">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                                <div className="text-sm">
                                    <p className="font-medium text-slate-700">Where</p>
                                    <p className="text-slate-600">{event.location_name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{event.description}</div>
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
