import { mswdVerificationLabel, type MswdVerificationStatus } from '@/Core/Types/ActionCenter/assistance';

export default function MswdVerificationBadge({ status, isCurrent }: { status: MswdVerificationStatus | null | undefined; isCurrent?: boolean }) {
    const stale = status === 'verified' && isCurrent === false;
    const color = stale || status === 'needs_correction'
        ? 'border-rose-200 bg-rose-50 text-rose-800'
        : status === 'verified'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : status === 'under_review'
            ? 'border-sky-200 bg-sky-50 text-sky-800'
            : 'border-amber-200 bg-amber-50 text-amber-800';

    return <span className={`inline-flex max-w-full rounded-md border px-2 py-1 text-xs font-medium ${color}`}>
        {stale ? 'MSWD Verification Outdated' : mswdVerificationLabel(status)}
    </span>;
}
