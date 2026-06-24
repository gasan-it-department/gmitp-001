import { Button } from '@/components/ui/button';
import { CemeterySiteListItem } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Building2, MapPin, Plus } from 'lucide-react';

interface Props {
    municipality: MunicipalityType;
    sites: CemeterySiteListItem[];
}

const STATUS_CLASSES: Record<CemeterySiteListItem['status'], string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    inactive: 'bg-amber-50 text-amber-700 ring-amber-200',
    closed: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export default function ListCemeterySites({ municipality, sites }: Props) {
    return (
        <AppLayout>
            <Head title="Cemetery Sites" />

            <div className="mx-auto max-w-7xl space-y-6 p-6">
                <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                            <Building2 size={22} />
                        </span>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Cemetery Sites</h1>
                            <p className="mt-1 text-sm text-slate-500">Select a physical cemetery managed by {municipality.name}.</p>
                        </div>
                    </div>

                    <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
                        <Link href={cemetery.admin.sites.create.page.url(municipality.slug)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Site
                        </Link>
                    </Button>
                </header>

                {sites.length === 0 ? (
                    <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <Building2 className="mx-auto h-10 w-10 text-slate-400" />
                        <h2 className="mt-4 text-lg font-semibold text-slate-900">No cemetery sites yet</h2>
                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                            Create the first physical cemetery before configuring its Sections, Blocks, and Plots.
                        </p>
                        <Button asChild className="mt-6 bg-emerald-700 hover:bg-emerald-800">
                            <Link href={cemetery.admin.sites.create.page.url(municipality.slug)}>Create Cemetery Site</Link>
                        </Button>
                    </section>
                ) : (
                    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {sites.map((site) => (
                            <article
                                key={site.id}
                                className="flex min-h-72 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
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

                                <div className="mt-5 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                    {site.sections_count} {site.sections_count === 1 ? 'Section' : 'Sections'} configured
                                </div>

                                {site.notes && <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">{site.notes}</p>}

                                <div className="mt-auto pt-6">
                                    <Button asChild variant="outline" className="w-full justify-between">
                                        <Link
                                            href={cemetery.admin.sites.workspace.page.url({
                                                municipality: municipality.slug,
                                                cemetery_site_id: site.id,
                                            })}
                                        >
                                            Manage Site
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </div>
        </AppLayout>
    );
}

function formatAddress(site: CemeterySiteListItem): string {
    const parts = [site.street_name, site.barangay_name].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'No address recorded';
}
