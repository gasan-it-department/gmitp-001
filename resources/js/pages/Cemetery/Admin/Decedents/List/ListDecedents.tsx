import { Pagination } from '@/components/Shared/Pagination';
import { DecedentListItem } from '@/Core/Types/Cemetery/cemetery';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Link, usePage } from '@inertiajs/react';
import { Plus, Users } from 'lucide-react';
import { DecedentsTable } from './Components/DecedentsTable';

interface Props {
    decedents: PaginatedResponse<DecedentListItem>;
    filters?: Record<string, string>;
}

export default function ListDecedents({ decedents }: Props) {
    const rows = decedents.data;
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    return (
        <AppLayout>
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                {/* Page header */}
                <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                            <Users size={20} />
                        </span>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900">Decedents Registry</h1>
                            <p className="text-sm text-slate-500">
                                Registered deceased individuals under the {currentMunicipality?.name ?? 'municipality'} cemetery system.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={cemetery.admin.decedents.create.page.url(currentMunicipality.slug)}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                    >
                        <Plus size={16} />
                        Register Decedent
                    </Link>
                </header>

                {/* Stat strip */}
                <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <StatCard label="Total Records" value={decedents.meta.total ?? rows.length} tone="indigo" />
                    <StatCard
                        label="Awaiting Plot Assignment"
                        value={rows.filter((r) => r.interment_status === 'unassigned' || r.interment_status === 'pending').length}
                        tone="amber"
                    />
                    <StatCard label="Interred" value={rows.filter((r) => r.interment_status === 'interred').length} tone="emerald" />
                </section>

                <DecedentsTable decedents={rows} municipalitySlug={currentMunicipality.slug} />

                <div className="pt-2">
                    <Pagination links={decedents.meta.links} />
                </div>
            </div>
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
