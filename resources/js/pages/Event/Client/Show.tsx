import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, CalendarRange, Landmark, MapPin, PartyPopper, Sparkles, Users } from 'lucide-react';
import React from 'react';

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
    banner: string;
    icon: React.ComponentType<{ className?: string }>;
};

const TYPE_STYLES: Record<string, TypeStyle> = {
    festival: {
        chip: 'bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-300',
        banner: 'bg-purple-50 text-purple-800',
        icon: PartyPopper,
    },
    government: {
        chip: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300',
        banner: 'bg-blue-50 text-blue-800',
        icon: Landmark,
    },
    community: {
        chip: 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-300',
        banner: 'bg-emerald-50 text-emerald-800',
        icon: Users,
    },
    holiday: {
        chip: 'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-300',
        banner: 'bg-rose-50 text-rose-800',
        icon: Sparkles,
    },
};

const styleFor = (type: string): TypeStyle =>
    TYPE_STYLES[type] ?? {
        chip: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300',
        banner: 'bg-slate-50 text-slate-700',
        icon: CalendarDays,
    };

export default function EventClientShow({ event }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    const style = styleFor(event.type.value);
    const Icon = style.icon;

    return (
        <PublicLayout title="" description="">
            <Head title={event.title} />

            <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
                {/* Back Button */}
                <div className="mb-6">
                    <Link href={`/${slug}/event`}>
                        <button className="flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Bumalik sa mga Kaganapan
                        </button>
                    </Link>
                </div>

                <article className="space-y-8">
                    {/* Main Content Card */}
                    <Card className="overflow-hidden border-none shadow-xl sm:border-2 sm:border-slate-100 sm:shadow-lg">
                        {/* Hero banner */}
                        {event.banner_url ? (
                            <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                <img
                                    src={event.banner_url}
                                    alt={event.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                            </div>
                        ) : (
                            <div className={`flex aspect-video w-full items-center justify-center ${style.banner}`}>
                                <Icon className="h-20 w-20 opacity-20" />
                            </div>
                        )}

                        <CardContent className="p-6 sm:p-10">
                            <div className="space-y-8">
                                {/* Category Badge */}
                                <div>
                                    <Badge variant="secondary" className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest ${style.chip} ring-0 shadow-sm`}>
                                        <Icon className="h-3.5 w-3.5" />
                                        {event.type.label}
                                    </Badge>
                                </div>

                                {/* Title */}
                                <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
                                    {event.title}
                                </h1>

                                {/* Info Grid (When / Where) */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-start gap-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 p-4 transition-all hover:border-primary/10 hover:bg-white">
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary shadow-sm">
                                            <CalendarRange className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kailan</p>
                                            <div className="text-sm font-bold text-slate-700">
                                                <p>{event.start_datetime ?? '—'}</p>
                                                {event.end_datetime && event.end_datetime !== event.start_datetime && (
                                                    <p className="text-xs text-slate-500">hanggang {event.end_datetime}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 p-4 transition-all hover:border-primary/10 hover:bg-white">
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary shadow-sm">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Saan</p>
                                            <p className="text-sm font-bold text-slate-700 leading-tight">
                                                {event.location_name}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="prose prose-slate max-w-none">
                                    <div className="text-base leading-relaxed whitespace-pre-wrap text-slate-700 sm:text-lg">
                                        {event.description}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Brand Footer */}
                    <div className="text-center pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                            Ligtas at Mabilis na Serbisyo • {currentMunicipality.name}
                        </p>
                    </div>
                </article>
            </div>
        </PublicLayout>
    );
}

