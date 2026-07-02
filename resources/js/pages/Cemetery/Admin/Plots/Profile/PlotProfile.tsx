import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CemeterySiteListItem, PlotOccupancyModeValue, PlotProfile as PlotProfileType, PlotStatusOption, PlotTypeValue, SelectOption } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { cn } from '@/lib/utils';
import cemetery from '@/routes/cemetery';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MapPin, Settings2 } from 'lucide-react';
import { ActiveLeaseCard } from './Components/Cards/ActiveLeaseCard';
import { ActivityCard } from './Components/Cards/ActivityCard';
import { ChildNichesCard } from './Components/Cards/ChildNichesCard';
import { CurrentIntermentsCard } from './Components/Cards/CurrentIntermentsCard';
import { DetailsCard } from './Components/Cards/DetailsCard';
import { IntermentHistoryCard } from './Components/Cards/IntermentHistoryCard';
import { ChangeOccupancyDialog } from './Components/Dialogs/ChangeOccupancyDialog';
import { ChangeStatusDialog } from './Components/Dialogs/ChangeStatusDialog';
import { DeletePlotDialog } from './Components/Dialogs/DeletePlotDialog';
import { Pill, Stat, toneClasses } from './Components/Helpers';

interface Props {
    municipality: MunicipalityType;
    site: CemeterySiteListItem;
    plot: PlotProfileType;
    type_options: SelectOption<PlotTypeValue>[];
    status_options: PlotStatusOption[];
    occupancy_mode_options: SelectOption<Extract<PlotOccupancyModeValue, 'single' | 'shared'>>[];
}

export default function PlotProfile({ municipality, site, plot, type_options, status_options, occupancy_mode_options }: Props) {
    const canEditDetails = plot.type !== 'apartment_niche' && plot.parent_plot_id === null && plot.occupancy_mode !== 'slotted';
    const canEditOccupancy = plot.occupancy_mode === 'single' || plot.occupancy_mode === 'shared';
    const canEditStatus = canEditOccupancy && plot.active_interments_count === 0;
    const canManageLease = plot.occupancy_mode !== 'slotted';
    const canDelete = plot.can_delete;

    const showManageDropdown = canEditOccupancy || canEditStatus || canDelete;

    return (
        <AppLayout>
            <Head title={plot.slot_label} />

            <div className="mx-auto max-w-7xl space-y-6 p-6">
                <Link
                    href={`${cemetery.admin.sites.workspace.page.url({
                        municipality: municipality.slug,
                        cemetery_site_id: site.id,
                    })}?tab=plots`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                    <ArrowLeft size={16} />
                    Back to plot inventory
                </Link>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-5 bg-slate-900 p-6 text-white lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-200">
                                <MapPin size={28} />
                            </div>
                            <div>
                                <div className="mb-2 flex flex-wrap gap-2">
                                    <Pill>{plot.type_label ?? 'Unclassified'}</Pill>
                                    <Pill>{plot.occupancy_mode_label ?? 'No occupancy mode'}</Pill>
                                    {plot.status_label && (
                                        <span
                                            className={cn(
                                                'rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
                                                toneClasses[plot.status_tone ?? 'slate'],
                                            )}
                                        >
                                            {plot.status_label}
                                        </span>
                                    )}
                                </div>
                                <h1 className="font-mono text-3xl font-bold tracking-tight">{plot.slot_label}</h1>
                                <p className="mt-2 text-sm text-slate-300">
                                    {site.name} / {plot.block?.section?.name ?? 'No section'} / {plot.block?.name ?? 'No block'}
                                </p>
                            </div>
                        </div>

                        {showManageDropdown && (
                            <div className="flex flex-wrap gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700 hover:text-white">
                                            <Settings2 size={16} className="mr-2" />
                                            Manage Plot
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="w-56 p-2 space-y-1">
                                        <p className="px-2 py-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">Actions</p>
                                        {canEditOccupancy && (
                                            <ChangeOccupancyDialog
                                                municipality={municipality}
                                                site={site}
                                                plot={plot}
                                                occupancyModeOptions={occupancy_mode_options}
                                            />
                                        )}
                                        {canEditStatus && (
                                            <ChangeStatusDialog municipality={municipality} site={site} plot={plot} statusOptions={status_options} />
                                        )}
                                        {canDelete && <DeletePlotDialog municipality={municipality} site={site} plot={plot} />}
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-px bg-slate-100 sm:grid-cols-4">
                        <Stat label="Occupancy" value={plot.occupancy_label} />
                        <Stat label="Capacity" value={String(plot.capacity)} />
                        <Stat label="Can Still Accept" value={plot.occupancy_mode === 'shared' ? String(plot.available_capacity) : '-'} />
                        <Stat label="Profile Type" value={plot.occupancy_mode === 'slotted' ? 'Apartment container' : 'Assignable plot'} />
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <ActiveLeaseCard plot={plot} municipality={municipality} site={site} canManageLease={canManageLease} />
                        <DetailsCard plot={plot} municipality={municipality} site={site} typeOptions={type_options} canEditDetails={canEditDetails} />
                        {plot.occupancy_mode === 'slotted' ? (
                            <ChildNichesCard plot={plot} municipality={municipality} site={site} />
                        ) : (
                            <>
                                <CurrentIntermentsCard plot={plot} municipality={municipality} />
                                <IntermentHistoryCard plot={plot} />
                            </>
                        )}
                    </div>
                    <ActivityCard plot={plot} />
                </div>
            </div>
        </AppLayout>
    );
}
