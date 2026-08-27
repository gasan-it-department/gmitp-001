import { Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import { AssistanceRequestListItem, humanizeStatus, statusClass } from './AssistanceRequestTable';

interface Props {
    row: AssistanceRequestListItem;
    viewUrl: string;
}

export default function AssistanceRequestRegistryItem({ row, viewUrl }: Props) {
    const filingContext = row.filed_for_self ? 'Filed for self' : `On behalf${row.relationship?.label ? ` / ${row.relationship.label}` : ''}`;

    return (
        <Link
            href={viewUrl}
            aria-label={`View assistance request ${row.transaction_number}`}
            className="group block h-full min-w-0 rounded-md border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none md:p-4"
        >
            <article className="flex h-full min-w-0 flex-col">
                <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        {!row.filed_for_self && <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">Assistance for:</p>}
                        <p className="font-mono text-xs font-semibold break-all text-slate-500">{row.transaction_number}</p>
                        <h2 className="mt-1 text-sm font-semibold break-words text-slate-900 md:text-base">
                            {row.subject_full_name || 'No recipient recorded'}
                        </h2>
                        {!row.filed_for_self && row.filer_full_name && <p className="mt-1 text-xs text-slate-500">Filed by: {row.filer_full_name}</p>}
                    </div>
                    <span
                        className={`inline-flex shrink-0 rounded-full px-2 py-1 text-[10px] font-bold tracking-wide uppercase ${statusClass(row.status)}`}
                    >
                        {humanizeStatus(row.status)}
                    </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                        {row.assistance_type?.name ?? 'Program not recorded'}
                    </span>
                    <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">{filingContext}</span>
                    {row.is_walkin && (
                        <span className="inline-flex rounded-full bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">Walk-in</span>
                    )}
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-4 border-t border-slate-100 pt-3 text-xs">
                    <RegistryDetail label="Barangay" value={row.snapshot_barangay || 'Not recorded'} icon={<MapPin className="h-3.5 w-3.5" />} />
                    <RegistryDetail label="Submitted" value={formatDate(row.submitted_at)} icon={<CalendarDays className="h-3.5 w-3.5" />} />
                </dl>

                <span className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors group-hover:bg-slate-800">
                    View request <ArrowRight className="h-4 w-4" />
                </span>
            </article>
        </Link>
    );
}

function RegistryDetail({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
    return (
        <div className="min-w-0">
            <dt className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase">
                {icon}
                {label}
            </dt>
            <dd className="mt-0.5 break-words text-slate-700">{value}</dd>
        </div>
    );
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Not recorded';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Not recorded';
    }

    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
