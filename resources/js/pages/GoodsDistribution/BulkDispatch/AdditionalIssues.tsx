import { Button } from '@/components/ui/button';
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import goodsDistribution from '@/routes/goodsDistribution';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { ClipboardCheck, Plus, Send, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { GoodsDialogContent } from '../GoodsDialog';
import { DirectoryPagination } from '../Inventory/DirectoryLayout';
import { Errors, Field, inputClass, quantity, StateBadge, useInventoryContext, useInventoryMutation } from '../Inventory/components';
import ItemPicker from '../Inventory/ItemPicker';
import type { CatalogRecord } from '../Inventory/types';
import BatchCards from './BatchCards';
import type { BulkAdditionalIssue, BulkPageProps, BulkPreview } from './types';

type Command = 'create' | 'approve' | 'issue' | 'cancel';
type Line = { key: string; item: CatalogRecord | null; quantity: string };
const emptyLine = (): Line => ({ key: crypto.randomUUID(), item: null, quantity: '' });
const titles: Record<Command, string> = { create: 'Request additional goods', approve: 'Approve additional goods', issue: 'Record additional pickup', cancel: 'Cancel additional issue' };

export default function AdditionalIssues({ dispatch, permissions, allocations, today, additionalIssuesReady, additionalIssues, hasPendingAdditionalIssues }: BulkPageProps) {
    const { slug } = useInventoryContext();
    const routes = goodsDistribution.bulk.api.additional;
    const mutation = useInventoryMutation();
    const [command, setCommand] = useState<Command | null>(null);
    const [selected, setSelected] = useState<BulkAdditionalIssue | null>(null);
    const [operationKey, setOperationKey] = useState('');
    const [reason, setReason] = useState('');
    const [lines, setLines] = useState<Line[]>([]);
    const [preview, setPreview] = useState<BulkPreview | null>(null);
    const [previewError, setPreviewError] = useState('');
    const [previewBusy, setPreviewBusy] = useState(false);
    const [actualOn, setActualOn] = useState(today);
    const [confirmed, setConfirmed] = useState<string[]>([]);
    const [acknowledged, setAcknowledged] = useState(false);
    const reserved = allocations.filter((row) => row.additional_issue_id === selected?.id && row.status === 'reserved');
    const active = dispatch.status === 'dispatched';
    const open = (next: Command, issue: BulkAdditionalIssue | null = null) => {
        mutation.clearErrors(); setSelected(issue); setCommand(next); setReason(''); setLines([emptyLine()]);
        setOperationKey(crypto.randomUUID()); setPreview(null); setPreviewError(''); setActualOn(today); setConfirmed([]); setAcknowledged(false);
    };
    const review = async () => {
        if (!selected) return;
        setPreviewBusy(true); setPreviewError(''); setPreview(null);
        try {
            const response = await axios.post<{ data: BulkPreview }>(routes.preview.url({ dispatchId: dispatch.id, issueId: selected.id }),
                { version: dispatch.version }, { headers: { 'X-Municipality-Slug': slug } });
            setPreview(response.data.data);
        } catch (error) {
            setPreviewError(axios.isAxiosError(error) ? error.response?.data?.message ?? 'Could not review additional stock.' : 'Could not review additional stock.');
        } finally { setPreviewBusy(false); }
    };
    const submit = async () => {
        if (!command) return;
        const payload: Record<string, unknown> = { version: dispatch.version, operation_key: operationKey };
        if (command === 'create' || command === 'cancel') payload.reason = reason;
        if (command === 'create') payload.lines = lines.map((line) => ({ item_id: line.item?.id ?? '', quantity: line.quantity }));
        if (command === 'approve') payload.fingerprint = preview?.fingerprint;
        if (command === 'issue') Object.assign(payload, { actual_on: actualOn, custodian_acknowledged: acknowledged, confirmed_allocation_ids: confirmed });
        const url = command === 'create' ? routes.store.url({ dispatchId: dispatch.id }) : routes[command].url({ dispatchId: dispatch.id, issueId: selected!.id });
        if (await mutation.submit(url, payload)) { setCommand(null); router.reload(); }
        else if (command === 'approve') setPreview(null);
    };
    if (!additionalIssuesReady) return null;
    return <section className="min-w-0 space-y-4 border-y border-[#dfe6e1] py-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-semibold">Additional issues</h2>
            {active && permissions.prepare && <Button variant="outline" onClick={() => open('create')}><Plus className="size-4" />Add goods</Button>}
        </div>
        {hasPendingAdditionalIssues && <p className="text-sm text-amber-800">Additional goods are awaiting pickup or cancellation. This dispatch cannot be closed yet.</p>}
        {!additionalIssues?.data.length && <p className="text-sm text-muted-foreground">No additional goods requested.</p>}
        <div className="space-y-3">{additionalIssues?.data.map((issue) => <article key={issue.id} data-additional-issue-card aria-label="Additional issue" className="min-w-0 overflow-hidden rounded-md border border-[#dfe6e1] bg-white">
            <div className="space-y-4 px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"><StateBadge value={issue.status} /><div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span>Requested {issue.created_at.slice(0, 10)}</span>{issue.actual_issue_on && <span>Picked up {issue.actual_issue_on}</span>}</div></div>
                <div className="space-y-1"><p className="text-xs text-muted-foreground">Reason</p><p className="text-sm [overflow-wrap:anywhere]">{issue.reason}</p></div>
                <ul aria-label="Additional goods" className="divide-y divide-[#e8ede9] border-t border-[#e8ede9] text-sm">{issue.lines.map((line) => <li key={line.item_id} className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pt-3 not-last:pb-3"><span className="min-w-0 flex-1 basis-40 font-medium [overflow-wrap:anywhere]">{line.item_name_snapshot}</span><span className="shrink-0 font-semibold whitespace-nowrap tabular-nums">{quantity(line.quantity ?? '0')} {line.base_unit}</span></li>)}</ul>
                {issue.cancellation_reason && <div className="space-y-1 border-t border-[#e8ede9] pt-3"><p className="text-xs text-muted-foreground">Cancellation reason</p><p className="text-sm [overflow-wrap:anywhere]">{issue.cancellation_reason}</p></div>}
            </div>
            {active && ((issue.status === 'pending' && (permissions.approve || permissions.prepare)) || (issue.status === 'approved' && (permissions.dispatch || permissions.approve))) && <div className="flex flex-wrap justify-end gap-2 border-t border-[#e8ede9] px-4 py-3 sm:px-5 [&>button]:max-w-full">
                {active && issue.status === 'pending' && permissions.approve && <Button size="sm" variant="outline" onClick={() => open('approve', issue)}><ClipboardCheck className="size-4" />Review approval</Button>}
                {active && issue.status === 'approved' && permissions.dispatch && <Button size="sm" onClick={() => open('issue', issue)}><Send className="size-4" />Record pickup</Button>}
                {active && ['pending', 'approved'].includes(issue.status) && (issue.status === 'approved' ? permissions.approve : permissions.prepare) && <Button size="sm" variant="outline" onClick={() => open('cancel', issue)}><X className="size-4" />Cancel</Button>}
            </div>}
        </article>)}</div>
        {additionalIssues && <DirectoryPagination records={additionalIssues} />}
        <Dialog open={command !== null} onOpenChange={(value) => { if (!value && !mutation.busy) setCommand(null); }}>
            <GoodsDialogContent className="flex max-h-[90dvh] w-[calc(100vw-2rem)] min-w-0 flex-col overflow-hidden sm:max-w-3xl [&>*]:min-w-0">
                <DialogHeader className="shrink-0"><DialogTitle className="text-base sm:text-lg">{command ? titles[command] : ''}</DialogTitle></DialogHeader>
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto text-sm">
                    <Errors errors={mutation.errors} />{previewError && <Errors errors={{ preview: previewError }} />}
                    {command === 'create' && <><p className="text-sm font-medium">{dispatch.program_name} · {dispatch.storage_name}</p>
                        {lines.map((line, index) => <div key={line.key} className="grid gap-3 border-b border-[#e8ede9] pb-4 @min-[560px]/goods-dialog:grid-cols-[minmax(0,1fr)_9rem_2.5rem]">
                            <div className="min-w-0"><p className="mb-1.5 text-xs text-muted-foreground">Item {index + 1} *</p><ItemPicker value={line.item} programId={dispatch.program_id} searchUrl={goodsDistribution.bulk.api.items.url()} onChange={(item) => setLines(lines.map((row) => row.key === line.key ? { ...row, item } : row))} /></div>
                            <Field label={`Quantity (${line.item?.base_unit ?? 'unit'}) *`}><Input aria-label={`Additional quantity ${index + 1}`} type="number" min={line.item?.base_unit === 'piece' ? '1' : '0.001'} step={line.item?.base_unit === 'piece' ? '1' : '0.001'} value={line.quantity} onChange={(event) => setLines(lines.map((row) => row.key === line.key ? { ...row, quantity: event.target.value } : row))} /></Field>
                            <Button variant="ghost" size="icon" aria-label={`Remove additional item ${index + 1}`} title="Remove item" disabled={lines.length === 1} onClick={() => setLines(lines.filter((row) => row.key !== line.key))}><Trash2 className="size-4" /></Button>
                        </div>)}<Button size="sm" variant="outline" disabled={lines.length >= 100} onClick={() => setLines([...lines, emptyLine()])}><Plus className="size-4" />Add item</Button></>}
                    {(command === 'create' || command === 'cancel') && <Field label="Reason *"><textarea aria-label="Additional issue reason" className={`${inputClass} min-h-24 py-2`} value={reason} minLength={10} maxLength={2000} onChange={(event) => setReason(event.target.value)} /></Field>}
                    {command === 'approve' && <><p className="[overflow-wrap:anywhere]">{selected?.reason}</p><Button variant="outline" disabled={previewBusy} onClick={() => void review()}><ClipboardCheck className="size-4" />Review batches</Button>{preview && <BatchCards rows={preview.allocations} />}</>}
                    {command === 'issue' && <><Field label="Actual pickup date *"><Input aria-label="Actual pickup date" type="date" min={selected?.approved_on ?? today} max={today} value={actualOn} onChange={(event) => setActualOn(event.target.value)} /></Field>
                        <BatchCards rows={reserved} />
                        <div className="space-y-3">{reserved.map((row) => <label key={row.id} className="flex min-w-0 items-start gap-2"><input type="checkbox" className="mt-0.5 shrink-0" checked={confirmed.includes(row.id)} onChange={(event) => setConfirmed(event.target.checked ? [...confirmed, row.id] : confirmed.filter((id) => id !== row.id))} /><span className="min-w-0 [overflow-wrap:anywhere]">{row.item_name}: {quantity(row.quantity)} {row.base_unit} · {row.receipt_reference} / {row.batch_reference ?? 'No batch'}</span></label>)}</div>
                        <label className="flex items-start gap-2"><input type="checkbox" className="mt-0.5 shrink-0" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} />Custodian acknowledged these additional batches and quantities</label>
                    </>}
                </div>
                <DialogFooter className="shrink-0 flex-col-reverse gap-2 border-t border-[#e8ede9] pt-4 sm:flex-row">
                    <Button variant="outline" disabled={mutation.busy} onClick={() => setCommand(null)}>Back</Button>
                    <Button onClick={() => void submit()} disabled={mutation.busy || previewBusy || (['create', 'cancel'].includes(command ?? '') && reason.trim().length < 10) || (command === 'create' && lines.some((line) => !line.item || !/^\d+(?:\.\d{1,3})?$/.test(line.quantity) || Number(line.quantity) <= 0)) || (command === 'approve' && !preview) || (command === 'issue' && (!reserved.length || confirmed.length !== reserved.length || !acknowledged || !actualOn))}>{command ? titles[command] : 'Confirm'}</Button>
                </DialogFooter>
            </GoodsDialogContent>
        </Dialog>
    </section>;
}
