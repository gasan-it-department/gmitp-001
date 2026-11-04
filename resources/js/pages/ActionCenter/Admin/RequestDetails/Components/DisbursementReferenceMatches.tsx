import FindAssistanceDisbursementReferencesController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/FindAssistanceDisbursementReferencesController';
import ShowAssistanceRequestProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ShowAssistanceRequestProfileController';
import { Button } from '@/components/ui/button';
import type { AssistanceDisbursementReferenceResults } from '@/Core/Types/ActionCenter/assistance';
import { AlertTriangle, ArrowLeft, ArrowRight, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    requestId: string;
    municipality: string;
    method: string;
    reference: string;
    refreshKey: number;
}

export default function DisbursementReferenceMatches({ requestId, municipality, method, reference, refreshKey }: Props) {
    const [page, setPage] = useState(1);
    const [retry, setRetry] = useState(0);
    const [result, setResult] = useState<{ key: string; data?: AssistanceDisbursementReferenceResults; error?: boolean } | null>(null);
    const trimmed = reference.trim();
    const key = JSON.stringify([requestId, municipality, method, trimmed, page, refreshKey, retry]);

    useEffect(() => setPage(1), [requestId, municipality, method, trimmed, refreshKey]);

    useEffect(() => {
        if (!trimmed) return;
        const controller = new AbortController();
        let current = true;
        const timeout = setTimeout(async () => {
            try {
                const response = await fetch(
                    FindAssistanceDisbursementReferencesController.url(
                        { assistanceRequestId: requestId },
                        {
                            query: { method, reference: trimmed, page },
                        },
                    ),
                    {
                        signal: controller.signal,
                        cache: 'no-store',
                        headers: { Accept: 'application/json', 'X-Municipality-Slug': municipality },
                    },
                );
                if (!response.ok || response.redirected) throw new Error('Lookup failed');
                const data: AssistanceDisbursementReferenceResults = await response.json();
                if (current) setResult({ key, data });
            } catch {
                if (current) setResult({ key, error: true });
            }
        }, 400);
        return () => {
            current = false;
            clearTimeout(timeout);
            controller.abort();
        };
    }, [key, requestId, municipality, method, trimmed, page]);

    if (!trimmed) return null;
    const latest = result?.key === key ? result : null;
    if (!latest)
        return (
            <p role="status" className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Checking reference…
            </p>
        );
    if (latest.error || !latest.data)
        return (
            <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 p-3 text-sm">
                <p>Reference check unavailable. Saving will check again.</p>
                <Button type="button" variant="outline" size="sm" onClick={() => setRetry((value) => value + 1)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                </Button>
            </div>
        );
    const { data, meta, blocking } = latest.data;
    if (meta.total === 0)
        return (
            <p role="status" className="text-xs text-slate-600">
                No other recorded reference matches this payment method and number.
            </p>
        );

    return (
        <section
            aria-label="Matching payment references"
            className={`min-w-0 rounded-md border ${blocking ? 'border-amber-200 bg-amber-50/70' : 'border-slate-200 bg-slate-50'}`}
        >
            <div role="status" className="flex items-start gap-2 border-b border-inherit p-3">
                <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${blocking ? 'text-amber-700' : 'text-slate-500'}`} />
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold">{blocking ? 'Reference already recorded' : 'Voided reference history'}</h3>
                    <p className="mt-1 text-xs text-slate-600">
                        {blocking
                            ? 'Review the matching request before saving. This reference cannot be reused.'
                            : 'These voided records do not block saving.'}
                    </p>
                </div>
            </div>
            <ul className="divide-y divide-amber-200/60">
                {data.map((match) => (
                    <li key={match.id} className="min-w-0 space-y-2 p-3 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="min-w-0 font-semibold break-all">{match.transaction_number}</p>
                            <span
                                className={`rounded px-2 py-0.5 text-xs font-medium ${match.blocking ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-700'}`}
                            >
                                {paymentStatus(match.status)}
                            </span>
                        </div>
                        <p className="break-words">{match.payee_name}</p>
                        <dl className="grid min-w-0 grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                            <div className="min-w-0">
                                <dt className="text-slate-500">{match.method === 'check' ? 'Check number' : 'Cash voucher reference'}</dt>
                                <dd className="mt-0.5 break-all">{match.reference}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Amount</dt>
                                <dd className="mt-0.5 font-medium">
                                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(match.amount))}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">{match.method === 'check' ? 'Check date' : 'Voucher date'}</dt>
                                <dd className="mt-0.5">{match.instrument_date ?? 'Not recorded'}</dd>
                            </div>
                        </dl>
                        {match.status === 'voided' && <p className="text-xs text-slate-500">Historical record · Does not block saving</p>}
                        <a
                            href={ShowAssistanceRequestProfileController.url({ municipality, assistanceRequest: match.request_id })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium underline underline-offset-4"
                        >
                            Open Request
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span className="sr-only"> (new tab)</span>
                        </a>
                    </li>
                ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-inherit p-3 text-xs">
                <span>
                    {meta.total} matching {meta.total === 1 ? 'record' : 'records'} · Page {meta.current_page} of {meta.last_page}
                </span>
                {meta.last_page > 1 && (
                    <div className="flex gap-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Previous matches"
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Next matches"
                            disabled={page >= meta.last_page}
                            onClick={() => setPage(page + 1)}
                        >
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}

function paymentStatus(status: string): string {
    return status === 'ready' ? 'Ready for Claim' : status.charAt(0).toUpperCase() + status.slice(1);
}
