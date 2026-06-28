import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    CemeterySectionListItem,
    CemeterySiteListItem,
    IntermentListItem,
    PlotInventoryCounts,
    PlotListFilters,
    PlotListItem,
    PlotStatusOption,
    PlotTypeValue,
    SelectOption,
} from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { IntermentsTable } from './Components/IntermentsTable';
import { InventoryStats } from './Components/InventoryStats';
import { LayoutManager } from './Components/LayoutManager';
import { PlotInventoryTable } from './Components/PlotInventoryTable';
import { SiteHeader } from './Components/SiteHeader';

interface Props {
    municipality: MunicipalityType;
    site: CemeterySiteListItem;
    layout: CemeterySectionListItem[];
    interments: IntermentListItem[];
    plots: PaginatedResponse<PlotListItem>;
    filters: PlotListFilters;
    status_options: PlotStatusOption[];
    type_options: SelectOption<PlotTypeValue>[];
    inventory_counts: PlotInventoryCounts;
}

export default function CemeterySiteWorkspace({
    municipality,
    site,
    layout,
    interments,
    plots,
    filters,
    status_options,
    type_options,
    inventory_counts,
}: Props) {
    const initialTab = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;
    const [tab, setTab] = useState(initialTab ?? 'layout');

    return (
        <AppLayout>
            <Head title={site.name} />

            <div className="m-6 space-y-6">
                <Link
                    href={cemetery.admin.sites.list.page.url(municipality.slug)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                    <ArrowLeft size={16} />
                    Back to cemetery sites
                </Link>

                <SiteHeader site={site} municipalitySlug={municipality.slug} />

                <Tabs value={tab} onValueChange={setTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4 sm:w-fit">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="layout">Layout</TabsTrigger>
                        <TabsTrigger value="plots">Plots</TabsTrigger>
                        <TabsTrigger value="interments">Interments</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <InventoryStats sectionsCount={site.sections_count} inventoryCounts={inventory_counts} />
                        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
                            This overview summarizes the physical cemetery inventory. Use the Layout tab to configure Sections, Blocks, and bulk Plot
                            creation.
                        </div>
                    </TabsContent>

                    <TabsContent value="layout">
                        <LayoutManager
                            site={site}
                            layout={layout}
                            municipalitySlug={municipality.slug}
                            typeOptions={type_options}
                            onViewPlots={() => setTab('plots')}
                        />
                    </TabsContent>

                    <TabsContent value="plots" className="space-y-4">
                        <InventoryStats sectionsCount={site.sections_count} inventoryCounts={inventory_counts} />
                        <PlotInventoryTable
                            plots={plots}
                            filters={filters}
                            statusOptions={status_options}
                            typeOptions={type_options}
                            layout={layout}
                            municipalitySlug={municipality.slug}
                            siteId={site.id}
                        />
                    </TabsContent>

                    <TabsContent value="interments">
                        <IntermentsTable
                            interments={interments}
                            municipalitySlug={municipality.slug}
                            siteId={site.id}
                            siteActive={site.status === 'active'}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
