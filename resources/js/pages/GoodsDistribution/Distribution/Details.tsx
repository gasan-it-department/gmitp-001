import { Button } from '@/components/ui/button';
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GoodsDialogContent as DialogContent } from '../GoodsDialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link, router } from '@inertiajs/react';
import { Check, ChevronRight, ClipboardCheck, HandHeart, Pencil, RefreshCw, RotateCcw, Send, X } from 'lucide-react';
import { useState } from 'react';
import { Errors, Field, inputClass, quantity, StateBadge, useInventoryContext, useInventoryMutation } from '../Inventory/components';
import { DirectoryLayout, DirectoryPanel } from '../Inventory/DirectoryLayout';
import { RequestPersonLink } from '../RecipientProfileLinks';
import { CooldownNotice, useCooldownContext } from './Cooldown';
import DocumentChecklist from './DocumentReview';
import HistoryChanges from './HistoryChanges';
import HouseholdSyncDialog from './HouseholdSyncDialog';
import type { GoodsRequest, History, HouseholdSyncPreview, Permissions, RequirementsUpdate } from './types';

type Command = 'submit' | 'review' | 'return' | 'resubmit' | 'approve' | 'cancel' | 'release' | 'authorize_cooldown';
export default function Details({
    request: r,
    permissions,
    history,
    previousDistributions,
    today,
    filters,
    householdSync,
    requirementsUpdate = null,
}: {
    request: GoodsRequest;
    permissions: Permissions;
    history: History;
    previousDistributions: GoodsRequest[];
    today: string;
    filters: Record<string, string>;
    householdSync: HouseholdSyncPreview | null;
    requirementsUpdate?: RequirementsUpdate | null;
}) {
    const { slug } = useInventoryContext();
    const routes = goodsDistribution.requests;
    const mutation = useInventoryMutation();
    const [command, setCommand] = useState<Command | null>(null);
    const [syncOpen, setSyncOpen] = useState(false);
    const [operationKey, setOperationKey] = useState('');
    const [reason, setReason] = useState('');
    const [cooldownReason, setCooldownReason] = useState('');
    const [reviewed, setReviewed] = useState(false);
    const [release, setRelease] = useState({
        actual_release_on: today,
        collector_type: 'recipient',
        collector_name: '',
        collector_relationship: '',
        collector_id_type: '',
        collector_id_last_four: '',
        identity_inspected: false,
        acknowledgement_confirmed: false,
        acknowledgement_reference: '',
        notes: '',
    });
    const [confirmed, setConfirmed] = useState<string[]>([]);
    const cooldown = useCooldownContext({
        requestId: r.id,
        version: r.version,
        date: r.status === 'approved' ? release.actual_release_on : today,
        enabled: !['released', 'cancelled'].includes(r.status),
    });
    const tab = filters.tab ?? 'goods';
    const profileContext = Object.fromEntries(
        Object.entries(filters).filter(([key]) => key.startsWith('profile_') || key.startsWith('recipient_profile_')),
    );
    const profileFilters = Object.fromEntries(
        Object.entries(profileContext)
            .filter(([key]) => key.startsWith('profile_'))
            .map(([key, value]) => [key.slice(8), value]),
    );
    const returnProfile =
        filters.recipient_profile_id && ['beneficiary', 'member'].includes(filters.recipient_profile_kind)
            ? filters.recipient_profile_kind === 'member'
                ? goodsDistribution.member.show.url({ municipality: slug, memberId: filters.recipient_profile_id }, { query: profileFilters })
                : goodsDistribution.recipient.show.url({ municipality: slug, beneficiaryId: filters.recipient_profile_id }, { query: profileFilters })
            : null;
    const active = r.allocations.filter((a) => a.status === 'reserved');
    const canSync =
        r.status === 'under_review'
            ? permissions.process
            : r.status === 'draft'
              ? permissions.intake || permissions.process
              : ['pending', 'returned'].includes(r.status) && permissions.intake;
    const titles: Record<Command, string> = {
        submit: 'Submit for review',
        review: 'Start review',
        return: 'Return for correction',
        resubmit: 'Resubmit request',
        approve: 'Approve and reserve stock',
        cancel: 'Cancel request',
        release: 'Record goods handover',
        authorize_cooldown: 'Authorize cooldown exception',
    };
    const open = (c: Command) => {
        mutation.clearErrors();
        setCommand(c);
        setOperationKey(crypto.randomUUID());
        setReason('');
        setCooldownReason('');
        setReviewed(false);
        setConfirmed([]);
    };
    const submit = async () => {
        if (!command) return;
        const endpoint = routes.api[command];
        const result = await mutation.submit(endpoint.url({ requestId: r.id }), {
            version: r.version,
            operation_key: operationKey,
            ...(['return', 'cancel'].includes(command) ? { reason } : {}),
            ...(command === 'approve' ? { recipient_reviewed: reviewed } : {}),
            ...(['approve', 'authorize_cooldown'].includes(command)
                ? { cooldown_fingerprint: cooldown.context?.fingerprint, cooldown_exception_reason: cooldownReason || null }
                : {}),
            ...(command === 'authorize_cooldown' ? { actual_release_on: release.actual_release_on } : {}),
            ...(command === 'release' ? { ...release, confirmed_allocation_ids: confirmed } : {}),
        });
        if (result) {
            setCommand(null);
            router.reload();
        } else if (command && ['approve', 'release', 'authorize_cooldown'].includes(command)) {
            cooldown.refresh();
            setReviewed(false);
            setCooldownReason('');
        }
    };
    return (
        <DirectoryLayout
            rootHref={routes.index.url({ municipality: slug })}
            title={r.reference}
            actions={
                <div className="flex flex-wrap gap-2">
                    {((permissions.intake && ['draft', 'pending', 'returned'].includes(r.status)) ||
                        (permissions.process && r.status === 'draft')) && (
                        <Button variant="outline" asChild>
                            <Link href={routes.edit.url({ municipality: slug, requestId: r.id })}>
                                <Pencil className="size-4" />
                                {r.status === 'draft' ? 'Complete draft' : 'Edit'}
                            </Link>
                        </Button>
                    )}
                    {r.status === 'draft' && (permissions.intake || permissions.process) && (
                        <Button
                            variant="outline"
                            disabled={!r.lines.length || r.lines.some((line) => line.quantity === null)}
                            onClick={() => open('submit')}
                        >
                            <Send className="size-4" />
                            Submit for review
                        </Button>
                    )}
                    {permissions.process && r.status === 'pending' && (
                        <Button variant="outline" onClick={() => open('review')}>
                            <ClipboardCheck className="size-4" />
                            Start review
                        </Button>
                    )}
                    {permissions.intake && r.status === 'returned' && (
                        <Button variant="outline" onClick={() => open('resubmit')}>
                            <Send className="size-4" />
                            Resubmit
                        </Button>
                    )}
                    {permissions.decide && r.status === 'under_review' && (
                        <Button onClick={() => open('approve')} className="bg-[#245e4f] text-white">
                            <Check className="size-4" />
                            Approve
                        </Button>
                    )}
                    {((permissions.process && ['pending', 'under_review'].includes(r.status)) || (permissions.decide && r.status === 'approved')) && (
                        <Button variant="outline" onClick={() => open('return')}>
                            <RotateCcw className="size-4" />
                            Return
                        </Button>
                    )}
                    {permissions.decide && !['released', 'cancelled'].includes(r.status) && (
                        <Button variant="outline" onClick={() => open('cancel')}>
                            <X className="size-4" />
                            Cancel request
                        </Button>
                    )}
                    {permissions.release && r.status === 'approved' && (
                        <Button onClick={() => open('release')} className="bg-[#245e4f] text-white">
                            <HandHeart className="size-4" />
                            Record handover
                        </Button>
                    )}
                    {permissions.decide && r.status === 'approved' && cooldown.context?.blocked && !cooldown.context.authorization_current && (
                        <Button variant="outline" onClick={() => open('authorize_cooldown')}>
                            Authorize cooldown exception
                        </Button>
                    )}
                </div>
            }
        >
            {returnProfile && (
                <Link href={returnProfile} className="text-sm font-medium text-[#245e4f] hover:underline">
                    Back to goods profile
                </Link>
            )}
            <div className="flex flex-wrap items-center gap-3 text-sm">
                <StateBadge value={r.status.replaceAll('_', ' ')} />
                <span>{r.program_name}</span>
                <span className="text-muted-foreground">{r.storage_name}</span>
            </div>
            <dl className="grid gap-4 border-y border-[#e8ede9] py-4 text-sm sm:grid-cols-3">
                <div>
                    <dt className="text-muted-foreground">Recipient</dt>
                    <dd className="font-medium break-words">
                        <RequestPersonLink slug={slug} request={r} role="recipient" />
                    </dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">Filer</dt>
                    <dd className="break-words">
                        <RequestPersonLink slug={slug} request={r} role="filer" />
                    </dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">Household</dt>
                    <dd>{r.snapshot.household_code}</dd>
                </div>
            </dl>
            {r.transition_reason && <p className="text-sm text-amber-800">{r.transition_reason}</p>}
            <CooldownNotice {...cooldown} />
            {r.status === 'released' && (
                <p className="text-xs text-muted-foreground">
                    {!r.cooldown_policy
                        ? 'Cooldown not recorded'
                        : r.cooldown_policy.enabled
                          ? `Recorded cooldown: ${r.cooldown_policy.duration} ${r.cooldown_policy.unit} per ${r.cooldown_policy.scope}. Next eligible ${r.cooldown_policy.ends_on}.${r.cooldown_policy.exception_used ? ' Released with an authorized exception.' : ''}`
                          : 'Cooldown disabled at this handover'}
                </p>
            )}
            {previousDistributions.length > 0 && (
                <DirectoryPanel label="Previous household distributions" countLabel={`${previousDistributions.length} recent records`} toolbar={null}>
                    <ul className="divide-y divide-[#e8ede9] border-t border-[#e8ede9]">
                        {previousDistributions.map((p) => (
                            <li key={p.id}>
                                <Link
                                    href={routes.show.url({ municipality: slug, requestId: p.id })}
                                    className="flex items-center gap-3 px-5 py-4 text-sm hover:bg-[#f8faf9] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#245e4f]"
                                >
                                    <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">
                                        <div className="col-span-2 min-w-0 sm:col-span-1">
                                            <p className="font-medium [overflow-wrap:anywhere] text-[#245e4f]">{p.reference}</p>
                                            <p className="mt-1 text-xs [overflow-wrap:anywhere] text-muted-foreground">{p.program_name}</p>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">Recipient</p>
                                            <p className="mt-1 [overflow-wrap:anywhere]">{(p.handover_snapshot ?? p.snapshot).subject.name}</p>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">Handover date</p>
                                            <p className="mt-1">
                                                {p.actual_release_on ? (
                                                    <time dateTime={p.actual_release_on}>
                                                        {new Date(p.actual_release_on + 'T00:00:00').toLocaleDateString('en-PH', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </time>
                                                ) : (
                                                    'Not recorded'
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-[#75827c]" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </DirectoryPanel>
            )}
            <Tabs
                value={tab}
                onValueChange={(value) =>
                    router.get(routes.show.url({ municipality: slug, requestId: r.id }), { ...profileContext, tab: value }, { preserveScroll: true })
                }
            >
                <TabsList className="max-w-full bg-[#eaf1ed]">
                    {['goods', 'household', 'documents', 'history'].map((t) => (
                        <TabsTrigger className="capitalize" key={t} value={t}>
                            {t}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
            {tab === 'goods' && (
                <>
                    <DirectoryPanel
                        label={r.status === 'draft' ? 'Draft goods' : 'Approved / requested goods'}
                        countLabel={`${r.lines.length} items`}
                        toolbar={null}
                    >
                        <div className="divide-y divide-[#e8ede9]">
                            {r.lines.map((l) => (
                                <div key={l.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-sm">
                                    <span className="min-w-0 break-words">
                                        {l.item_name_snapshot}
                                        <span className="mt-1 block text-xs text-muted-foreground">{l.item_code_snapshot}</span>
                                    </span>
                                    <strong className="shrink-0 tabular-nums">
                                        {l.quantity === null ? 'Quantity not set' : `${quantity(l.quantity)} ${l.base_unit}`}
                                    </strong>
                                </div>
                            ))}
                        </div>
                        {!r.lines.length && <p className="px-5 py-8 text-sm text-muted-foreground">Goods not yet specified.</p>}
                    </DirectoryPanel>
                    {r.allocations.length > 0 && (
                        <DirectoryPanel label="Stock allocations" countLabel={`${r.allocations.length} entries`} toolbar={null}>
                            <div className="divide-y divide-[#e8ede9]">
                                {r.allocations.map((a) => (
                                    <div className="grid gap-2 px-5 py-4 text-sm sm:grid-cols-3" key={a.id}>
                                        <span>
                                            {a.item_name}
                                            <span className="block text-xs text-muted-foreground">
                                                {a.batch_reference || a.receipt_reference} · Expiry {a.expires_on ?? 'None'}
                                            </span>
                                        </span>
                                        <span>
                                            {quantity(a.quantity)} {a.base_unit}
                                        </span>
                                        <div className="justify-self-start">
                                            <StateBadge value={a.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </DirectoryPanel>
                    )}
                    {r.status === 'released' && (
                        <section className="space-y-2 border-y border-[#e8ede9] py-4 text-sm">
                            <h2 className="font-semibold">Handover</h2>
                            <p>
                                {r.collector_name} · {r.collector_type}
                            </p>
                            {r.collector_relationship && (
                                <p>
                                    {r.collector_relationship} · {r.collector_id_type} · ID ending {r.collector_id_last_four}
                                </p>
                            )}
                            <p>
                                {r.actual_release_on} · {r.acknowledgement_reference}
                            </p>
                            {r.release_notes && <p>{r.release_notes}</p>}
                        </section>
                    )}
                    {r.notes && <p className="text-sm text-muted-foreground">{r.notes}</p>}
                </>
            )}
            {tab === 'household' && (
                <DirectoryPanel
                    label="Household recorded for this request"
                    countLabel={r.snapshot.household_code}
                    toolbar={
                        householdSync ? (
                            <>
                                <p
                                    className={`min-w-0 text-sm ${householdSync.error || householdSync.changed ? 'text-amber-800' : 'text-emerald-700'}`}
                                >
                                    {householdSync.error ||
                                        (householdSync.changed
                                            ? 'Registry changes are not yet reflected on this request.'
                                            : 'Household snapshot is up to date.')}
                                </p>
                                {canSync && (
                                    <Button
                                        variant="outline"
                                        disabled={!householdSync.changed || !!householdSync.error}
                                        onClick={() => setSyncOpen(true)}
                                    >
                                        <RefreshCw className="size-4" /> Sync household
                                    </Button>
                                )}
                            </>
                        ) : null
                    }
                >
                    <div className="px-5 py-4 text-sm">
                        <p>{[r.snapshot.street, r.snapshot.barangay].filter(Boolean).join(', ')}</p>
                        <p className={r.snapshot.identity_verified ? 'text-emerald-700' : 'text-amber-700'}>
                            {r.snapshot.identity_verified ? 'Registry identity verified' : 'Registry identity pending'}
                        </p>
                    </div>
                    <div className="divide-y divide-[#e8ede9]">
                        {r.snapshot.roster.map((m) => (
                            <div key={m.id} className="grid gap-2 px-5 py-3 text-sm sm:grid-cols-3">
                                <span className="break-words">{m.name}</span>
                                <span className="capitalize">{m.relationship?.replaceAll('_', ' ')}</span>
                                <span>{m.birth_date}</span>
                            </div>
                        ))}
                    </div>
                </DirectoryPanel>
            )}
            {tab === 'documents' && <DocumentChecklist request={r} permissions={permissions} update={requirementsUpdate} />}
            {tab === 'history' && (
                <section className="divide-y divide-[#e8ede9]">
                    {history.data.map((h) => (
                        <article className="py-4 text-sm" key={h.id}>
                            <h2 className="font-medium">{h.description}</h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {h.actor} · {new Date(h.created_at).toLocaleString()}
                            </p>
                            {h.properties && (
                                <details className="mt-2">
                                    <summary className="cursor-pointer text-xs text-[#245e4f]">Change details</summary>
                                    <HistoryChanges properties={h.properties} />
                                </details>
                            )}
                        </article>
                    ))}
                    <div className="flex gap-3 py-4">
                        {history.previous && <Link href={history.previous + '&tab=history'}>Previous</Link>}
                        {history.next && <Link href={history.next + '&tab=history'}>Next</Link>}
                    </div>
                </section>
            )}
            {syncOpen && householdSync && (
                <HouseholdSyncDialog
                    key={`${r.version}-${householdSync.fingerprint}`}
                    request={r}
                    preview={householdSync}
                    onClose={() => setSyncOpen(false)}
                />
            )}
            <Dialog
                open={command !== null}
                onOpenChange={(value) => {
                    if (!value && !mutation.busy) setCommand(null);
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{command && titles[command]}</DialogTitle>
                    </DialogHeader>
                    <Errors errors={mutation.errors} />
                    {command && ['approve', 'release', 'authorize_cooldown'].includes(command) && <CooldownNotice {...cooldown} />}
                    {command === 'authorize_cooldown' && (
                        <Field label="Actual handover date">
                            <Input
                                type="date"
                                min={r.approved_on ?? undefined}
                                max={today}
                                value={release.actual_release_on}
                                onChange={(e) => setRelease({ ...release, actual_release_on: e.target.value })}
                            />
                        </Field>
                    )}
                    {(command === 'authorize_cooldown' || (command === 'approve' && cooldown.context?.blocked)) && (
                        <Field label="Cooldown exception reason">
                            <textarea
                                className={`${inputClass} h-24 py-2`}
                                required
                                minLength={10}
                                maxLength={1000}
                                value={cooldownReason}
                                onChange={(e) => setCooldownReason(e.target.value)}
                            />
                        </Field>
                    )}
                    {command === 'release' && cooldown.context?.blocked && !cooldown.context.authorization_current && permissions.decide && (
                        <Button variant="outline" onClick={() => open('authorize_cooldown')}>
                            Authorize cooldown exception
                        </Button>
                    )}
                    {command && ['return', 'cancel'].includes(command) && (
                        <Field label="Reason">
                            <textarea
                                required
                                minLength={10}
                                maxLength={1000}
                                className={`${inputClass} h-24 py-2`}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </Field>
                    )}
                    {command === 'approve' && (
                        <label className="flex items-start gap-2 text-sm">
                            <input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} />
                            Recipient identity, household, requested quantities, and required documents reviewed
                        </label>
                    )}
                    {command === 'release' && (
                        <div className="space-y-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="Actual handover date">
                                    <Input
                                        type="date"
                                        min={r.approved_on ?? undefined}
                                        max={today}
                                        value={release.actual_release_on}
                                        onChange={(e) => setRelease({ ...release, actual_release_on: e.target.value })}
                                    />
                                </Field>
                                <Field label="Collector">
                                    <select
                                        className={inputClass}
                                        value={release.collector_type}
                                        onChange={(e) =>
                                            setRelease({
                                                ...release,
                                                collector_type: e.target.value,
                                                collector_name: '',
                                                collector_relationship: '',
                                                collector_id_type: '',
                                                collector_id_last_four: '',
                                                identity_inspected: false,
                                                acknowledgement_confirmed: false,
                                            })
                                        }
                                    >
                                        <option value="recipient">Recipient</option>
                                        <option value="representative">Representative</option>
                                    </select>
                                </Field>
                            </div>
                            {release.collector_type === 'representative' && (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {(['collector_name', 'collector_relationship', 'collector_id_type', 'collector_id_last_four'] as const).map(
                                        (f) => (
                                            <Field
                                                key={f}
                                                label={
                                                    {
                                                        collector_name: 'Representative full name',
                                                        collector_relationship: 'Relationship to recipient',
                                                        collector_id_type: 'Inspected ID type',
                                                        collector_id_last_four: 'Last four ID characters',
                                                    }[f]
                                                }
                                            >
                                                <Input
                                                    required
                                                    value={release[f]}
                                                    maxLength={f === 'collector_id_last_four' ? 4 : 255}
                                                    onChange={(e) => setRelease({ ...release, [f]: e.target.value })}
                                                />
                                            </Field>
                                        ),
                                    )}
                                </div>
                            )}
                            <Field label="Acknowledgement reference">
                                <Input
                                    required
                                    value={release.acknowledgement_reference}
                                    onChange={(e) => setRelease({ ...release, acknowledgement_reference: e.target.value })}
                                />
                            </Field>
                            <fieldset className="space-y-2 border-y border-[#e8ede9] py-3">
                                <legend className="text-sm font-medium">Confirm actual batches and full quantities</legend>
                                {active.map((a) => (
                                    <label key={a.id} className="flex items-start gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={confirmed.includes(a.id)}
                                            onChange={(e) =>
                                                setConfirmed(e.target.checked ? [...confirmed, a.id] : confirmed.filter((id) => id !== a.id))
                                            }
                                        />
                                        <span>
                                            {a.item_name} · {quantity(a.quantity)} {a.base_unit}
                                            <span className="block text-xs text-muted-foreground">
                                                {a.batch_reference || a.receipt_reference} · Expiry {a.expires_on ?? 'None'}
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </fieldset>
                            {(['identity_inspected', 'acknowledgement_confirmed'] as const).map((f) => (
                                <label key={f} className="flex items-start gap-2 text-sm">
                                    <input type="checkbox" checked={release[f]} onChange={(e) => setRelease({ ...release, [f]: e.target.checked })} />
                                    {f === 'identity_inspected' ? 'Collector identity inspected' : 'Handover acknowledgement confirmed'}
                                </label>
                            ))}
                            <Field label="Notes">
                                <textarea
                                    className={`${inputClass} h-20 py-2`}
                                    value={release.notes}
                                    onChange={(e) => setRelease({ ...release, notes: e.target.value })}
                                />
                            </Field>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" disabled={mutation.busy} onClick={() => setCommand(null)}>
                            Close
                        </Button>
                        <Button
                            disabled={
                                mutation.busy ||
                                (command === 'authorize_cooldown' && !cooldown.context?.blocked) ||
                                (command &&
                                    ['approve', 'release', 'authorize_cooldown'].includes(command) &&
                                    (cooldown.loading || !!cooldown.error || !cooldown.context)) ||
                                ((command === 'authorize_cooldown' || (command === 'approve' && cooldown.context?.blocked)) &&
                                    cooldownReason.trim().length < 10) ||
                                (command === 'release' && cooldown.context?.blocked && !cooldown.context.authorization_current) ||
                                (command === 'approve' && !reviewed) ||
                                (command === 'release' &&
                                    (!release.identity_inspected || !release.acknowledgement_confirmed || confirmed.length !== active.length))
                            }
                            onClick={() => void submit()}
                        >
                            {mutation.busy ? 'Saving' : command && titles[command]}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DirectoryLayout>
    );
}
