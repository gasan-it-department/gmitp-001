import { Button } from '@/components/ui/button';
import { CemeterySiteListItem } from '@/Core/Types/Cemetery/cemetery';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Building2, MapPin, UserCheck } from 'lucide-react';

interface DecedentSummary {
    id: string;
    display_name: string;
    record_type: string | null;
    identity_status: string | null;
    date_of_death: string | null;
}

interface Props {
    decedent: DecedentSummary;
    sites: CemeterySiteListItem[];
}

export default function AssignDecedent({ decedent, sites }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    return (
        <AppLayout>
            <div className="m-6 max-w-5xl space-y-6">
                <Link
                    href={cemetery.admin.decedents.profile.page.url([currentMunicipality.slug, decedent.id])}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={16} />
                    Back to profile
                </Link>

                <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <span className="rounded-xl bg-indigo-50 p-3 text-indigo-700">
                            <UserCheck className="h-5 w-5" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">Choose Cemetery Site</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Select where {decedent.display_name} will be interred. The next screen will show only available plots from that Site.
                            </p>
                        </div>
                    </div>
                </header>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Ready Decedent</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{decedent.display_name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                        {decedent.record_type?.replace('_', ' ').toUpperCase() ?? 'DEATH'} / {decedent.identity_status?.toUpperCase() ?? 'IDENTIFIED'}{' '}
                        / Died {decedent.date_of_death ?? '-'}
                    </p>
                </section>

                {sites.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                        No active cemetery Sites are available. Create or reactivate a Site before assigning this decedent to a plot.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {sites.map((site) => (
                            <section
                                key={site.id}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="rounded-lg bg-slate-100 p-2 text-slate-600">
                                        <Building2 className="h-4 w-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="font-semibold text-slate-900">{site.name}</h2>
                                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {[site.street_name, site.barangay_name].filter(Boolean).join(', ') || 'No address recorded'}
                                        </p>
                                        <p className="mt-2 text-xs text-slate-400">
                                            {site.sections_count} {site.sections_count === 1 ? 'Section' : 'Sections'} configured
                                        </p>
                                    </div>
                                </div>
                                <Button asChild className="mt-4 w-full bg-indigo-700 hover:bg-indigo-800">
                                    <Link
                                        href={`/${currentMunicipality.slug}/cemetery/admin/sites/${site.id}/interments/create?decedent_id=${decedent.id}`}
                                    >
                                        Continue to Interment
                                    </Link>
                                </Button>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
