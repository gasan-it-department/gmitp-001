import ResponsiveTable from './ResponsiveTable';
import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link, router } from '@inertiajs/react';
import { ExternalLink, Plus, RotateCcw, Search, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import type { CooldownPolicy } from './Distribution/Cooldown';
import type { Status } from './Distribution/types';
import { inputClass, StateBadge, useInventoryContext } from './Inventory/components';
import { DirectoryLayout, DirectoryPagination, DirectoryPanel, DirectoryStatus } from './Inventory/DirectoryLayout';
import type { PageData } from './Inventory/types';

interface Profile {
    id: string;
    kind: 'beneficiary' | 'member';
    name: string;
    beneficiary_number: string | null;
    birth_date: string | null;
    is_active: boolean;
    archived: boolean;
    identity_verified: boolean | null;
    household: { code: string | null; head_name: string | null; barangay: string | null; is_current: boolean } | null;
}
interface ProfileRecord {
    cooldown_policy?: CooldownPolicy | null;
    id: string;
    reference: string;
    status: Status;
    program_name: string;
    created_at: string;
    actual_release_on: string | null;
    role: 'recipient' | 'filer' | 'both';
    recipient_name: string | null;
    filer_name: string | null;
    household_code: string | null;
    barangay: string | null;
    collector_name: string | null;
    lines: { item_id: string; item_name_snapshot: string; base_unit: string; quantity: string | null }[];
}
interface Total {
    program_id: string;
    program_name: string;
    item_id: string;
    item_name: string;
    base_unit: string;
    quantity: string;
}
interface Props {
    cooldowns?: {
        program_id: string;
        program_name: string;
        next_eligible_on: string;
        sources: { request_id: string; reference: string; scope: string }[];
    }[];
    profile: Profile;
    filters: Record<string, string>;
    canCreate: boolean;
    canOpenFullProfile: boolean;
    programs: { id: string; name: string; is_active: boolean }[];
    summary?: { released_count: number; latest_handover_on: string | null };
    records?: PageData<ProfileRecord>;
    totals?: Total[];
}
const roles = { recipient: 'Recipient', filer: 'Filer', both: 'Recipient and Filer' };
const statuses: Status[] = ['draft', 'pending', 'under_review', 'returned', 'approved', 'released', 'cancelled'];
const date = (value: string | null) =>
    value
        ? new Date(value.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Not recorded';
const amount = (value: string) => {
    const [whole, fraction = ''] = value.split('.');
    return whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (fraction.replace(/0+$/, '') ? '.' + fraction.replace(/0+$/, '') : '');
};

export default function RecipientProfile({
    profile,
    filters,
    canCreate,
    canOpenFullProfile,
    programs,
    summary,
    records,
    totals = [],
    cooldowns = [],
}: Props) {
    const { slug } = useInventoryContext();
    const tab = filters.tab ?? 'overview';
    const received = tab === 'received';
    const url =
        profile.kind === 'beneficiary'
            ? goodsDistribution.recipient.show.url({ municipality: slug, beneficiaryId: profile.id })
            : goodsDistribution.member.show.url({ municipality: slug, memberId: profile.id });
    const [values, setValues] = useState(filters);
    const visit = (next: Record<string, string>) => router.get(url, next, { preserveScroll: true });
    return (
        <DirectoryLayout
            title={profile.name}
            rootHref={goodsDistribution.requests.index.url({ municipality: slug })}
            actions={
                <div className="flex flex-wrap gap-2">
                    {canOpenFullProfile && (
                        <Button variant="outline" asChild>
                            <Link href={ShowBeneficiaryProfileController.url({ municipality: slug, beneficiaryId: profile.id })}>
                                <ExternalLink className="size-4" />
                                Open Full Profile
                            </Link>
                        </Button>
                    )}
                    {canCreate && (
                        <Button asChild className="bg-[#245e4f] text-white shadow-none">
                            <Link href={goodsDistribution.requests.create.url({ municipality: slug }, { query: { beneficiary_id: profile.id } })}>
                                <Plus className="size-4" />
                                New Distribution
                            </Link>
                        </Button>
                    )}
                </div>
            }
        >
            <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-muted-foreground">
                    {profile.kind === 'member'
                        ? 'Household member without beneficiary profile'
                        : (profile.beneficiary_number ?? 'No beneficiary number')}
                </span>
                <DirectoryStatus active={profile.is_active} />
                {profile.archived && <span className="text-muted-foreground">Archived registry record</span>}
            </div>
            {cooldowns.length > 0 && (
                <section
                    aria-label="Active goods cooldowns"
                    className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 shadow-none @min-[640px]/goods:px-5"
                >
                    <h2 className="flex items-center gap-2 font-semibold">
                        <TriangleAlert aria-hidden="true" className="size-4 shrink-0 text-amber-700" />
                        {cooldowns.length === 1 ? 'Active Cooldown' : 'Active Cooldowns'}
                    </h2>
                    <div className="mt-3 divide-y divide-amber-200">
                        {cooldowns.map((c) => (
                            <div key={c.program_id} className="py-3 first:pt-0 last:pb-0">
                                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                                    <p className="min-w-0 font-medium [overflow-wrap:anywhere]">{c.program_name}</p>
                                    <p className="text-xs text-amber-800">
                                        Next eligible: <span className="font-semibold whitespace-nowrap">{date(c.next_eligible_on)}</span>
                                    </p>
                                </div>
                                <ul className="mt-2 space-y-1.5 text-xs">
                                    {c.sources.map((s) => (
                                        <li key={s.request_id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                            <Link
                                                href={goodsDistribution.requests.show.url({ municipality: slug, requestId: s.request_id })}
                                                className="min-w-0 [overflow-wrap:anywhere] underline decoration-amber-300 underline-offset-2 hover:decoration-amber-800 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
                                            >
                                                {s.reference}
                                            </Link>
                                            <span className="text-amber-800">Scope: {s.scope === 'household' ? 'Household' : 'Recipient'}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            <Tabs
                value={tab}
                onValueChange={(next) => {
                    const changed: Record<string, string> = { ...filters, tab: next };
                    delete changed.page;
                    setValues(changed);
                    visit(changed);
                }}
            >
                <TabsList className="max-w-full bg-[#eaf1ed]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="received">Goods Received</TabsTrigger>
                    <TabsTrigger value="requests">Requests</TabsTrigger>
                </TabsList>
            </Tabs>
            {tab === 'overview' && (
                <>
                    <section aria-label="Registry overview" className="space-y-4 border-y border-[#dfe6e1] py-5">
                        <h2 className="text-base font-semibold">Registry information</h2>
                        <dl className="grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <dt className="text-muted-foreground">Birth date</dt>
                                <dd className="mt-1">{date(profile.birth_date)}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Identity verification</dt>
                                <dd className="mt-1">
                                    {profile.identity_verified === null
                                        ? 'No beneficiary profile'
                                        : profile.identity_verified
                                          ? 'Verified'
                                          : 'Pending verification'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">
                                    {profile.household?.is_current ? 'Current household' : 'Last recorded household'}
                                </dt>
                                <dd className="mt-1">{profile.household?.code ?? 'Not recorded'}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Household head</dt>
                                <dd className="mt-1 break-words">{profile.household?.head_name ?? 'Not recorded'}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Barangay</dt>
                                <dd className="mt-1 break-words">{profile.household?.barangay ?? 'Not recorded'}</dd>
                            </div>
                        </dl>
                    </section>
                    <section aria-label="Received history summary" className="space-y-4 py-2">
                        <h2 className="text-base font-semibold">Received history</h2>
                        <dl className="flex flex-wrap gap-x-16 gap-y-5 text-sm">
                            <div>
                                <dt className="text-muted-foreground">Released distributions</dt>
                                <dd className="mt-1 text-lg font-semibold tabular-nums">{summary?.released_count ?? 0}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Latest handover</dt>
                                <dd className="mt-1">{date(summary?.latest_handover_on ?? null)}</dd>
                            </div>
                        </dl>
                    </section>
                </>
            )}
            {tab !== 'overview' && records && (
                <>
                    <form
                        className="flex flex-wrap items-end gap-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            const next: Record<string, string> = { ...values, tab };
                            delete next.page;
                            visit(next);
                        }}
                    >
                        <label className="w-full space-y-1 text-xs sm:w-56">
                            <span>Program</span>
                            <select
                                className={inputClass}
                                value={values.program_id ?? ''}
                                onChange={(e) => setValues({ ...values, program_id: e.target.value })}
                            >
                                <option value="">All programs</option>
                                {programs.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                        {p.is_active ? '' : ' (Inactive)'}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="space-y-1 text-xs">
                            <span>{received ? 'Handover' : 'Request'} date from</span>
                            <Input type="date" value={values.from ?? ''} onChange={(e) => setValues({ ...values, from: e.target.value })} />
                        </label>
                        <label className="space-y-1 text-xs">
                            <span>To date</span>
                            <Input
                                type="date"
                                value={values.to ?? ''}
                                min={values.from || undefined}
                                onChange={(e) => setValues({ ...values, to: e.target.value })}
                            />
                        </label>
                        {!received && (
                            <>
                                <label className="space-y-1 text-xs">
                                    <span>Status</span>
                                    <select
                                        className={inputClass}
                                        value={values.status ?? ''}
                                        onChange={(e) => setValues({ ...values, status: e.target.value })}
                                    >
                                        <option value="">All statuses</option>
                                        {statuses.map((s) => (
                                            <option key={s} value={s}>
                                                {s.replaceAll('_', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="space-y-1 text-xs">
                                    <span>Role</span>
                                    <select
                                        className={inputClass}
                                        value={values.role ?? 'all'}
                                        onChange={(e) => setValues({ ...values, role: e.target.value })}
                                    >
                                        <option value="all">All roles</option>
                                        <option value="recipient">Recipient</option>
                                        <option value="filer">Filer</option>
                                    </select>
                                </label>
                            </>
                        )}
                        <Button variant="outline" size="icon" aria-label="Apply filters" title="Apply filters">
                            <Search className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Reset filters"
                            title="Reset filters"
                            onClick={() => {
                                setValues({ tab });
                                visit({ tab });
                            }}
                        >
                            <RotateCcw className="size-4" />
                        </Button>
                    </form>
                    {received && (
                        <DirectoryPanel label="Received totals" countLabel={`${totals.length} item / program groups`} toolbar={null}>
                            <ResponsiveTable className="w-full table-fixed text-left text-sm">
                                <thead className="border-y border-[#e8ede9] bg-[#f8faf9] text-xs text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Program</th>
                                        <th className="px-4 py-3 font-medium">Item</th>
                                        <th className="px-4 py-3 text-right font-medium">Received</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {totals.map((t) => (
                                        <tr key={`${t.program_id}-${t.item_id}-${t.base_unit}`} className="border-b border-[#e8ede9] last:border-0">
                                            <td className="px-4 py-3 break-words">{t.program_name}</td>
                                            <td className="px-4 py-3 break-words">{t.item_name}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {amount(t.quantity)} {t.base_unit}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </ResponsiveTable>
                            {!totals.length && <p className="p-6 text-center text-sm text-muted-foreground">No goods received for these filters.</p>}
                        </DirectoryPanel>
                    )}
                    <DirectoryPanel
                        label={received ? 'Released handovers' : 'Recipient and filer requests'}
                        countLabel={`${records.meta.total} records`}
                        toolbar={null}
                    >
                        <ResponsiveTable className="w-full table-fixed text-left text-sm">
                            <thead className="hidden border-y border-[#e8ede9] bg-[#f8faf9] text-xs text-muted-foreground @min-[800px]/goods:table-header-group">
                                <tr>
                                    {[
                                        'Reference / Program',
                                        received ? 'Handover / Household' : 'Role / Status',
                                        received ? 'Goods received' : 'Recipient / Filer',
                                        received ? 'Filer / Collector' : 'Request date / Household',
                                    ].map((h) => (
                                        <th key={h} className="px-5 py-3 font-medium">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="block @min-[800px]/goods:table-row-group">
                                {records.data.map((r) => (
                                    <tr
                                        key={r.id}
                                        className="grid grid-cols-1 border-b border-[#e8ede9] last:border-0 hover:bg-[#fafcfb] sm:grid-cols-2 @min-[800px]/goods:table-row"
                                    >
                                        <td className="min-w-0 px-5 py-4 break-words">
                                            <Link
                                                className="font-medium text-[#245e4f] hover:underline"
                                                href={goodsDistribution.requests.show.url(
                                                    { municipality: slug, requestId: r.id },
                                                    {
                                                        query: {
                                                            recipient_profile_kind: profile.kind,
                                                            recipient_profile_id: profile.id,
                                                            ...Object.fromEntries(
                                                                Object.entries(filters).map(([key, value]) => ['profile_' + key, value]),
                                                            ),
                                                            profile_tab: tab,
                                                        },
                                                    },
                                                )}
                                            >
                                                {r.reference}
                                            </Link>
                                            <p className="mt-1 text-xs text-muted-foreground">{r.program_name}</p>
                                        </td>
                                        <td className="min-w-0 px-5 py-4 break-words">
                                            {received ? (
                                                <>
                                                    <p>{date(r.actual_release_on)}</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {r.household_code} · {r.barangay}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {!r.cooldown_policy
                                                            ? 'Cooldown not recorded'
                                                            : r.cooldown_policy.enabled
                                                              ? `Next eligible ${r.cooldown_policy.ends_on}`
                                                              : 'Cooldown disabled at handover'}
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p>{roles[r.role]}</p>
                                                    <div className="mt-2">
                                                        <StateBadge value={r.status.replaceAll('_', ' ')} />
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                        <td className="min-w-0 px-5 py-4 break-words">
                                            {received ? (
                                                <ul className="space-y-2">
                                                    {r.lines.map((l) => (
                                                        <li key={l.item_id}>
                                                            <span>{l.item_name_snapshot}</span>
                                                            <span className="ml-2 font-medium whitespace-nowrap tabular-nums">
                                                                {l.quantity === null ? 'Not recorded' : amount(l.quantity)} {l.base_unit}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <>
                                                    <p>{r.recipient_name}</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">Filed by {r.filer_name}</p>
                                                </>
                                            )}
                                        </td>
                                        <td className="min-w-0 px-5 py-4 break-words">
                                            {received ? (
                                                <>
                                                    <p>
                                                        <span className="text-muted-foreground">Filer: </span>
                                                        {r.filer_name}
                                                    </p>
                                                    <p className="mt-1">
                                                        <span className="text-muted-foreground">Collector: </span>
                                                        {r.collector_name ?? 'Not recorded'}
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p>{date(r.created_at)}</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {r.household_code} · {r.barangay}
                                                    </p>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </ResponsiveTable>
                        {!records.data.length && (
                            <p className="p-8 text-center text-sm text-muted-foreground">
                                {received ? 'No released handovers found.' : 'No related requests found.'}
                            </p>
                        )}
                        <DirectoryPagination records={records} />
                    </DirectoryPanel>
                </>
            )}
        </DirectoryLayout>
    );
}
