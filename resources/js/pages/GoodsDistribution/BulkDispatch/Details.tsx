import { Button } from '@/components/ui/button';
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GoodsDialogContent as DialogContent } from '../GoodsDialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import goodsDistribution from '@/routes/goodsDistribution';
import RecipientList from './RecipientList';
import RecipientHistory from './RecipientHistory';
import DispatchHistory from './DispatchHistory';
import AdditionalIssues from './AdditionalIssues';
import BatchCards from './BatchCards';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, Check, ClipboardCheck, FilePlus2, Pencil, RotateCcw, Send, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Errors, Field, inputClass, quantity, StateBadge, useInventoryContext, useInventoryMutation } from '../Inventory/components';
import { DirectoryLayout, DirectoryPagination, DirectoryPanel } from '../Inventory/DirectoryLayout';
import type { BulkCommand, BulkEvent, BulkPageProps, BulkPreview } from './types';

const titles: Record<BulkCommand, string> = {
    approve: 'Approve and reserve stock', withdraw: 'Withdraw approval', cancel: 'Cancel dispatch', dispatch: 'Record departure',
    close: 'Close dispatch', reopen: 'Reopen for correction', report: 'Report distributed goods', returnGoods: 'Record unused return', reverse: 'Reverse reconciliation',
};
const positive = (value: string) => /^\d{1,12}(?:\.\d{1,3})?$/.test(value) && Number(value) > 0;
const summed = (values: string[]) => {
    const total = values.reduce((sum, value) => {
        const [whole, fraction = ''] = value.split('.');
        return sum + BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, '0'));
    }, 0n);
    return quantity(`${total / 1000n}.${String(total % 1000n).padStart(3, '0')}`);
};

export default function Details(props: BulkPageProps) {
    const { dispatch: record, allocations, stock, permissions, today, filters, reconciliations, attachments, history } = props;
    const { slug } = useInventoryContext();
    const routes = goodsDistribution.bulk;
    const mutation = useInventoryMutation();
    const [command, setCommand] = useState<BulkCommand | null>(null);
    const [operationKey, setOperationKey] = useState('');
    const [preview, setPreview] = useState<BulkPreview | null>(null);
    const [previewBusy, setPreviewBusy] = useState(false);
    const [previewError, setPreviewError] = useState('');
    const [reason, setReason] = useState('');
    const [actualOn, setActualOn] = useState(today);
    const [reference, setReference] = useState('');
    const [notes, setNotes] = useState('');
    const [acknowledged, setAcknowledged] = useState(false);
    const [usable, setUsable] = useState(false);
    const [confirmed, setConfirmed] = useState<string[]>([]);
    const [amounts, setAmounts] = useState<Record<string, string>>({});
    const [reconciliationId, setReconciliationId] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [uploadBusy, setUploadBusy] = useState(false);
    const tab = filters.tab ?? 'goods';
    const listUrl = routes.index.url({ municipality: slug });
    const detailUrl = routes.show.url({ municipality: slug, dispatchId: record.id });
    const issued = allocations.filter((row) => row.status === 'issued');
    const reserved = allocations.filter((row) => row.status === 'reserved');
    const issuedItems = [...new Map(issued.map((row) => [row.item_id, { id: row.item_id, name: row.item_name, unit: row.base_unit }])).values()];
    const outstanding = issued.some((row) => Number(row.with_staff) > 0);
    const open = (next: BulkCommand, eventId = '') => {
        mutation.clearErrors(); setPreview(null); setPreviewError(''); setCommand(next);
        setOperationKey(crypto.randomUUID()); setReason(''); setActualOn(today); setReference(''); setNotes('');
        setAcknowledged(false); setUsable(false); setConfirmed([]); setAmounts({}); setReconciliationId(eventId);
    };
    const reconciliationLines = () => command === 'report'
        ? issuedItems.filter((row) => positive(amounts[row.id] ?? '')).map((row) => ({ item_id: row.id, quantity: amounts[row.id] }))
        : issued.filter((row) => positive(amounts[row.id] ?? '')).map((row) => ({ allocation_id: row.id, quantity: amounts[row.id] }));
    const fetchPreview = async () => {
        if (!command || !['approve', 'report', 'returnGoods'].includes(command)) return;
        setPreviewBusy(true); setPreviewError(''); setPreview(null);
        try {
            const data = command === 'approve' ? { version: record.version } : {
                version: record.version, kind: command === 'report' ? 'distribution' : 'return', actual_on: actualOn, lines: reconciliationLines(),
            };
            const url = command === 'approve' ? routes.api.approvalPreview.url({ dispatchId: record.id }) : routes.api.reconciliationPreview.url({ dispatchId: record.id });
            const response = await axios.post<{ data: BulkPreview }>(url, data, { headers: { 'X-Municipality-Slug': slug } });
            setPreview(response.data.data);
        } catch (error) {
            setPreviewError(axios.isAxiosError(error) ? error.response?.data?.message ?? 'Could not prepare the batch review.' : 'Could not prepare the batch review.');
        } finally { setPreviewBusy(false); }
    };
    const submit = async () => {
        if (!command) return;
        const payload: Record<string, unknown> = { version: record.version, operation_key: operationKey };
        if (['withdraw', 'cancel', 'reopen', 'reverse'].includes(command)) payload.reason = reason;
        if (command === 'approve' || command === 'report' || command === 'returnGoods') payload.fingerprint = preview?.fingerprint;
        if (command === 'dispatch') Object.assign(payload, { actual_on: actualOn, custodian_acknowledged: acknowledged, confirmed_allocation_ids: confirmed });
        if (command === 'report' || command === 'returnGoods') Object.assign(payload, {
            actual_on: actualOn, lines: reconciliationLines(), reference, notes, usable_confirmed: command === 'returnGoods' && usable,
        });
        if (command === 'reverse') payload.reconciliation_id = reconciliationId;
        const result = await mutation.submit(routes.api[command].url({ dispatchId: record.id }), payload);
        if (result) { setCommand(null); router.reload(); }
        else if (['approve', 'report', 'returnGoods'].includes(command)) setPreview(null);
    };
    const upload = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault(); const input = event.currentTarget.elements.namedItem('evidence') as HTMLInputElement;
        const file = input.files?.[0]; if (!file) return;
        setUploadError(''); setUploadBusy(true);
        try {
            const form = new FormData(); form.append('file', file); form.append('version', String(record.version)); form.append('operation_key', crypto.randomUUID());
            await axios.post(routes.api.attachments.url({ dispatchId: record.id }), form, { headers: { 'X-Municipality-Slug': slug } });
            router.reload();
        } catch (error) { setUploadError(axios.isAxiosError(error) ? error.response?.data?.message ?? 'Could not attach evidence.' : 'Could not attach evidence.'); }
        finally { setUploadBusy(false); }
    };
    const minDate = command === 'dispatch' ? record.approved_on ?? today : record.actual_dispatch_on ?? today;
    const mayAttach = record.status !== 'cancelled' && (['draft', 'approved'].includes(record.status) ? permissions.prepare : permissions.reconcile);
    return <DirectoryLayout rootHref={listUrl} title={record.reference} actions={<div className="flex flex-wrap gap-2">
        {record.status === 'draft' && permissions.prepare && <Button asChild variant="outline"><Link href={routes.edit.url({ municipality: slug, dispatchId: record.id })}><Pencil className="size-4" />Edit draft</Link></Button>}
        {record.status === 'draft' && permissions.approve && <Button onClick={() => open('approve')}><ClipboardCheck className="size-4" />Review approval</Button>}
        {record.status === 'approved' && permissions.dispatch && <Button onClick={() => open('dispatch')}><Send className="size-4" />Record departure</Button>}
        {record.status === 'approved' && permissions.approve && <Button variant="outline" onClick={() => open('withdraw')}><RotateCcw className="size-4" />Withdraw approval</Button>}
        {['draft', 'approved'].includes(record.status) && (record.status === 'draft' ? permissions.prepare : permissions.approve) && <Button variant="outline" onClick={() => open('cancel')}><X className="size-4" />Cancel</Button>}
        {record.status === 'dispatched' && permissions.reconcile && <><Button variant="outline" onClick={() => open('report')}>Report distributed</Button><Button variant="outline" onClick={() => open('returnGoods')}>Return unused</Button><Button disabled={outstanding || props.hasPendingAdditionalIssues} onClick={() => open('close')}><Check className="size-4" />Close</Button></>}
        {record.status === 'closed' && permissions.correct && <Button variant="outline" onClick={() => open('reopen')}><RotateCcw className="size-4" />Reopen</Button>}
    </div>}>
        <div className="flex flex-wrap items-center gap-3 text-sm"><StateBadge value={record.status} /><span>{record.program_name}</span><span className="text-muted-foreground">{record.storage_name}</span></div>
        <section className="grid gap-x-6 gap-y-4 border-y border-[#dfe6e1] py-5 text-sm @min-[520px]/goods:grid-cols-2 @min-[960px]/goods:grid-cols-4">
            <div><p className="text-xs text-muted-foreground">Requester</p><p className="mt-1 font-medium">{record.requester_name || 'Not recorded'}</p><p className="text-xs text-muted-foreground">{record.requester_role}</p></div>
            <div><p className="text-xs text-muted-foreground">Responsible custodian</p><p className="mt-1 font-medium">{record.custodian_name || 'Not assigned'}</p><p className="text-xs text-muted-foreground">{record.custodian_role} · {record.custodian_type_label}</p></div>
            <div><p className="text-xs text-muted-foreground">Destinations</p><p className="mt-1 font-medium break-words">{record.destination_barangays.join(', ') || 'Not set'}</p><p className="text-xs text-muted-foreground">{record.location_notes}</p></div>
            <div><p className="text-xs text-muted-foreground">Purpose / Reference</p><p className="mt-1 font-medium break-words">{record.purpose_label || 'Not set'}</p><p className="mt-1 break-words text-xs text-muted-foreground">{record.purpose_notes}</p><p className="text-xs text-muted-foreground">{record.paper_reference}</p></div>
        </section>
        <Tabs value={tab} onValueChange={(value) => router.get(detailUrl, { tab: value }, { preserveScroll: true })}><TabsList className="h-auto max-w-full flex-wrap justify-start bg-[#eaf1ed] shadow-none">{['goods', 'recipients', 'reconciliation', 'attachments', 'history'].map((value) => <TabsTrigger key={value} value={value} className="capitalize">{value}</TabsTrigger>)}</TabsList></Tabs>
        {tab === 'recipients' && <RecipientList {...props} />}
        {tab === 'goods' && <AdditionalIssues {...props} />}
        {tab === 'goods' && <DirectoryPanel label="Goods and custody" countLabel={`${record.lines.length} items`} toolbar={<p className="text-xs text-muted-foreground">Warehouse values reflect current stock. Issued, distributed and returned values belong to this dispatch.</p>}>
            <div className="divide-y divide-[#e8ede9] @min-[960px]/goods:hidden">{record.lines.map((line) => {
                const warehouse = stock.find((row) => row.id === line.item_id);
                const batchRows = allocations.filter((row) => row.item_id === line.item_id);
                const amount = (field: 'issued' | 'with_staff' | 'reported_distributed' | 'returned') => summed(batchRows.map((row) => row[field]));
                return <div key={line.id} className="min-w-0 space-y-2 px-5 py-4 text-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="font-medium break-words">{line.item_name_snapshot}</p><p className="text-xs text-muted-foreground">{line.item_code_snapshot}</p></div><div className="shrink-0 text-right"><p className="text-xs text-muted-foreground">Original requested</p><span className="font-semibold tabular-nums">{line.quantity ? `${quantity(line.quantity)} ${line.base_unit}` : ['draft', 'approved'].includes(record.status) ? 'Pending' : 'Not originally requested'}</span></div></div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs"><div><dt className="text-muted-foreground">Total issued</dt><dd className="font-medium tabular-nums">{amount('issued')} {line.base_unit}</dd></div><div><dt className="text-muted-foreground">Warehouse / Reserved</dt><dd className="font-medium tabular-nums">{quantity(warehouse?.balance ?? '0')} / {quantity(warehouse?.reserved ?? '0')} {line.base_unit}</dd></div><div><dt className="text-muted-foreground">Available</dt><dd className="font-medium tabular-nums">{quantity(warehouse?.available ?? '0')} {line.base_unit}</dd></div><div><dt className="text-muted-foreground">With staff</dt><dd className="font-medium tabular-nums">{amount('with_staff')} {line.base_unit}</dd></div><div><dt className="text-muted-foreground">Distributed / Returned</dt><dd className="font-medium tabular-nums">{amount('reported_distributed')} / {amount('returned')} {line.base_unit}</dd></div></dl>
                </div>;
            })}</div>
            <div className="hidden overflow-x-auto @min-[960px]/goods:block"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-y border-[#e8ede9] bg-[#f8faf9] text-xs text-muted-foreground"><tr>{['Item', 'Original requested', 'Total issued', 'Warehouse / Reserved / Available', 'With Staff', 'Reported Distributed / Returned'].map((label) => <th key={label} className="px-5 py-3 font-medium">{label}</th>)}</tr></thead>
                <tbody>{record.lines.map((line) => {
                    const warehouse = stock.find((row) => row.id === line.item_id);
                    const batchRows = allocations.filter((row) => row.item_id === line.item_id);
                    const amount = (field: 'issued' | 'with_staff' | 'reported_distributed' | 'returned') => summed(batchRows.map((row) => row[field]));
                    return <tr key={line.id} className="border-b border-[#e8ede9] last:border-0"><td className="px-5 py-4 font-medium">{line.item_name_snapshot}<p className="text-xs font-normal text-muted-foreground">{line.item_code_snapshot}</p></td><td className="px-5 py-4 tabular-nums">{line.quantity ? `${quantity(line.quantity)} ${line.base_unit}` : ['draft', 'approved'].includes(record.status) ? 'Pending' : 'Not originally requested'}</td>
                        <td className="px-5 py-4 tabular-nums">{amount('issued')} {line.base_unit}</td><td className="px-5 py-4 tabular-nums">{quantity(warehouse?.balance ?? '0')} / {quantity(warehouse?.reserved ?? '0')} / {quantity(warehouse?.available ?? '0')} {line.base_unit}</td>
                        <td className="px-5 py-4 tabular-nums">{amount('with_staff')} {line.base_unit}</td><td className="px-5 py-4 tabular-nums">{amount('reported_distributed')} / {amount('returned')} {line.base_unit}</td></tr>;
                })}</tbody></table>{!record.lines.length && <p className="py-8 text-center text-sm text-muted-foreground">Add goods to this draft before approval.</p>}</div>
            {!!allocations.length && <div className="border-t border-[#e8ede9] p-5"><h2 className="mb-3 text-sm font-semibold">Stock batches</h2><BatchCards rows={allocations} issued /></div>}
        </DirectoryPanel>}
        {tab === 'reconciliation' && <DirectoryPanel label="Reconciliation history" countLabel={`${reconciliations?.meta.total ?? 0} entries`} toolbar={<p className="text-xs text-muted-foreground">Reports use issued batches; unused returns restore the original warehouse batch.</p>}>
            {reconciliations?.data.map((event: BulkEvent) => <div key={event.id} className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e8ede9] px-5 py-4 text-sm last:border-0"><div><div className="flex items-center gap-2"><StateBadge value={event.kind} /><span className="text-muted-foreground">{event.occurred_on}</span></div><p className="mt-1 font-medium">{event.reference}</p><p className="text-xs text-muted-foreground">{event.notes}</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">{event.lines.map((line) => <span key={line.id}>{line.item_name}: {quantity(line.quantity)} {line.base_unit}</span>)}</div></div>
                {record.status === 'dispatched' && permissions.correct && event.kind !== 'reversal' && !event.reversal_id && <Button variant="outline" size="sm" onClick={() => open('reverse', event.id)}><RotateCcw className="size-4" />Reverse</Button>}
            </div>)}{!reconciliations?.data.length && <p className="py-9 text-center text-sm text-muted-foreground">No distribution or return has been reported.</p>}{reconciliations && <DirectoryPagination records={reconciliations} />}
        </DirectoryPanel>}
        {tab === 'attachments' && <DirectoryPanel label="Supporting evidence" countLabel={`${attachments?.length ?? 0} files`} toolbar={<p className="text-xs text-muted-foreground">PDF, JPEG or PNG. Existing files remain part of the record.</p>}>
            {mayAttach && <form onSubmit={(event) => void upload(event)} className="flex flex-wrap items-end gap-3 border-b border-[#e8ede9] px-5 py-4"><Field label="Add evidence"><Input name="evidence" type="file" accept="application/pdf,image/jpeg,image/png" required className="w-full sm:w-80" /></Field><Button type="submit" disabled={uploadBusy}><FilePlus2 className="size-4" />Attach file</Button></form>}
            {uploadError && <div className="px-5 py-3"><Errors errors={{ attachment: uploadError }} /></div>}
            {attachments?.map((file) => <div key={file.id} className="flex items-center justify-between gap-3 border-b border-[#e8ede9] px-5 py-3 text-sm last:border-0"><a download className="break-all text-[#245e4f] hover:underline" href={routes.attachment.url({ municipality: slug, dispatchId: record.id, mediaId: file.id })}>{file.name}</a><span className="shrink-0 text-xs text-muted-foreground">{file.created_at.slice(0, 10)}</span></div>)}
            {!attachments?.length && <p className="py-8 text-center text-sm text-muted-foreground">No attachments yet.</p>}
        </DirectoryPanel>}
        {tab === 'history' && <DirectoryPanel label="Activity history" countLabel={`${history?.data.length ?? 0} shown`} toolbar={<p className="text-xs text-muted-foreground">Changes and decisions are retained with their actor and date.</p>}>
            {history?.data.map((event) => <div key={event.id} className="border-b border-[#e8ede9] px-5 py-3 text-sm last:border-0"><p className="font-medium">{event.description}</p><p className="text-xs text-muted-foreground">{event.actor} · {new Date(event.created_at).toLocaleString()}</p><DispatchHistory properties={event.properties} choices={props.historyChoices} /><RecipientHistory properties={event.properties} /></div>)}
            {!history?.data.length && <p className="py-8 text-center text-sm text-muted-foreground">No activity recorded.</p>}
            {(history?.links.prev || history?.links.next) && <div className="flex justify-end gap-2 px-5 py-3"><Button variant="outline" disabled={!history.links.prev} onClick={() => history.links.prev && router.visit(history.links.prev)}>Previous</Button><Button variant="outline" disabled={!history.links.next} onClick={() => history.links.next && router.visit(history.links.next)}>Next</Button></div>}
        </DirectoryPanel>}
        <Dialog open={command !== null} onOpenChange={(value) => { if (!value) setCommand(null); }}><DialogContent className={`flex max-h-[90dvh] w-[calc(100vw-2rem)] min-w-0 flex-col overflow-hidden [&>*]:min-w-0 ${['approve', 'dispatch', 'report', 'returnGoods'].includes(command ?? '') ? 'sm:max-w-4xl' : 'sm:max-w-lg'}`}><DialogHeader className="min-w-0 shrink-0"><DialogTitle className="text-base break-words sm:text-lg">{command ? titles[command] : ''}</DialogTitle></DialogHeader>
            <div data-batch-review-body className="min-h-0 flex-1 space-y-4 overflow-y-auto text-sm"><Errors errors={mutation.errors} />{previewError && <Errors errors={{ preview: previewError }} />}
                {['withdraw', 'cancel', 'reopen', 'reverse'].includes(command ?? '') && <Field label="Reason *"><textarea className={`${inputClass} min-h-24 py-2`} value={reason} onChange={(event) => setReason(event.target.value)} minLength={10} maxLength={2000} /></Field>}
                {['dispatch', 'report', 'returnGoods'].includes(command ?? '') && <Field label="Actual date *"><Input type="date" min={minDate} max={today} value={actualOn} onChange={(event) => { setActualOn(event.target.value); setPreview(null); }} /></Field>}
                {command === 'dispatch' && <><BatchCards rows={reserved} /><div className="space-y-2">{reserved.map((row) => <label key={row.id} className="flex min-w-0 items-start gap-2"><input className="mt-0.5 shrink-0" type="checkbox" checked={confirmed.includes(row.id)} onChange={(event) => setConfirmed(event.target.checked ? [...confirmed, row.id] : confirmed.filter((id) => id !== row.id))} /><span className="min-w-0 [overflow-wrap:anywhere]">{row.item_name}: {quantity(row.quantity)} {row.base_unit} · {row.receipt_reference} / {row.batch_reference ?? 'No batch'}</span></label>)}</div><label className="flex items-start gap-2"><input className="mt-0.5 shrink-0" type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} />Custodian acknowledged these batches and quantities</label></>}
                {command === 'report' && <div className="space-y-3">{issuedItems.map((item) => <Field key={item.id} label={`${item.name} (${item.unit})`}><Input type="number" min="0" step={item.unit === 'piece' ? '1' : '0.001'} placeholder="Distributed quantity" value={amounts[item.id] ?? ''} onChange={(event) => { setAmounts({ ...amounts, [item.id]: event.target.value }); setPreview(null); }} /></Field>)}</div>}
                {command === 'returnGoods' && <><div className="space-y-3">{issued.filter((row) => Number(row.with_staff) > 0).map((row) => <Field key={row.id} label={`${row.item_name} · ${row.receipt_reference} / ${row.batch_reference ?? 'No batch'} · With staff ${quantity(row.with_staff)} ${row.base_unit}`}><Input type="number" min="0" step={row.base_unit === 'piece' ? '1' : '0.001'} placeholder="Unused quantity returned" value={amounts[row.id] ?? ''} onChange={(event) => { setAmounts({ ...amounts, [row.id]: event.target.value }); setPreview(null); }} /></Field>)}</div><label className="flex items-center gap-2"><input type="checkbox" checked={usable} onChange={(event) => setUsable(event.target.checked)} />Staff inspected these goods and confirmed they are fit for distribution</label></>}
                {['report', 'returnGoods'].includes(command ?? '') && <><Field label="Reference"><Input value={reference} maxLength={150} onChange={(event) => setReference(event.target.value)} /></Field><Field label="Notes"><Input value={notes} maxLength={2000} onChange={(event) => setNotes(event.target.value)} /></Field></>}
                {['approve', 'report', 'returnGoods'].includes(command ?? '') && <><Button variant="outline" disabled={previewBusy} onClick={() => void fetchPreview()}><ClipboardCheck className="size-4" />Review batches</Button>{preview && <><p className="font-medium">Confirm the exact batch quantities</p><BatchCards rows={preview.allocations} /></>}</>}
                {command === 'close' && <p>All issued batches have been reconciled. Close this dispatch?</p>}
                {command === 'reverse' && <p>The original report or return remains in history. This creates an exact opposite entry.</p>}
            </div>
            <DialogFooter className="shrink-0 flex-col-reverse gap-2 border-t border-[#e8ede9] pt-4 sm:flex-row"><Button variant="outline" onClick={() => setCommand(null)}><ArrowLeft className="size-4" />Back</Button><Button disabled={mutation.busy || (['approve', 'report', 'returnGoods'].includes(command ?? '') && !preview) || (command === 'dispatch' && (!acknowledged || confirmed.length !== reserved.length)) || (command === 'returnGoods' && !usable) || (['withdraw', 'cancel', 'reopen', 'reverse'].includes(command ?? '') && reason.trim().length < 10)} onClick={() => void submit()}>{command ? titles[command] : 'Confirm'}</Button></DialogFooter>
        </DialogContent></Dialog>
    </DirectoryLayout>;
}
