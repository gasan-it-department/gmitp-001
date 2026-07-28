import { Card, CardContent } from '@/components/ui/card';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertOctagon, AlertTriangle, ArrowLeft, Calendar, Construction, Megaphone, Zap } from 'lucide-react';
import React from 'react';

type EnumOption = { value: string; label: string };

interface AnnouncementDetail {
    id: string;
    title: string;
    content: string;
    type: EnumOption;
    is_published: boolean;
    created_at: string | null;
    images: { url: string }[];
}

interface Props {
    announcement: AnnouncementDetail;
}

type TypeStyle = {
    chip: string;
    banner: string;
    icon: React.ComponentType<{ className?: string }>;
};

const TYPE_STYLES: Record<string, TypeStyle> = {
    emergency: {
        chip: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-300',
        banner: 'bg-red-50 text-red-800',
        icon: AlertOctagon,
    },
    advisory: {
        chip: 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300',
        banner: 'bg-amber-50 text-amber-800',
        icon: AlertTriangle,
    },
    utility_interruption: {
        chip: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300',
        banner: 'bg-blue-50 text-blue-800',
        icon: Zap,
    },
    roadwork: {
        chip: 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-300',
        banner: 'bg-orange-50 text-orange-800',
        icon: Construction,
    },
    general: {
        chip: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300',
        banner: 'bg-slate-50 text-slate-700',
        icon: Megaphone,
    },
};

const styleFor = (type: string): TypeStyle => TYPE_STYLES[type] ?? TYPE_STYLES.general;

export default function AnnouncementClientShow({ announcement }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    const style = styleFor(announcement.type.value);
    const Icon = style.icon;

    return (
        <PublicLayout title="" description="">
            <Head title={announcement.title} />

            <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
                {/* Back Button */}
                <div className="mb-6">
                    <Link href={`/${slug}/announcement`}>
                        <button className="flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Bumalik sa mga Anunsyo
                        </button>
                    </Link>
                </div>

                <article className="space-y-8">
                    {/* Main Content Card */}
                    <Card className="overflow-hidden border-none shadow-xl sm:border-2 sm:border-slate-100 sm:shadow-lg">
                        {/* Header Banner */}
                        <header className={`flex items-center gap-4 px-6 py-4 ${style.banner}`}>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/50 backdrop-blur-sm">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${style.chip}`}>
                                    {announcement.type.label}
                                </span>
                                {announcement.created_at && (
                                    <div className="flex items-center gap-1.5 text-xs font-bold opacity-70">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{announcement.created_at}</span>
                                    </div>
                                )}
                            </div>
                        </header>

                        <CardContent className="p-6 sm:p-10">
                            <div className="space-y-8">
                                {/* Title */}
                                <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
                                    {announcement.title}
                                </h1>

                                {/* Gallery */}
                                {announcement.images.length > 0 && (
                                    <div className={`grid gap-3 ${announcement.images.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                                        {announcement.images.map((img, i) => (
                                            <a
                                                key={i}
                                                href={img.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group relative aspect-video overflow-hidden rounded-2xl border-2 border-slate-50 bg-slate-100 transition-all hover:border-primary/20"
                                            >
                                                <img 
                                                    src={img.url} 
                                                    alt={`${announcement.title} — larawan ${i + 1}`} 
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                                />
                                                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {/* Body Content */}
                                <div className="prose prose-slate max-w-none">
                                    <div className="text-base leading-relaxed whitespace-pre-wrap text-slate-700 sm:text-lg">
                                        {announcement.content}
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

