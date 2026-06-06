import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, BadgeCheck, CalendarClock, Home, Mail, UserCircle2, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import type { BeneficiaryRow } from '../BeneficiarySearch';

interface Props {
    row: BeneficiaryRow;
    isPossibleDuplicate: boolean;
    profileHref: string;
}

/**
 * One beneficiary in the search results.
 *
 * Surfaces ALL available information so the interviewer can verify the person
 * against their uploaded ID in a single glance, and highlights two risk signals:
 *   - "Possible duplicate" when another result shares this name + birthdate.
 *   - A recent RELEASED payout (red), so the admin notices repeat disbursement.
 */
export default function BeneficiaryResultCard({ row, isPossibleDuplicate, profileHref }: Props) {
    const releasedRecently = isWithinDays(row.last_released_at, 90);

    return (
        <div
            className={[
                'rounded-2xl border bg-white p-4 shadow-sm transition-colors',
                isPossibleDuplicate ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200',
            ].join(' ')}
        >
            {/* ── Header row ── */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <UserCircle2 className="mt-0.5 h-9 w-9 shrink-0 text-slate-400" />
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-gray-900">{row.full_name}</h3>
                            {isPossibleDuplicate && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                                    <AlertTriangle className="h-3 w-3" /> Possible duplicate
                                </span>
                            )}
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                            {[
                                row.sex_label,
                                row.age !== null ? `${row.age} yrs` : null,
                                row.civil_status_label,
                            ]
                                .filter(Boolean)
                                .join(' • ') || '—'}
                        </p>
                    </div>
                </div>

                {/* Account chip + drill-down */}
                <div className="flex flex-col items-end gap-2">
                    {row.has_account ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            <BadgeCheck className="h-3.5 w-3.5" /> Has account
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            Walk-in
                        </span>
                    )}
                    <Link
                        href={profileHref}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline"
                    >
                        View profile <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>

            {/* ── Detail grid ── */}
            <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 border-t border-gray-100 pt-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <Detail icon={<CalendarClock className="h-4 w-4" />} label="Birthdate" value={formatDate(row.birth_date)} />
                <Detail
                    icon={<Home className="h-4 w-4" />}
                    label="Address"
                    value={[row.street, row.barangay].filter(Boolean).join(', ') || '—'}
                />
                <Detail icon={<Wallet className="h-4 w-4" />} label="Occupation" value={row.occupation || '—'} />
                <Detail label="Monthly income" value={formatPeso(row.monthly_income)} />
                {row.account_email && <Detail icon={<Mail className="h-4 w-4" />} label="Account" value={row.account_email} />}
            </div>

            {/* ── Assistance history ── */}
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
                <span>
                    <span className="font-semibold text-gray-800">{row.total_requests}</span> total request
                    {row.total_requests === 1 ? '' : 's'}
                </span>
                <span>
                    <span className="font-semibold text-gray-800">{row.released_count}</span> released
                </span>
                {row.last_released_at && (
                    <span className={releasedRecently ? 'font-semibold text-red-600' : ''}>
                        Last released {formatDate(row.last_released_at)}
                        {releasedRecently && ' — recent!'}
                    </span>
                )}
                {row.last_request_at && <span>Last applied {formatDate(row.last_request_at)}</span>}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bits
// ─────────────────────────────────────────────────────────────────────────────

function Detail({ icon, label, value }: { icon?: ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-2">
            {icon && <span className="mt-0.5 text-gray-400">{icon}</span>}
            <div className="min-w-0">
                <div className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">{label}</div>
                <div className="truncate text-gray-800">{value}</div>
            </div>
        </div>
    );
}

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatPeso(amount: number | null): string {
    if (amount === null) return '—';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

function isWithinDays(iso: string | null, days: number): boolean {
    if (!iso) return false;
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return false;
    return Date.now() - then <= days * 24 * 60 * 60 * 1000;
}
