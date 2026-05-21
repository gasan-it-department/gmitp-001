import { Button } from '@/components/ui/button';
import { DecedentProfile as DecedentProfileType } from '@/Core/Types/Cemetery/cemetery';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, MapPin, ShieldAlert, Sparkles } from 'lucide-react';

interface Props {
    decedent: { data: DecedentProfileType };
}

const DECEDENT_TYPE_BADGE: Record<string, string> = {
    standard: 'bg-slate-100 text-slate-700',
    child: 'bg-pink-100 text-pink-700',
    fetal: 'bg-purple-100 text-purple-700',
    unknown: 'bg-amber-100 text-amber-800',
};

export default function DecedentProfile({ decedent }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const record = decedent.data;

    const isUnknown = record.decedent_type === 'unknown';
    const displayName = isUnknown
        ? `UNKNOWN — ${record.reference_document_number ?? 'No reference'}`
        : record.memorial_name
          ? record.memorial_name
          : [record.last_name, record.first_name].filter(Boolean).join(', ');

    return (
        <AppLayout>
            <div className="mx-auto max-w-5xl space-y-6 p-6">
                {/* Top bar */}
                <div className="flex items-center justify-between">
                    <Link
                        href={cemetery.admin.decedents.list.page.url(currentMunicipality.slug)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft size={16} />
                        Back to registry
                    </Link>
                    {!record.interment && (
                        <Link href={cemetery.admin.interments.assign.page.url([currentMunicipality.slug, record.id])}>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                <MapPin size={16} className="mr-2" />
                                Assign to plot
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Identity card */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        DECEDENT_TYPE_BADGE[record.decedent_type ?? 'standard']
                                    }`}
                                >
                                    {(record.decedent_type ?? 'standard').toUpperCase()}
                                </span>
                                <h1 className="mt-2 text-2xl font-semibold tracking-tight">{displayName || '—'}</h1>
                                <p className="mt-1 text-sm text-slate-300">
                                    {record.date_of_birth ?? '—'} &nbsp;→&nbsp; {record.date_of_death ?? '—'}
                                    {record.age_at_death !== null && <span className="ml-2">· Age {record.age_at_death}</span>}
                                </p>
                            </div>
                            <div className="text-right text-xs text-slate-300">
                                <p>Record ID</p>
                                <p className="font-mono text-sm text-white">{record.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status row */}
                    <div className="grid grid-cols-1 divide-slate-200 border-t border-slate-200 sm:grid-cols-3 sm:divide-x">
                        <Field label="Registered On" value={record.date_of_registration} />
                        <Field label="Gender" value={record.gender} />
                        <Field label="Death Certificate" value={record.death_certificate_no || 'Not provided'} mono />
                    </div>
                </section>

                {isUnknown && (
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <ShieldAlert className="mt-0.5 text-amber-600" size={18} />
                        <div className="text-sm text-amber-900">
                            <p className="font-semibold">Unidentified decedent</p>
                            <p>
                                Authorized by <span className="font-medium">{record.reference_document_type ?? '—'}</span> ·{' '}
                                {record.reference_document_number ?? '—'}
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Interment card */}
                    <Card title="Plot & Interment" icon={<MapPin size={16} />}>
                        {record.interment ? (
                            <dl className="space-y-3 text-sm">
                                <Row label="Plot Number" value={record.interment.plot?.plot_number ?? '—'} />
                                <Row label="Plot Name" value={record.interment.plot?.name ?? '—'} />
                                <Row label="Section" value={record.interment.plot?.section?.name ?? '—'} />
                                <Row label="Type" value={record.interment.plot?.type ?? '—'} />
                                <Row label="Interment Date" value={record.interment.interment_date ?? '—'} />
                                <Row label="Status" value={record.interment.status} />
                            </dl>
                        ) : (
                            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                                <p className="font-medium text-slate-800">No plot assigned yet.</p>
                                <p className="mt-1 text-xs">Use the "Assign to plot" button to link this decedent to an available plot.</p>
                            </div>
                        )}
                    </Card>

                    {/* Mortality */}
                    <Card title="Mortality Record" icon={<Sparkles size={16} />}>
                        <dl className="space-y-3 text-sm">
                            <Row label="Date of Death" value={record.date_of_death} />
                            <Row label="Place of Death" value={record.place_of_death} />
                            <Row label="Cause of Death" value={record.cause_of_death} />
                        </dl>
                    </Card>
                </div>

                {record.notes && (
                    <Card title="Administrative Notes" icon={<FileText size={16} />}>
                        <p className="text-sm whitespace-pre-line text-slate-700">{record.notes}</p>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

interface FieldProps {
    label: string;
    value?: string | null;
    mono?: boolean;
}

function Field({ label, value, mono }: FieldProps) {
    return (
        <div className="p-4">
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</p>
            <p className={`mt-1 text-sm text-slate-900 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
        </div>
    );
}

interface CardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

function Card({ title, icon, children }: CardProps) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <header className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="text-slate-500">{icon}</span>
                <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
            </header>
            {children}
        </section>
    );
}

function Row({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <dt className="text-xs font-medium text-slate-500 uppercase">{label}</dt>
            <dd className="text-right text-sm text-slate-800">{value || '—'}</dd>
        </div>
    );
}
