import { DecedentListItem } from '@/Core/Types/Cemetery/cemetery';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import { DecedentsTable } from './Components/DecedentsTable';

interface Props {
    decedents: PaginatedResponse<DecedentListItem>;
    filters?: Record<string, string>;
}

export default function ListDecedents({ decedents }: Props) {
    const rows = decedents.data;

    return (
        <AppLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full p-5">
                        {/* Stat strip */}
                        <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <StatCard label="Total Records" value={decedents.meta.total ?? rows.length} tone="indigo" />
                            <StatCard
                                label="Awaiting Plot Assignment"
                                value={rows.filter((r) => r.interment_status === 'unassigned' || r.interment_status === 'pending').length}
                                tone="amber"
                            />
                            <StatCard label="Interred" value={rows.filter((r) => r.interment_status === 'interred').length} tone="emerald" />
                        </section>

                        <DecedentsTable decedents={decedents} />
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}

interface StatCardProps {
    label: string;
    value: number | string;
    tone: 'indigo' | 'amber' | 'emerald';
}

const toneClasses: Record<StatCardProps['tone'], string> = {
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

function StatCard({ label, value, tone }: StatCardProps) {
    return (
        <div className={`rounded-lg p-4 ring-1 ring-inset ${toneClasses[tone]}`}>
            <p className="text-xs font-medium tracking-wide uppercase">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
    );
}
