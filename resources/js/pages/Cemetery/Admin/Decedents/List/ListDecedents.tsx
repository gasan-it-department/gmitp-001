import { Button } from '@/components/ui/button';
import { DecedentListItem } from '@/Core/Types/Cemetery/cemetery';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
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
            <Head title="Decedents Registry" />

            <div className="m-6 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Decedents Registry</h1>
                        <p className="text-sm text-muted-foreground">Manage and track decedent records and interments.</p>
                    </div>

                    <Link href={cemetery.admin.decedents.create.page.url({ municipality: currentMunicipality.slug })}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Decedent
                        </Button>
                    </Link>
                </div>

                {/* Stat strip */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard label="Total Records" value={decedents.meta.total ?? rows.length} tone="indigo" />
                    <StatCard
                        label="Awaiting Plot Assignment"
                        value={rows.filter((r) => r.interment_status === 'unassigned' || r.interment_status === 'pending').length}
                        tone="amber"
                    />
                    <StatCard label="Interred" value={rows.filter((r) => r.interment_status === 'interred').length} tone="emerald" />
                </section>

                <div className="rounded-lg border bg-white">
                    <DecedentsTable decedents={decedents} />
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
