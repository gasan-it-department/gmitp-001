import { Button } from '@/components/ui/button';
import { CemeterySiteListItem } from '@/Core/Types/Cemetery/cemetery';
import cemetery from '@/routes/cemetery';
import { Link } from '@inertiajs/react';
import { Building2, MapPin, Plus } from 'lucide-react';

interface Props {
    site: CemeterySiteListItem;
    municipalitySlug: string;
}

const STATUS_CLASSES: Record<CemeterySiteListItem['status'], string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    inactive: 'bg-amber-50 text-amber-700 ring-amber-200',
    closed: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export function SiteHeader({ site, municipalitySlug }: Props) {
    const active = site.status === 'active';

    return (
        <>
            <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600" />

                <div className="p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                            <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                                <Building2 size={24} />
                            </span>
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{site.name}</h1>
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_CLASSES[site.status]}`}
                                    >
                                        {site.status_label}
                                    </span>
                                </div>
                                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                    <MapPin className="h-4 w-4" />
                                    {formatAddress(site)}
                                </p>
                                {site.notes && (
                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{site.notes}</p>
                                )}
                            </div>
                        </div>

                        {active && (
                            <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
                                <Link
                                    href={cemetery.admin.sites.plots.create.page.url({
                                        municipality: municipalitySlug,
                                        cemetery_site_id: site.id,
                                    })}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Register Plot
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {!active && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    This Site is <span className="font-semibold">{site.status}</span>. Historical inventory remains visible, but new
                    Plots cannot be registered.
                </div>
            )}
        </>
    );
}

function formatAddress(site: CemeterySiteListItem): string {
    const parts = [site.street_name, site.barangay_name].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'No address recorded';
}
