import { CemeterySiteListItem, PlotProfile as PlotProfileType, PlotTypeValue, SelectOption } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { EditPlotDetailsDialog } from '../Dialogs/EditPlotDetailsDialog';
import { Detail } from '../Helpers';

export function DetailsCard({
    plot,
    municipality,
    site,
    typeOptions,
    canEditDetails,
}: {
    plot: PlotProfileType;
    municipality: MunicipalityType;
    site: CemeterySiteListItem;
    typeOptions: SelectOption<PlotTypeValue>[];
    canEditDetails: boolean;
}) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Plot Details</h2>
                {canEditDetails && <EditPlotDetailsDialog municipality={municipality} site={site} plot={plot} typeOptions={typeOptions} />}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <Detail label="Section" value={plot.block?.section?.name} />
                <Detail label="Block" value={plot.block?.name} />
                <Detail label="Parent Container" value={plot.parent?.slot_label} />
                <Detail label="Raw Name" value={plot.name} />
                <Detail label="Floor / Level" value={plot.level ? `F${plot.level}` : null} />
                <Detail label="Row" value={plot.row} />
                <Detail label="Position" value={plot.position} />
                <Detail label="Available Capacity" value={plot.occupancy_mode === 'shared' ? String(plot.available_capacity) : null} />
            </div>
        </section>
    );
}
