import { Link } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Clock3, MapPin, OctagonX, UserCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { BeneficiaryRow } from '../../BeneficiarySearch';

interface Props {
    row: BeneficiaryRow;
    profileHref: string;
}

export default function BeneficiaryRegistryItem({ row, profileHref }: Props) {
    const fullAddress = [row.street, row.barangay].filter(Boolean).join(', ') || 'No address recorded';
    const demographics =
        [row.sex_label, row.age !== null ? `${row.age} yrs` : null, row.civil_status_label].filter(Boolean).join(' / ') || 'Not recorded';
    const releasedRecently = isWithinDays(row.last_released_at, 90);

    return (
        <article className="flex h-full flex-col rounded-md border border-slate-200 bg-white p-3 shadow-sm md:p-4">
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
                    <h2 className="text-sm font-semibold break-words text-slate-900 md:text-base">{row.full_name}</h2>
                    <p className="mt-0.5 font-mono text-xs font-medium text-slate-500">{row.beneficiary_number || 'No beneficiary number'}</p>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
                <IntakeStatus status={row.intake_status} />
                <span
                    className={
                        row.has_account
                            ? 'inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700'
                            : 'inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600'
                    }
                >
                    {row.has_account && <BadgeCheck className="h-3 w-3" />}
                    {row.has_account ? 'Portal account' : 'Walk-in'}
                </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-3 text-xs md:grid-cols-3">
                <RegistryDetail label="Barangay" value={row.barangay || 'Not recorded'} icon={<MapPin className="h-3.5 w-3.5" />} />
                <RegistryDetail label="Requests" value={`${row.total_requests} total / ${row.released_count} released`} />
                <div className="hidden md:block">
                    <RegistryDetail label="Demographics" value={demographics} />
                </div>
                <div className="col-span-2 hidden md:block">
                    <RegistryDetail label="Address" value={fullAddress} />
                </div>
                <div className="hidden md:block">
                    <RegistryDetail
                        label="Last release"
                        value={row.last_released_at ? formatDate(row.last_released_at) : 'No releases'}
                        emphasized={releasedRecently}
                    />
                </div>
            </div>

            <Link
                href={profileHref}
                className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
            >
                View profile <ArrowRight className="h-4 w-4" />
            </Link>
        </article>
    );
}

function IntakeStatus({ status }: { status: BeneficiaryRow['intake_status'] }) {
    if (status === 'verified') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                <BadgeCheck className="h-3 w-3" /> Verified
            </span>
        );
    }

    if (status === 'rejected') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">
                <OctagonX className="h-3 w-3" /> Rejected
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
            <Clock3 className="h-3 w-3" /> Pending intake
        </span>
    );
}

function RegistryDetail({ label, value, icon, emphasized = false }: { label: string; value: string; icon?: ReactNode; emphasized?: boolean }) {
    return (
        <div className="min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase">
                {icon}
                {label}
            </div>
            <p className={`mt-0.5 break-words ${emphasized ? 'font-semibold text-red-600' : 'text-slate-700'}`}>{value}</p>
        </div>
    );
}

function formatDate(value: string): string {
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

function isWithinDays(value: string | null, days: number): boolean {
    if (!value) {
        return false;
    }

    const timestamp = new Date(value).getTime();

    return !Number.isNaN(timestamp) && Date.now() - timestamp <= days * 24 * 60 * 60 * 1000;
}
