import { CemeterySiteListItem, PlotProfile as PlotProfileType } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Boxes } from 'lucide-react';
import { AddNicheSlotsDialog } from '../Dialogs/AddNicheSlotsDialog';
import { EmptyState, toneClasses } from '../Helpers';

export function ChildNichesCard({ plot, municipality, site }: { plot: PlotProfileType; municipality: MunicipalityType; site: CemeterySiteListItem }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Child Niches</h2>
                    <p className="text-sm text-slate-500">This row is an apartment container. Interments must target one of its niche rows.</p>
                </div>
                <AddNicheSlotsDialog plot={plot} municipality={municipality} site={site} />
            </div>
            {plot.child_niches.length === 0 ? (
                <EmptyState icon={<Boxes size={20} />} text="No child niches are registered under this container." />
            ) : (
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {plot.child_niches.map((niche) => (
                        <Link
                            key={niche.id}
                            href={niche.profile_url}
                            className="rounded-lg border border-slate-200 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/40"
                        >
                            <div className="font-mono text-sm font-semibold text-slate-900">{niche.slot_label}</div>
                            <div className="mt-1 flex items-center justify-between text-xs">
                                <span
                                    className={cn(
                                        'rounded-full px-2 py-0.5 font-medium ring-1 ring-inset',
                                        toneClasses[niche.status_tone ?? 'slate'],
                                    )}
                                >
                                    {niche.status_label ?? '-'}
                                </span>
                                <span className="text-slate-500">{niche.occupancy_label}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
