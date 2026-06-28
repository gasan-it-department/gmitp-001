import { PlotInventoryCounts } from '@/Core/Types/Cemetery/cemetery';

interface Props {
    sectionsCount: number;
    inventoryCounts: PlotInventoryCounts;
}

type StatTone = 'emerald' | 'rose' | 'amber' | 'indigo' | 'slate';

const STAT_CLASSES: Record<StatTone, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    slate: 'bg-slate-50 text-slate-700 ring-slate-200',
};

export function InventoryStats({ sectionsCount, inventoryCounts }: Props) {
    return (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <Stat label="Sections" value={sectionsCount} tone="slate" />
            <Stat label="Total Slots" value={inventoryCounts.total} tone="slate" />
            <Stat label="Available" value={inventoryCounts.available} tone="emerald" />
            <Stat label="Occupied" value={inventoryCounts.occupied} tone="rose" />
            <Stat label="Reserved" value={inventoryCounts.reserved} tone="indigo" />
            <Stat label="Maintenance" value={inventoryCounts.maintenance} tone="amber" />
        </section>
    );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: StatTone }) {
    return (
        <div className={`rounded-xl p-4 ring-1 ring-inset transition-shadow hover:shadow-sm ${STAT_CLASSES[tone]}`}>
            <p className="text-xs font-medium tracking-wide uppercase">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
        </div>
    );
}
