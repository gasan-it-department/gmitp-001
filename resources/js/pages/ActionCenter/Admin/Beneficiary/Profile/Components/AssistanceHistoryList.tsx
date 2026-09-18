import ShowAssistanceRequestProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ShowAssistanceRequestProfileController';
import Utility from '@/pages/Utility/Utility';
import { Link } from '@inertiajs/react';

export type AssistanceHistoryRole = 'filed_for_self' | 'received_on_behalf';

export interface AssistanceHistoryRow {
    id: string;
    transaction_number: string;
    status: string;
    program_name: string | null;
    amount_approved: number | null;
    mswd_verification_status: string | null;
    role: AssistanceHistoryRole;
    filer_full_name: string;
    subject_full_name: string;
    submitted_at: string | null;
    released_at: string | null;
}

interface Props {
    history: AssistanceHistoryRow[];
    municipalitySlug: string;
    canOpenRequests: boolean;
}

const STATUS_BADGE: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
    under_review: 'bg-sky-100 text-sky-800 ring-1 ring-sky-200',
    approved: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
    released: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
    rejected: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200',
    cancelled: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
};

const statusClass = (s: string) => STATUS_BADGE[s] ?? 'bg-gray-100 text-gray-700 ring-1 ring-gray-200';
const humanize = (s: string) => s.replace(/_/g, ' ');

const ROLE_LABEL: Record<AssistanceHistoryRole, string> = {
    filed_for_self: 'Filed for self',
    received_on_behalf: 'Received assistance',
};

const ROLE_CLASS: Record<AssistanceHistoryRole, string> = {
    filed_for_self: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    received_on_behalf: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
};

/**
 * Full cross-program assistance history for the beneficiary. Each row links to
 * that request's detail page so the reviewer can drill in.
 */
export default function AssistanceHistoryList({ history, municipalitySlug, canOpenRequests }: Props) {
    const utils = Utility();

    if (history.length === 0) {
        return <p className="py-4 text-center text-sm text-slate-500">No assistance intended for this beneficiary is on record.</p>;
    }

    return (
        <ul className="space-y-2">
            {history.map((row) => (
                <li key={row.id}>
                    <Link
                        as={canOpenRequests ? 'a' : 'div'}
                        href={
                            canOpenRequests
                                ? ShowAssistanceRequestProfileController.url({
                                      municipality: municipalitySlug,
                                      assistanceRequest: row.id,
                                  })
                                : '#'
                        }
                        className={`block min-h-20 rounded-md border border-slate-200 bg-white px-3 py-3 ${
                            canOpenRequests ? 'transition hover:border-slate-400 hover:bg-slate-50' : ''
                        }`}
                    >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="font-mono text-xs font-semibold break-all text-slate-800">{row.transaction_number}</p>
                                <p className="line-clamp-2 text-sm font-semibold text-slate-900">{row.program_name ?? 'Program unavailable'}</p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${statusClass(row.status)}`}>
                                {humanize(row.status)}
                            </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_CLASS[row.role]}`}>
                                {ROLE_LABEL[row.role]}
                            </span>
                            {row.mswd_verification_status && (
                                <span className="text-[10px] font-medium text-slate-500">MSWD {humanize(row.mswd_verification_status)}</span>
                            )}
                        </div>

                        {row.role === 'received_on_behalf' && (
                            <p className="mt-1.5 text-xs text-slate-600">
                                Filed by: <span className="font-semibold text-slate-800">{row.filer_full_name || 'Name unavailable'}</span>
                            </p>
                        )}

                        <p className="mt-1.5 text-[10px] text-slate-500">
                            Submitted {utils.formatToReadableDateNoTime(row.submitted_at ?? undefined)}
                            {row.amount_approved !== null && <> · Approved amount {utils.formatCurrency(row.amount_approved)}</>}
                        </p>
                    </Link>
                </li>
            ))}
        </ul>
    );
}
