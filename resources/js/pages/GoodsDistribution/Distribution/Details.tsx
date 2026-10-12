import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link, router } from '@inertiajs/react';
import { Check, ClipboardCheck, HandHeart, Pencil, RefreshCw, RotateCcw, Send, X } from 'lucide-react';
import { useState } from 'react';
import { Errors, Field, inputClass, quantity, StateBadge, useInventoryContext, useInventoryMutation } from '../Inventory/components';
import { DirectoryLayout, DirectoryPanel } from '../Inventory/DirectoryLayout';
import DocumentReview from './DocumentReview';
import HistoryChanges from './HistoryChanges';
import HouseholdSyncDialog from './HouseholdSyncDialog';
import type { GoodsRequest, History, HouseholdSyncPreview, Permissions } from './types';

type Command = 'review' | 'return' | 'resubmit' | 'approve' | 'cancel' | 'release';
export default function Details({
    request: r,
    permissions,
    history,
    previousDistributions,
    today,
    filters,
    householdSync,
}: {
    request: GoodsRequest;
    permissions: Permissions;
    history: History;
    previousDistributions: GoodsRequest[];
    today: string;
    filters: Record<string, string>;
    householdSync: HouseholdSyncPreview | null;
}) {
    const { slug } = useInventoryContext();
    const routes = goodsDistribution.requests;
    const mutation = useInventoryMutation();
    const [command, setCommand] = useState<Command | null>(null);
    const [syncOpen, setSyncOpen] = useState(false);
    const [operationKey, setOperationKey] = useState('');
    const [reason, setReason] = useState('');
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
    const tab = filters.tab ?? 'goods';
    const active = r.allocations.filter((a) => a.status === 'reserved');
    const canSync = r.status === 'under_review' ? permissions.process : ['pending', 'returned'].includes(r.status) && permissions.intake;
    const titles: Record<Command, string> = {
        review: 'Start review',
        return: 'Return for correction',
        resubmit: 'Resubmit request',
        approve: 'Approve and reserve stock',
        cancel: 'Cancel request',
        release: 'Record goods handover',
    };
    const open = (c: Command) => {
        mutation.clearErrors();
        setCommand(c);
        setOperationKey(crypto.randomUUID());
        setReason('');
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
            ...(command === 'release' ? { ...release, confirmed_allocation_ids: confirmed } : {}),
        });
        if (result) {
            setCommand(null);
            router.reload();
        }
    };
    return (
        <DirectoryLayout
            rootHref={routes.index.url({ municipality: slug })}
            title={r.reference}
            actions={
                <div className="flex flex-wrap gap-2">
                    {permissions.intake && ['pending', 'returned'].includes(r.status) && (
                        <Button variant="outline" asChild>
                            <Link href={routes.edit.url({ municipality: slug, requestId: r.id })}>
                                <Pencil className="size-4" />
                                Edit
                            </Link>
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
                </div>
            }
        >
            <div className="flex flex-wrap items-center gap-3 text-sm">
                <StateBadge value={r.status.replaceAll('_', ' ')} />
                <span>{r.program_name}</span>
                <span className="text-muted-foreground">{r.storage_name}</span>
            </div>
            <dl className="grid gap-4 border-y border-[#e8ede9] py-4 text-sm sm:grid-cols-3">
                <div>
                    <dt className="text-muted-foreground">Recipient</dt>
                    <dd className="font-medium break-words">{r.snapshot.subject.name}</dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">Filer</dt>
                    <dd className="break-words">{r.snapshot.filer.name}</dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">Household</dt>
                    <dd>{r.snapshot.household_code}</dd>
                </div>
            </dl>
            {r.transition_reason && <p className="text-sm text-amber-800">{r.transition_reason}</p>}
            {previousDistributions.length > 0 && (
                <section className="border-l-2 border-amber-400 pl-3 text-sm">
                    <p className="font-medium text-amber-900">Previous household distributions</p>
                    <div className="mt-2 flex flex-wrap gap-3">
                        {previousDistributions.map((p) => (
                            <Link className="text-[#245e4f] underline" key={p.id} href={routes.show.url({ municipality: slug, requestId: p.id })}>
                                {p.reference} · {p.actual_release_on}
                            </Link>
                        ))}
                    </div>
                </section>
            )}
            <Tabs
                value={tab}
                onValueChange={(value) =>
                    router.get(routes.show.url({ municipality: slug, requestId: r.id }), { tab: value }, { preserveScroll: true })
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
                    <DirectoryPanel label="Approved / requested goods" countLabel={`${r.lines.length} items`} toolbar={null}>
                        <div className="divide-y divide-[#e8ede9]">
                            {r.lines.map((l) => (
                                <div key={l.id} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                                    <span className="min-w-0 break-words">
                                        {l.item_name_snapshot}
                                        <span className="mt-1 block text-xs text-muted-foreground">{l.item_code_snapshot}</span>
                                    </span>
                                    <strong className="shrink-0 tabular-nums">
                                        {quantity(l.quantity)} {l.base_unit}
                                    </strong>
                                </div>
                            ))}
                        </div>
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
            {tab === 'documents' && (
                <div className="space-y-4">
                    {r.documents.map((d) => (
                        <DocumentReview key={`${d.id}-${r.version}`} document={d} request={r} permissions={permissions} />
                    ))}
                    {!r.documents.length && (
                        <p className="py-8 text-sm text-muted-foreground">No document requirements were configured when this request was filed.</p>
                    )}
                </div>
            )}
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
