import { Button } from '@/components/ui/button';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertOctagon, AlertTriangle, ArrowLeft, Construction, Megaphone, Zap } from 'lucide-react';

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
    accent: string;
    stripe: string;
    chip: string;
    banner: string;
    icon: React.ComponentType<{ className?: string }>;
};

const TYPE_STYLES: Record<string, TypeStyle> = {
    emergency: {
        accent: 'border-red-500',
        stripe: 'bg-red-500',
        chip: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-300',
        banner: 'bg-red-50 text-red-800',
        icon: AlertOctagon,
    },
    advisory: {
        accent: 'border-amber-500',
        stripe: 'bg-amber-500',
        chip: 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300',
        banner: 'bg-amber-50 text-amber-800',
        icon: AlertTriangle,
    },
    utility_interruption: {
        accent: 'border-blue-500',
        stripe: 'bg-blue-500',
        chip: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300',
        banner: 'bg-blue-50 text-blue-800',
        icon: Zap,
    },
    roadwork: {
        accent: 'border-orange-500',
        stripe: 'bg-orange-500',
        chip: 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-300',
        banner: 'bg-orange-50 text-orange-800',
        icon: Construction,
    },
    general: {
        accent: 'border-slate-400',
        stripe: 'bg-slate-400',
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
        <PublicLayout title={announcement.title} description="">
            <Head title={announcement.title} />

            <div className="container mx-auto max-w-3xl space-y-6 py-10">
                <Link href={`/${slug}/announcement`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Announcements
                    </Button>
                </Link>

                <article className={`overflow-hidden rounded-xl border-l-4 bg-white shadow-sm ${style.accent}`}>
                    <header className={`flex items-center gap-3 px-6 py-4 ${style.banner}`}>
                        <Icon className="h-5 w-5 shrink-0" />
                        <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.chip}`}>
                                {announcement.type.label}
                            </span>
                            {announcement.created_at && <span className="text-xs opacity-80">{announcement.created_at}</span>}
                        </div>
                    </header>

                    <div className="space-y-6 px-6 py-6">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">{announcement.title}</h1>

                        {announcement.images.length > 0 && (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {announcement.images.map((img, i) => (
                                    <a
                                        key={i}
                                        href={img.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block overflow-hidden rounded-lg border bg-slate-50"
                                    >
                                        <img src={img.url} alt={`${announcement.title} — image ${i + 1}`} className="h-48 w-full object-cover" />
                                    </a>
                                ))}
                            </div>
                        )}

                        <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{announcement.content}</div>
                    </div>
                </article>
            </div>
        </PublicLayout>
    );
}
