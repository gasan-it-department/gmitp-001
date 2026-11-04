import type { AssistanceDisbursementReferenceMatch } from '@/Core/Types/ActionCenter/assistance';

export default function MatchingPaymentReferences({ matches }: { matches?: AssistanceDisbursementReferenceMatch[] }) {
    if (!matches?.length) return null;

    return (
        <ul
            aria-label="Matching payment references"
            className="mt-2 space-y-1 border-t border-slate-100 pt-2 font-sans text-xs font-normal text-slate-600"
        >
            {matches.map((match) => (
                <li key={match.id} className="min-w-0 break-all">
                    <span className="font-medium text-slate-800">
                        {match.method === 'check' ? 'Check' : 'Cash voucher'} {match.reference}
                    </span>
                    <span className={`ml-1 ${match.status === 'voided' ? 'text-slate-500' : 'text-amber-800'}`}>
                        · {match.status === 'ready' ? 'Ready for Claim' : match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                    </span>
                </li>
            ))}
        </ul>
    );
}
