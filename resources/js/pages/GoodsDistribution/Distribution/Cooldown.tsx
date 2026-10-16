import { Button } from '@/components/ui/button';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { CircleCheck, RefreshCw, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInventoryContext } from '../Inventory/components';

export interface CooldownPolicy {
    enabled: boolean;
    scope: 'recipient' | 'household';
    duration: number | null;
    unit: 'days' | 'weeks' | 'months' | null;
    starts_on: string;
    ends_on: string | null;
    exception_used?: boolean;
}
export interface CooldownContext {
    date: string;
    policy: CooldownPolicy;
    blocked: boolean;
    next_eligible_on: string | null;
    fingerprint: string;
    authorization_current?: boolean;
    conflicts: { request_id: string; reference: string; kind: 'active' | 'historical_overlap'; scope: string; starts_on: string; ends_on: string }[];
}
export function useCooldownContext({
    requestId,
    version,
    programId,
    beneficiaryId,
    memberId,
    date,
    enabled = true,
}: {
    requestId?: string;
    version?: number;
    programId?: string;
    beneficiaryId?: string;
    memberId?: string;
    date?: string;
    enabled?: boolean;
}) {
    const { slug } = useInventoryContext();
    const [context, setContext] = useState<CooldownContext | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(0);
    useEffect(() => {
        setContext(null);
        setError('');
        if (!enabled || (!requestId && (!programId || !beneficiaryId))) {
            setLoading(false);
            return;
        }
        const controller = new AbortController();
        setLoading(true);
        const options = { signal: controller.signal, headers: { 'X-Municipality-Slug': slug } };
        const request = requestId
            ? axios.get<{ data: CooldownContext }>(goodsDistribution.requests.api.cooldownContext.url({ requestId }), {
                  ...options,
                  params: { actual_release_on: date },
              })
            : axios.post<{ data: CooldownContext }>(
                  goodsDistribution.requests.api.cooldownLookup.url(),
                  { program_id: programId, beneficiary_id: beneficiaryId, assisted_household_member_id: memberId || null, actual_release_on: date },
                  options,
              );
        request
            .then((response) => {
                if (!controller.signal.aborted) setContext(response.data.data);
            })
            .catch((failure) => {
                if (!controller.signal.aborted)
                    setError(
                        axios.isAxiosError(failure)
                            ? (failure.response?.data?.message ?? 'Could not check goods cooldowns. Try again.')
                            : 'Could not check goods cooldowns. Try again.',
                    );
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [slug, requestId, version, programId, beneficiaryId, memberId, date, enabled, refresh]);
    return { context, error, loading, refresh: () => setRefresh((value) => value + 1) };
}
export function CooldownNotice({ context, error, loading, refresh }: ReturnType<typeof useCooldownContext>) {
    const { slug } = useInventoryContext();
    const date = (value: string) => new Date(value + 'T00:00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
    if (error)
        return (
            <div role="alert" className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-none">
                <TriangleAlert aria-hidden="true" className="mt-1 size-4 shrink-0" />
                <p className="min-w-0 flex-1 [overflow-wrap:anywhere]">{error}</p>
                <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label="Refresh cooldown eligibility"
                    title="Refresh cooldown eligibility"
                    onClick={refresh}
                >
                    <RefreshCw aria-hidden="true" className="size-4" />
                </Button>
            </div>
        );
    if (loading)
        return (
            <p role="status" className="flex items-center gap-2 rounded-md border border-[#dfe6e1] bg-white p-4 text-sm text-muted-foreground">
                <RefreshCw aria-hidden="true" className="size-4 shrink-0 animate-spin" />
                Checking goods eligibility...
            </p>
        );
    if (!context || (!context.policy.enabled && !context.blocked)) return null;
    return (
        <section
            aria-label="Goods cooldown eligibility"
            className={`rounded-md border p-4 text-sm shadow-none sm:px-5 ${context.blocked ? 'border-amber-200 bg-amber-50 text-amber-950' : 'border-[#dce9e0] bg-[#f4f8f5] text-[#245e4f]'}`}
        >
            <div className="flex items-start justify-between gap-3">
                <h2 className="flex min-w-0 items-center gap-2 font-semibold">
                    {context.blocked ? (
                        <TriangleAlert aria-hidden="true" className="size-4 shrink-0 text-amber-700" />
                    ) : (
                        <CircleCheck aria-hidden="true" className="size-4 shrink-0" />
                    )}
                    {context.blocked
                        ? context.conflicts.some((source) => source.kind === 'active')
                            ? 'Active Cooldown'
                            : 'Cooldown Review Required'
                        : 'Cooldown Eligibility'}
                </h2>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="-mt-1 -mr-1 size-8 shrink-0 hover:bg-black/5"
                    aria-label="Refresh cooldown eligibility"
                    title="Refresh cooldown eligibility"
                    onClick={refresh}
                >
                    <RefreshCw aria-hidden="true" className="size-4" />
                </Button>
            </div>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-xs">
                {context.policy.enabled && (
                    <p>
                        {context.policy.duration} {context.policy.unit === 'months' ? 'calendar months' : context.policy.unit}
                        {' · '}Scope: {context.policy.scope === 'household' ? 'Household' : 'Recipient'}
                    </p>
                )}
                {context.blocked && context.next_eligible_on && (
                    <p className="text-amber-800">
                        Next eligible: <span className="font-semibold whitespace-nowrap">{date(context.next_eligible_on)}</span>
                    </p>
                )}
            </div>
            {context.blocked ? (
                <>
                    <p className="mt-3 font-medium">
                        {context.authorization_current
                            ? 'Cooldown exception authorized for this handover date'
                            : 'Decision-maker cooldown exception required'}
                    </p>
                    <ul className="mt-3 divide-y divide-amber-200 border-t border-amber-200 text-xs">
                        {context.conflicts.map((source) => (
                            <li key={source.request_id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 last:pb-0">
                                <Link
                                    href={goodsDistribution.requests.show.url({ municipality: slug, requestId: source.request_id })}
                                    className="min-w-0 [overflow-wrap:anywhere] underline decoration-amber-300 underline-offset-2 hover:decoration-amber-800 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
                                >
                                    {source.reference}
                                </Link>
                                <span className="text-amber-800">Scope: {source.scope === 'household' ? 'Household' : 'Recipient'}</span>
                                <span className="text-amber-800">
                                    {source.kind === 'historical_overlap'
                                        ? 'Later handover overlaps this proposed interval'
                                        : `Ends: ${date(source.ends_on)}`}
                                </span>
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <p className="mt-3 font-medium">Eligible on {date(context.date)}</p>
            )}
        </section>
    );
}
