import ShowAssistanceRequestProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ShowAssistanceRequestProfileController';
import Utility from '@/pages/Utility/Utility';
import { Link } from '@inertiajs/react';

export interface HouseholdAssistanceHistoryRow {
    id: string;
    transaction_number: string;
    status: string;
    mswd_verification_status: string | null;
    program_name: string | null;
    amount_approved: number | null;
    is_self_filed: boolean;
    filer_full_name: string;
    subject_full_name: string;
    submitted_at: string | null;
    released_at: string | null;
}

interface Props {
    history: HouseholdAssistanceHistoryRow[];
    municipalitySlug: string;
    canOpenRequests: boolean;
    emptyMessage?: string;
}

const STATUS_BADGE: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
    under_review: 'bg-sky-100 text-sky-800 ring-1 ring-sky-200',
    approved: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
    released: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
    rejected: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200',
    cancelled: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
};

const statusClass = (status: string) => STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-700 ring-1 ring-gray-200';
const humanize = (value: string) => value.replace(/_/g, ' ');

export default function HouseholdAssistanceHistoryList({
    history,
    municipalitySlug,
    canOpenRequests,
    emptyMessage = 'No current-household requests include this person.',
}: Props) {
    const utils = Utility();

    return (
        <div>
            {history.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">{emptyMessage}</p>
            ) : (
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
                                className={`block rounded-md border border-slate-200 bg-white px-3 py-3 ${
                                    canOpenRequests ? 'transition hover:border-slate-400 hover:bg-slate-50' : ''
                                }`}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-mono text-xs font-semibold break-all text-slate-800">{row.transaction_number}</p>
                                        <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                                            {row.program_name ?? 'Program unavailable'}
                                        </p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${statusClass(row.status)}`}>
                                        {humanize(row.status)}
                                    </span>
                                </div>

                                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                    <HistoryIdentity label="Assistance for" value={row.subject_full_name} />
                                    <HistoryIdentity
                                        label={row.is_self_filed ? 'Filing' : 'Filed by'}
                                        value={row.is_self_filed ? 'Filed for self' : row.filer_full_name}
                                    />
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
                                    <span>Submitted {utils.formatToReadableDateNoTime(row.submitted_at ?? undefined)}</span>
                                    {row.released_at && <span>Released {utils.formatToReadableDateNoTime(row.released_at)}</span>}
                                    {row.amount_approved !== null && <span>Amount {utils.formatCurrency(row.amount_approved)}</span>}
                                    {row.mswd_verification_status && <span>MSWD {humanize(row.mswd_verification_status)}</span>}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function HistoryIdentity({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0">
            <p className="text-[9px] font-bold tracking-wide text-slate-400 uppercase">{label}</p>
            <p className="text-xs font-semibold break-words text-slate-800">{value || 'Name unavailable'}</p>
        </div>
    );
}
