import { Button } from '@/components/ui/button';
import { DecedentProfile as DecedentProfileType } from '@/Core/Types/Cemetery/cemetery';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, MapPin, ShieldAlert, Sparkles, User, UserCircle } from 'lucide-react';

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
            <div className="mx-auto max-w-6xl space-y-8 p-6">
                {/* Top Navigation & Actions */}
                <div className="flex items-center justify-between">
                    <Link
                        href={cemetery.admin.decedents.list.page.url(currentMunicipality.slug)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                    >
                        <ArrowLeft size={16} />
                        Back to registry
                    </Link>
                    <div className="flex gap-3">
                        <Link href={cemetery.admin.decedents.edit.page.url([currentMunicipality.slug, record.id])}>
                            <Button variant="outline" size="sm">
                                Edit Record
                            </Button>
                        </Link>
                        {!record.interment && (
                            <Link href={cemetery.admin.interments.assign.page.url([currentMunicipality.slug, record.id])}>
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                    <MapPin size={16} className="mr-2" />
                                    Assign to plot
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Identity Header Card */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="bg-slate-900 p-8 text-white">
                        <div className="flex flex-col gap-8 md:flex-row md:items-center">
                            {/* Avatar Section */}
                            <div className="relative shrink-0">
                                {record.avatar_url ? (
                                    <img
                                        src={record.avatar_url}
                                        alt={displayName}
                                        className="h-32 w-32 rounded-2xl border-4 border-white/10 object-cover shadow-2xl"
                                    />
                                ) : (
                                    <div className="flex h-32 w-32 items-center justify-center rounded-2xl border-4 border-white/10 bg-slate-800 shadow-2xl">
                                        <User className="h-16 w-16 text-slate-600" />
                                    </div>
                                )}
                                <span
                                    className={`absolute -top-3 -right-3 inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-wider shadow-lg ${
                                        DECEDENT_TYPE_BADGE[record.decedent_type ?? 'standard']
                                    }`}
                                >
                                    {(record.decedent_type ?? 'standard').toUpperCase()}
                                </span>
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 space-y-3">
                                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{displayName || '—'}</h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
                                    <p className="flex items-center gap-1.5">
                                        <Sparkles size={14} className="text-amber-400" />
                                        {record.date_of_birth ?? 'Unknown DOB'} &nbsp;→&nbsp; {record.date_of_death ?? '—'}
                                    </p>
                                    {record.age_at_death !== null && (
                                        <>
                                            <span className="text-slate-700">•</span>
                                            <p className="font-medium text-slate-200">{record.age_at_death} Years Old</p>
                                        </>
                                    )}
                                    <span className="text-slate-700">•</span>
                                    <p className="flex items-center gap-1.5 capitalize">
                                        <UserCircle size={14} />
                                        {record.gender?.toLowerCase() || 'Unspecified'}
                                    </p>
                                </div>
                            </div>

                            {/* ID Badge */}
                            <div className="hidden text-right md:block">
                                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">System Record ID</p>
                                <p className="mt-1 font-mono text-sm font-medium text-slate-300">{record.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 divide-slate-100 border-t border-slate-100 sm:grid-cols-4 sm:divide-x">
                        <Field label="Registered On" value={record.date_of_registration} />
                        <Field label="Death Cert No." value={record.death_certificate_no} mono />
                        <Field label="Interment Status" value={record.interment?.status ?? 'Unassigned'} />
                        <Field label="Current Plot" value={record.interment?.plot?.plot_number ?? '—'} />
                    </div>
                </section>

                {isUnknown && (
                    <div className="flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                        <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                            <ShieldAlert size={20} />
                        </div>
                        <div className="text-sm">
                            <p className="font-bold text-amber-900">Unidentified Body Protocol</p>
                            <p className="mt-0.5 text-amber-800">
                                Authorization: <span className="font-semibold">{record.reference_document_type ?? '—'}</span>
                                <span className="mx-2 opacity-30">|</span>
                                Case #: <span className="font-mono font-medium">{record.reference_document_number ?? '—'}</span>
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="space-y-8 lg:col-span-2">
                        {/* Interment Information */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <header className="mb-6 flex items-center gap-3 border-b border-slate-50 pb-4">
                                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                                    <MapPin size={20} />
                                </div>
                                <h2 className="font-bold text-slate-800">Plot & Interment Details</h2>
                            </header>

                            {record.interment ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="space-y-4">
                                        <DetailItem label="Plot Number" value={record.interment.plot?.plot_number} />
                                        <DetailItem label="Location / Name" value={record.interment.plot?.name} />
                                        <DetailItem label="Cemetery Section" value={record.interment.plot?.section?.name} />
                                    </div>
                                    <div className="space-y-4">
                                        <DetailItem label="Interment Date" value={record.interment.interment_date} />
                                        <DetailItem label="Plot Type" value={record.interment.plot?.type} className="capitalize" />
                                        <DetailItem label="Interment Status" value={record.interment.status} className="capitalize" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-10 text-center">
                                    <MapPin className="mb-3 text-slate-300" size={40} />
                                    <p className="font-semibold text-slate-800">No Plot Assigned</p>
                                    <p className="mt-1 max-w-[280px] text-xs text-slate-500">
                                        This decedent has not been linked to a specific cemetery plot yet.
                                    </p>
                                    <Link href={cemetery.admin.interments.assign.page.url([currentMunicipality.slug, record.id])} className="mt-4">
                                        <Button variant="outline" size="sm" className="h-8">
                                            Assign Now
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </section>

                        {/* Mortality Record */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <header className="mb-6 flex items-center gap-3 border-b border-slate-50 pb-4">
                                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                                    <Sparkles size={20} />
                                </div>
                                <h2 className="font-bold text-slate-800">Mortality & Legal Record</h2>
                            </header>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-4">
                                    <DetailItem label="Date of Death" value={record.date_of_death} />
                                    <DetailItem label="Place of Death" value={record.place_of_death} />
                                </div>
                                <div className="space-y-4">
                                    <DetailItem label="Cause of Death" value={record.cause_of_death} />
                                    <DetailItem label="Death Certificate" value={record.death_certificate_no} />
                                </div>
                            </div>
                        </section>

                        {/* Administrative Notes */}
                        {record.notes && (
                            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <header className="mb-4 flex items-center gap-3 border-b border-slate-50 pb-4">
                                    <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                                        <FileText size={20} />
                                    </div>
                                    <h2 className="font-bold text-slate-800">Administrative Notes</h2>
                                </header>
                                <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600">{record.notes}</p>
                            </section>
                        )}
                    </div>

                    {/* Sidebar: Documents */}
                    <div className="space-y-8 lg:col-span-1">
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <header className="mb-6 flex items-center gap-3 border-b border-slate-50 pb-4">
                                <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
                                    <FileText size={20} />
                                </div>
                                <h2 className="font-bold text-slate-800">Documents</h2>
                            </header>

                            {record.identification.length > 0 ? (
                                <div className="space-y-3">
                                    {record.identification.map((doc) => (
                                        <a
                                            key={doc.id}
                                            href={doc.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition-all hover:border-orange-200 hover:bg-orange-50"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm transition-colors group-hover:bg-orange-100">
                                                <FileText className="h-5 w-5 text-slate-400 group-hover:text-orange-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-bold text-slate-700 group-hover:text-orange-900">{doc.name}</p>
                                                <p className="text-[10px] text-slate-400 uppercase">{doc.mime_type.split('/')[1]}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 py-8 text-center">
                                    <FileText className="mb-2 text-slate-200" size={32} />
                                    <p className="text-xs font-medium text-slate-400">No documents attached</p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function Field({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
    return (
        <div className="p-5">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{label}</p>
            <p className={`mt-1.5 text-sm font-semibold text-slate-800 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
        </div>
    );
}

function DetailItem({ label, value, className }: { label: string; value?: string | null; className?: string }) {
    return (
        <div>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{label}</p>
            <p className={`mt-1 text-sm font-medium text-slate-700 ${className}`}>{value || '—'}</p>
        </div>
    );
}
