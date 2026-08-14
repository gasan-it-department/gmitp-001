import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, BadgeCheck, CalendarClock, Check, ClipboardCopy, Home, UserRound } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { RosterOnlyRow } from '../BeneficiarySearch';

interface Props {
    row: RosterOnlyRow;
    isPossibleMatch: boolean;
    headProfileHref: string | null;
}

export default function RosterOnlyResultCard({ row, isPossibleMatch, headProfileHref }: Props) {
    const [copied, setCopied] = useState(false);
    const demographics = [row.sex_label, row.age !== null ? `${row.age} yrs` : null].filter(Boolean).join(' / ');
    const address = [row.household.street, row.household.barangay].filter(Boolean).join(', ') || 'Address not recorded';

    const copyHouseholdCode = async () => {
        if (!row.household.household_code) return;

        await navigator.clipboard.writeText(row.household.household_code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    };

    return (
        <article className="flex min-w-0 flex-col rounded-md border border-amber-200 bg-white p-3 shadow-sm md:p-4">
            <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700 md:h-11 md:w-11">
                    <UserRound className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold break-words text-gray-900 md:text-base">{row.full_name}</h2>
                    <p className="mt-1 text-xs break-words text-gray-500 md:text-sm">{demographics || 'Demographics not recorded'}</p>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">
                    Roster entry only
                </span>
                {isPossibleMatch && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">
                        <AlertTriangle className="h-3 w-3" /> Possible same person
                    </span>
                )}
                {row.is_verified_dependent ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                        <BadgeCheck className="h-3 w-3" /> Verified dependent
                    </span>
                ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                        Pending relationship review
                    </span>
                )}
            </div>

            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-gray-100 pt-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <Detail icon={<CalendarClock className="h-4 w-4" />} label="Birthdate" value={formatDate(row.birth_date)} />
                <Detail label="Relationship" value={row.relationship || 'Not recorded'} />
                <Detail icon={<Home className="h-4 w-4" />} label="Household address" value={address} />
                <Detail label="Household head" value={row.household.head_name || 'No active head recorded'} />
            </dl>

            <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Household</span>
                    <span className="min-w-0 font-mono text-xs font-semibold break-all text-slate-700">
                        {row.household.household_code || 'Code unavailable'}
                    </span>
                    {row.household.household_code && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            onClick={copyHouseholdCode}
                            title="Copy household code"
                            aria-label="Copy household code"
                        >
                            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <ClipboardCopy className="h-4 w-4" />}
                        </Button>
                    )}
                </div>

                {headProfileHref ? (
                    <Link
                        href={headProfileHref}
                        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 sm:w-auto"
                    >
                        View household <ArrowRight className="h-4 w-4" />
                    </Link>
                ) : (
                    <span className="text-xs text-slate-500">No linked head profile is available for navigation.</span>
                )}
            </div>
        </article>
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
    if (!iso) return 'Not recorded';

    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Not recorded';

    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}
