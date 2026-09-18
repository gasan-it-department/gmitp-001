import ShowAssistanceRequestProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ShowAssistanceRequestProfileController';
import Utility from '@/pages/Utility/Utility';
import { Link } from '@inertiajs/react';

export type HouseholdCooldownState = 'unreleased' | 'active' | 'expired' | 'permanent' | 'none_configured' | 'not_captured' | 'legacy_unavailable';

export interface HouseholdAssistanceInvolvementRow {
    id: string;
    transaction_number: string;
    status: string;
    mswd_verification_status: string | null;
    program_name: string | null;
    amount_approved: number | null;
    filer_full_name: string;
    subject_full_name: string;
    household_code: string | null;
    submitted_at: string | null;
    released_at: string | null;
    cooldown: {
        state: HouseholdCooldownState;
        starts_at: string | null;
        expires_at: string | null;
    };
}

interface Props {
    history: HouseholdAssistanceInvolvementRow[];
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

const COOLDOWN_CLASS: Record<HouseholdCooldownState, string> = {
    unreleased: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    active: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    expired: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    permanent: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    none_configured: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    not_captured: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    legacy_unavailable: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

const humanize = (value: string) => value.replace(/_/g, ' ');

export default function HouseholdAssistanceInvolvementList({ history, municipalitySlug, canOpenRequests }: Props) {
    const utils = Utility();

    if (history.length === 0) {
        return <p className="py-4 text-center text-sm text-slate-500">No proven household assistance involvement is on record.</p>;
    }

    const cooldownLabel = (row: HouseholdAssistanceInvolvementRow): string => {
        switch (row.cooldown.state) {
            case 'active':
                return row.cooldown.expires_at
                    ? `Cooldown active until ${utils.formatToReadableDateNoTime(row.cooldown.expires_at)}`
                    : 'Cooldown active';
            case 'expired':
                return row.cooldown.expires_at ? `Cooldown expired ${utils.formatToReadableDateNoTime(row.cooldown.expires_at)}` : 'Cooldown expired';
            case 'permanent':
                return 'Permanent restriction';
            case 'none_configured':
                return 'No cooldown configured';
            case 'not_captured':
                return 'Not applied to this person at release';
            case 'legacy_unavailable':
                return 'Legacy cooldown outcome unavailable';
            default:
                return 'No cooldown yet';
        }
    };

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
                        className={`block rounded-md border border-slate-200 bg-white px-3 py-3 ${
                            canOpenRequests ? 'transition hover:border-slate-400 hover:bg-slate-50' : ''
                        }`}
                    >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="font-mono text-xs font-semibold break-all text-slate-800">{row.transaction_number}</p>
                                <p className="line-clamp-2 text-sm font-semibold text-slate-900">{row.program_name ?? 'Program unavailable'}</p>
                            </div>
                            <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                    STATUS_BADGE[row.status] ?? 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
                                }`}
                            >
                                {humanize(row.status)}
                            </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 ring-1 ring-violet-200">
                                Household member, not recipient
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${COOLDOWN_CLASS[row.cooldown.state]}`}>
                                {cooldownLabel(row)}
                            </span>
                        </div>

                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <HistoryIdentity label="Assistance for" value={row.subject_full_name} />
                            <HistoryIdentity label="Filed by" value={row.filer_full_name} />
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
                            {row.household_code && <span>Household {row.household_code}</span>}
                            <span>Submitted {utils.formatToReadableDateNoTime(row.submitted_at ?? undefined)}</span>
                            {row.released_at && <span>Released {utils.formatToReadableDateNoTime(row.released_at)}</span>}
                            {row.amount_approved !== null && <span>Amount {utils.formatCurrency(row.amount_approved)}</span>}
                            {row.mswd_verification_status && <span>MSWD {humanize(row.mswd_verification_status)}</span>}
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
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
