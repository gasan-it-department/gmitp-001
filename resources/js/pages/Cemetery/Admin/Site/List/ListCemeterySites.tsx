import { Button } from '@/components/ui/button';
import { CemeterySiteListItem } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Head, Link } from '@inertiajs/react';
import { Building2, Plus } from 'lucide-react';
import { SiteCard } from './Components/SiteCard';

interface Props {
    municipality: MunicipalityType;
    sites: CemeterySiteListItem[];
}

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
                            <p className="mt-1 text-sm text-slate-500">
                                Physical cemeteries managed by {municipality.name}.
                            </p>
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
                            <SiteCard key={site.id} site={site} municipalitySlug={municipality.slug} />
                        ))}
                    </section>
                )}
            </div>
        </AppLayout>
    );
}
