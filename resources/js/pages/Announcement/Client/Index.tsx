import { Pagination } from '@/components/Shared/Pagination';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertOctagon, AlertTriangle, Construction, Megaphone, Zap } from 'lucide-react';

type EnumOption = { value: string; label: string };

type PaginationLink = { url: string | null; label: string; active: boolean };

interface AnnouncementCard {
    id: string;
    title: string;
    type: EnumOption;
    is_published: boolean;
    created_at: string | null;
    cover_image_url: string | null;
}

interface Props {
    announcements: {
        data: AnnouncementCard[];
        links?: PaginationLink[];
        meta?: { links: PaginationLink[] };
    };
}

type TypeStyle = {
    accent: string;
    stripe: string;
    chip: string;
    icon: React.ComponentType<{ className?: string }>;
};

const TYPE_STYLES: Record<string, TypeStyle> = {
    emergency: {
        accent: 'border-red-500',
        stripe: 'bg-red-500',
        chip: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-300',
        icon: AlertOctagon,
    },
    advisory: {
        accent: 'border-amber-500',
        stripe: 'bg-amber-500',
        chip: 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300',
        icon: AlertTriangle,
    },
    utility_interruption: {
        accent: 'border-blue-500',
        stripe: 'bg-blue-500',
        chip: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300',
        icon: Zap,
    },
    roadwork: {
        accent: 'border-orange-500',
        stripe: 'bg-orange-500',
        chip: 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-300',
        icon: Construction,
    },
    general: {
        accent: 'border-slate-400',
        stripe: 'bg-slate-400',
        chip: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300',
        icon: Megaphone,
    },
};

const styleFor = (type: string): TypeStyle => TYPE_STYLES[type] ?? TYPE_STYLES.general;

export default function AnnouncementClientIndex({ announcements }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    const list = announcements?.data ?? [];
    const paginationLinks = announcements?.links ?? announcements?.meta?.links ?? [];

    return (
        <PublicLayout title="Announcements" description="">
            <Head title="Announcements" />

            <div className="container mx-auto max-w-5xl space-y-8 py-10">
                <header className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Municipal Announcements</h1>
                    <p className="text-sm text-muted-foreground">
                        Latest bulletins from {currentMunicipality.name}. Check back regularly for emergencies, advisories, and service notices.
                    </p>
                </header>

                {list.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 px-6 py-16 text-center">
                        <Megaphone className="mb-3 h-10 w-10 text-muted-foreground" />
                        <p className="text-base font-semibold">No announcements right now.</p>
                        <p className="mt-1 text-sm text-muted-foreground">When the LGU posts something, it will show up here.</p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2">
                        {list.map((a) => {
                            const style = styleFor(a.type.value);
                            const Icon = style.icon;

                            return (
                                <Link
                                    key={a.id}
                                    href={`/${slug}/announcement/${a.id}`}
                                    className={`group flex overflow-hidden rounded-xl border-l-4 bg-white shadow-sm transition-shadow hover:shadow-md ${style.accent}`}
                                >
                                    <div className="flex flex-1 flex-col">
                                        {a.cover_image_url && (
                                            <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                                <img
                                                    src={a.cover_image_url}
                                                    alt={a.title}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                                <span className={`absolute left-0 top-0 h-full w-1.5 ${style.stripe}`} />
                                            </div>
                                        )}

                                        <div className="flex flex-1 flex-col gap-3 p-4">
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.chip}`}
                                                >
                                                    <Icon className="h-3 w-3" />
                                                    {a.type.label}
                                                </span>
                                                {a.created_at && <span className="text-xs text-muted-foreground">{a.created_at}</span>}
                                            </div>

                                            <h2 className="text-base font-semibold leading-snug text-slate-800 group-hover:text-slate-900">
                                                {a.title}
                                            </h2>

                                            <span className="mt-auto text-xs font-medium text-slate-500 group-hover:text-slate-700">
                                                Read more →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                <Pagination links={paginationLinks} />
            </div>
        </PublicLayout>
    );
}
