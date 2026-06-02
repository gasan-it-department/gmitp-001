import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertOctagon, AlertTriangle, Calendar, ChevronRight, Construction, Megaphone, Zap } from 'lucide-react';
import announcement from '@/routes/announcement';
import { Card, CardContent } from '@/components/ui/card';

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
        meta?: { links: PaginationLink[]; last_page: number; from: number; to: number; total: number };
    };
}

type TypeStyle = {
    accent: string;
    chip: string;
    icon: React.ComponentType<{ className?: string }>;
};

const TYPE_STYLES: Record<string, TypeStyle> = {
    emergency: {
        accent: 'border-red-500',
        chip: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-300',
        icon: AlertOctagon,
    },
    advisory: {
        accent: 'border-amber-500',
        chip: 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300',
        icon: AlertTriangle,
    },
    utility_interruption: {
        accent: 'border-blue-500',
        chip: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300',
        icon: Zap,
    },
    roadwork: {
        accent: 'border-orange-500',
        chip: 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-300',
        icon: Construction,
    },
    general: {
        accent: 'border-slate-400',
        chip: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300',
        icon: Megaphone,
    },
};

const styleFor = (type: string): TypeStyle => TYPE_STYLES[type] ?? TYPE_STYLES.general;

export default function AnnouncementClientIndex({ announcements }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    const list = announcements?.data ?? [];
    const meta = announcements?.meta;

    return (
        <PublicLayout title="" description="">
            <Head title="Mga Paunawa at Anunsyo" />

            <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
                {/* Header Section */}
                <div className="mb-8 space-y-2 text-center sm:text-left">
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                        Mga Paunawa at Anunsyo
                    </h1>
                    <p className="text-sm font-medium text-slate-500">
                        Manatiling updated sa pinakabagong balita at impormasyon mula sa {currentMunicipality.name}.
                    </p>
                </div>

                {list.length === 0 ? (
                    <Card className="border-none bg-slate-50/50 shadow-none">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                                <Megaphone className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Walang anunsyo sa ngayon</h3>
                            <p className="mt-2 max-w-xs text-sm font-medium text-slate-500 leading-relaxed">
                                Abangan ang mga susunod na balita at anunsyo mula sa ating lokal na pamahalaan.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Announcements List */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {list.map((a) => {
                                const style = styleFor(a.type.value);
                                const Icon = style.icon;

                                return (
                                    <Link
                                        key={a.id}
                                        href={announcement.show.url({
                                            municipality: slug,
                                            announcement: a.id,
                                        })}
                                        className="group block"
                                    >
                                        <Card className="h-full overflow-hidden border-2 border-slate-100 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md active:scale-[0.99]">
                                            <CardContent className="p-0">
                                                {a.cover_image_url && (
                                                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                                        <img
                                                            src={a.cover_image_url}
                                                            alt={a.title}
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex flex-col gap-4 p-5">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight ${style.chip}`}
                                                        >
                                                            <Icon className="h-3 w-3" />
                                                            {a.type.label}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                            <Calendar className="h-3 w-3" />
                                                            {a.created_at}
                                                        </span>
                                                    </div>

                                                    <h2 className="line-clamp-2 text-base font-extrabold leading-tight text-slate-800 group-hover:text-primary transition-colors sm:text-lg">
                                                        {a.title}
                                                    </h2>

                                                    <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-4">
                                                        <span className="text-xs font-bold text-primary">Basahin ang detalye</span>
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
                                                        : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-primary/30 hover:text-primary'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: label }}
                                            />
                                        );
                                    })}
                                </div>
                                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Ipinapakita ang {meta.from} hanggang {meta.to} ng {meta.total} anunsyo
                                </p>
                            </div>
                        )}
                    </div>
                )}
                
                {/* LGU Motto / Brand */}
                <div className="mt-12 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                        Ligtas at Mabilis na Serbisyo • {currentMunicipality.name}
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
}

