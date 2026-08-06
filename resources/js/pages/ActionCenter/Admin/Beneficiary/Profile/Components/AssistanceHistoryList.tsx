import ShowAssistanceRequestProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ShowAssistanceRequestProfileController';
import Utility from '@/pages/Utility/Utility';
import { Link } from '@inertiajs/react';

export interface AssistanceHistoryRow {
    id: string;
    transaction_number: string;
    status: string;
    program_name: string | null;
    amount_approved: number | null;
    submitted_at: string | null;
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

/**
 * Full cross-program assistance history for the beneficiary. Each row links to
 * that request's detail page so the reviewer can drill in.
 */
export default function AssistanceHistoryList({ history, municipalitySlug, canOpenRequests }: Props) {
    const utils = Utility();

    if (history.length === 0) {
        return <p className="py-4 text-center text-sm text-slate-400 italic">No assistance requests on record.</p>;
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
                        className={`block min-h-16 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-3 sm:min-h-0 sm:py-2 ${
                            canOpenRequests ? 'transition hover:border-slate-300 hover:bg-white' : ''
                        }`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="font-mono text-xs font-semibold break-all text-slate-800">{row.transaction_number}</p>
                                <p className="line-clamp-2 text-xs text-slate-600 sm:truncate">{row.program_name ?? '—'}</p>
                            </div>
                            <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase ${statusClass(row.status)}`}
                            >
                                {humanize(row.status)}
                            </span>
                        </div>
                        <p className="mt-1 text-[10px] text-slate-400">
                            {utils.formatToReadableDateNoTime(row.submitted_at ?? undefined)}
                            {row.amount_approved !== null && <> · {utils.formatCurrency(row.amount_approved)}</>}
                        </p>
                    </Link>
                </li>
            ))}
        </ul>
    );
}
