import { Button } from '@/components/ui/button';
import { CemeterySiteListItem } from '@/Core/Types/Cemetery/cemetery';
import cemetery from '@/routes/cemetery';
import { Link } from '@inertiajs/react';
import { ArrowRight, Building2, MapPin } from 'lucide-react';

interface Props {
    site: CemeterySiteListItem;
    municipalitySlug: string;
}

const STATUS_CLASSES: Record<CemeterySiteListItem['status'], string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    inactive: 'bg-amber-50 text-amber-700 ring-amber-200',
    closed: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export function SiteCard({ site, municipalitySlug }: Props) {
    return (
        <article className="group flex min-h-72 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
            <div className="h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

            <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                    <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700 transition-colors group-hover:bg-emerald-100">
                        <Building2 size={20} />
                    </span>
                    <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_CLASSES[site.status]}`}
                    >
                        {site.status_label}
                    </span>
                </div>

                <h2 className="mt-5 text-lg font-semibold text-slate-900">{site.name}</h2>
                <div className="mt-2 flex items-start gap-2 text-sm text-slate-500">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{formatAddress(site)}</span>
                </div>

                <div className="mt-5 rounded-lg bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600">
                    {site.sections_count} {site.sections_count === 1 ? 'Section' : 'Sections'} configured
                </div>

                {site.notes && <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">{site.notes}</p>}

                <div className="mt-auto pt-6">
                    <Button
                        asChild
                        variant="outline"
                        className="w-full justify-between transition-colors group-hover:border-emerald-200 group-hover:text-emerald-700"
                    >
                        <Link
                            href={cemetery.admin.sites.workspace.page.url({
                                municipality: municipalitySlug,
                                cemetery_site_id: site.id,
                            })}
                        >
                            Manage Site
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}

function formatAddress(site: CemeterySiteListItem): string {
    const parts = [site.street_name, site.barangay_name].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'No address recorded';
}
