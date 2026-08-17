import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, BadgeCheck, CalendarClock, ChevronDown, Clock3, Home, Mail, OctagonX, UserCircle2, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import type { BeneficiaryMembershipRow, BeneficiarySearchRow } from '../BeneficiarySearch';

interface Props {
    row: BeneficiarySearchRow;
    isPossibleDuplicate: boolean;
    profileHref: string;
}

export default function BeneficiaryResultCard({ row, isPossibleDuplicate, profileHref }: Props) {
    const releasedRecently = isWithinDays(row.last_released_at, 90);
    const demographics = [row.sex_label, row.age !== null ? `${row.age} yrs` : null, row.civil_status_label].filter(Boolean).join(' / ');
    const currentMembership = row.memberships.find((membership) => membership.status === 'current_household') ?? null;
    const otherMemberships = row.memberships.filter((membership) => membership.id !== currentMembership?.id);

    return (
        <article
            className={[
                'flex min-w-0 flex-col rounded-md border bg-white p-3 shadow-sm transition-colors md:p-4',
                isPossibleDuplicate ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200',
            ].join(' ')}
        >
            <div className="flex min-w-0 items-start gap-3">
                {row.avatar_url ? (
                    <img
                        src={row.avatar_url}
                        alt={row.full_name}
                        className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover md:h-11 md:w-11"
                    />
                ) : (
                    <UserCircle2 className="h-10 w-10 shrink-0 text-slate-400 md:h-11 md:w-11" />
                )}

                <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold break-words text-gray-900 md:text-base">{row.full_name}</h2>
                    <p className="mt-0.5 font-mono text-xs font-semibold break-all text-slate-500">
                        {row.beneficiary_number || 'No beneficiary number'}
                    </p>
                    <p className="mt-1 text-xs break-words text-gray-500 md:text-sm">{demographics || 'Demographics not recorded'}</p>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
                {isPossibleDuplicate && (
                    <StatusChip tone="danger" icon={<AlertTriangle className="h-3 w-3" />}>
                        Possible same person
                    </StatusChip>
                )}

                {row.intake_status === 'verified' ? (
                    <StatusChip tone="success" icon={<BadgeCheck className="h-3 w-3" />}>
                        Identity verified
                    </StatusChip>
                ) : row.intake_status === 'rejected' ? (
                    <StatusChip tone="danger" icon={<OctagonX className="h-3 w-3" />}>
                        Intake rejected
                    </StatusChip>
                ) : (
                    <StatusChip tone="warning" icon={<Clock3 className="h-3 w-3" />}>
                        Pending intake
                    </StatusChip>
                )}

                {row.has_account ? (
                    <StatusChip tone="info" icon={<BadgeCheck className="h-3 w-3" />}>
                        Portal account
                    </StatusChip>
                ) : (
                    <StatusChip tone="neutral">Walk-in</StatusChip>
                )}
            </div>

            <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                {row.membership_warning.has_warning && (
                    <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                            {row.membership_warning.multiple_active_memberships
                                ? 'This beneficiary has more than one active household membership. Review the household assignment.'
                                : 'This active beneficiary has no active roster row in their primary household.'}
                        </span>
                    </div>
                )}

                {currentMembership ? (
                    <MembershipSummary membership={currentMembership} />
                ) : (
                    <p className="text-xs text-slate-500">No current household membership is linked to this profile.</p>
                )}

                {otherMemberships.length > 0 && (
                    <details className="group rounded-md border border-slate-200 bg-slate-50/60">
                        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-xs font-semibold text-slate-700">
                            <span>
                                {otherMemberships.length} other household record{otherMemberships.length === 1 ? '' : 's'}
                            </span>
                            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="space-y-2 border-t border-slate-200 p-2">
                            {otherMemberships.map((membership) => (
                                <MembershipSummary key={membership.id} membership={membership} compact />
                            ))}
                        </div>
                    </details>
                )}
            </div>

            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-gray-100 pt-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <Detail icon={<CalendarClock className="h-4 w-4" />} label="Birthdate" value={formatDate(row.birth_date)} />
                <Detail
                    icon={<Home className="h-4 w-4" />}
                    label="Address"
                    value={[row.street, row.barangay].filter(Boolean).join(', ') || 'Not recorded'}
                />
                <Detail icon={<Wallet className="h-4 w-4" />} label="Occupation" value={row.occupation || 'Not recorded'} />
                <Detail label="Monthly income" value={formatPeso(row.monthly_income)} />
                {row.account_email && <Detail icon={<Mail className="h-4 w-4" />} label="Account" value={row.account_email} />}
            </dl>

            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-gray-100 pt-3 text-xs text-gray-500 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5">
                <span>
                    <span className="font-semibold text-gray-800">{row.total_requests}</span> total request{row.total_requests === 1 ? '' : 's'}
                </span>
                <span>
                    <span className="font-semibold text-gray-800">{row.released_count}</span> released
                </span>
                {row.last_released_at && (
                    <span className={`col-span-2 ${releasedRecently ? 'font-semibold text-red-600' : ''}`}>
                        Last released {formatDate(row.last_released_at)}
                        {releasedRecently && ' / recent'}
                    </span>
                )}
                {row.last_request_at && <span className="col-span-2">Last applied {formatDate(row.last_request_at)}</span>}
            </div>

            <Link
                href={profileHref}
                className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none sm:w-auto sm:self-end"
            >
                View profile <ArrowRight className="h-4 w-4" />
            </Link>
        </article>
    );
}

function MembershipSummary({ membership, compact = false }: { membership: BeneficiaryMembershipRow; compact?: boolean }) {
    const status = MEMBERSHIP_STATUS[membership.status];
    const address = [membership.street, membership.barangay].filter(Boolean).join(', ') || 'Address not recorded';

    return (
        <div className={`flex min-w-0 flex-col gap-1 rounded-md border px-3 py-2 sm:flex-row sm:items-center sm:justify-between ${status.container}`}>
            <div className="min-w-0">
                <p className={`font-semibold break-words text-slate-800 ${compact ? 'text-xs' : 'text-sm'}`}>
                    {membership.household_code || 'Household code unavailable'}
                </p>
                <p className="text-xs break-words text-slate-500">
                    {membership.relationship_label || membership.relationship || 'Relationship not recorded'} / {address}
                </p>
            </div>
            <span className={`inline-flex w-fit shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${status.badge}`}>{status.label}</span>
        </div>
    );
}

const MEMBERSHIP_STATUS: Record<BeneficiaryMembershipRow['status'], { label: string; container: string; badge: string }> = {
    current_household: {
        label: 'Current household',
        container: 'border-emerald-200 bg-emerald-50/60',
        badge: 'bg-emerald-100 text-emerald-700',
    },
    other_active_household: {
        label: 'Other active household',
        container: 'border-amber-200 bg-amber-50/60',
        badge: 'bg-amber-100 text-amber-800',
    },
    moved_out: {
        label: 'Moved out',
        container: 'border-slate-200 bg-white',
        badge: 'bg-slate-100 text-slate-600',
    },
};

type ChipTone = 'danger' | 'success' | 'warning' | 'info' | 'neutral';

const CHIP_TONES: Record<ChipTone, string> = {
    danger: 'bg-red-50 text-red-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    info: 'bg-blue-50 text-blue-700',
    neutral: 'bg-slate-100 text-slate-600',
};

function StatusChip({ tone, icon, children }: { tone: ChipTone; icon?: ReactNode; children: ReactNode }) {
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${CHIP_TONES[tone]}`}>
            {icon}
            {children}
        </span>
    );
}

function Detail({ icon, label, value }: { icon?: ReactNode; label: string; value: string }) {
    return (
        <div className="flex min-w-0 items-start gap-2">
            {icon && <span className="mt-0.5 shrink-0 text-gray-400">{icon}</span>}
            <div className="min-w-0">
                <dt className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">{label}</dt>
                <dd className="break-words text-gray-800">{value}</dd>
            </div>
        </div>
    );
}

function formatDate(iso: string | null): string {
    if (!iso) {
        return 'Not recorded';
    }

    const date = new Date(iso);

    if (Number.isNaN(date.getTime())) {
        return 'Not recorded';
    }

    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatPeso(amount: number | null): string {
    if (amount === null) {
        return 'Not recorded';
    }

    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

function isWithinDays(iso: string | null, days: number): boolean {
    if (!iso) {
        return false;
    }

    const timestamp = new Date(iso).getTime();

    return !Number.isNaN(timestamp) && Date.now() - timestamp <= days * 24 * 60 * 60 * 1000;
}
