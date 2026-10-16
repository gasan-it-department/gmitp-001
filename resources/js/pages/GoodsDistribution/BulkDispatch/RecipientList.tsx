import { Button } from '@/components/ui/button';
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GoodsDialogContent as DialogContent } from '../GoodsDialog';
import { Input } from '@/components/ui/input';
import goodsDistribution from '@/routes/goodsDistribution';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle, Check, Eye, FilePenLine, Loader2, Plus, Save, Search, Trash2, UserRoundPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Errors, Field, inputClass, useInventoryContext } from '../Inventory/components';
import { DirectoryPagination, DirectoryPanel } from '../Inventory/DirectoryLayout';
import type { BulkPageProps, BulkRecipient } from './types';

type Mode = 'create' | 'view' | 'complete' | 'correct' | 'void';
type Header = 'first_name' | 'middle_name' | 'last_name' | 'suffix' | 'barangay' | 'purok' | 'received_on' | 'collector_name' | 'collector_relationship' | 'paper_reference' | 'paper_row' | 'acknowledgement' | 'remarks';
const labels: Record<Header, string> = {
    first_name: 'First name', middle_name: 'Middle name', last_name: 'Last name', suffix: 'Suffix',
    barangay: 'Barangay', purok: 'Purok / Sitio', received_on: 'Actual receipt date',
    collector_name: 'Collector if different', collector_relationship: 'Collector relationship', paper_reference: 'Paper sheet reference',
    paper_row: 'Paper row', acknowledgement: 'Acknowledgement on paper', remarks: 'Remarks',
};
const empty = (): Record<Header, string> => Object.fromEntries(Object.keys(labels).map((key) => [key, ''])) as Record<Header, string>;
const quantity = (value: string) => value.replace(/\.000$/, '').replace(/(\.\d*?)0+$/, '$1');
type DraftLine = { key: string; bulk_dispatch_line_id: string; quantity: string; existing: boolean };
type Candidate = { id: string; full_name: string; barangay: string | null; received_on: string | null; paper_reference: string | null; paper_row: string | null };

export default function RecipientList({ dispatch, permissions, today, filters, recipientReady, recipients, recipientCoverage = [], recipientCounts, recipientBarangays = [] }: BulkPageProps) {
    const { slug } = useInventoryContext();
    const routes = goodsDistribution.bulk.api.recipients;
    const url = goodsDistribution.bulk.show.url({ municipality: slug, dispatchId: dispatch.id });
    const writable = ['dispatched', 'closed'].includes(dispatch.status);
    const [mode, setMode] = useState<Mode | null>(null);
    const [selected, setSelected] = useState<BulkRecipient | null>(null);
    const [header, setHeader] = useState(empty);
    const [lines, setLines] = useState<DraftLine[]>([]);
    const [reason, setReason] = useState('');
    const [version, setVersion] = useState(dispatch.version);
    const [key, setKey] = useState(() => crypto.randomUUID());
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [candidateError, setCandidateError] = useState(false);
    const recipientName = [header.first_name, header.middle_name, header.last_name, header.suffix].map((part) => part.trim()).filter(Boolean).join(' ');
    const hasRequiredNames = !!header.first_name.trim() && !!header.last_name.trim();
    useEffect(() => setVersion(dispatch.version), [dispatch.version]);
    useEffect(() => {
        setCandidates([]);
        setCandidateError(false);
        if (!mode || ['view', 'void'].includes(mode) || recipientName.length < 2) return;
        const controller = new AbortController();
        const timer = window.setTimeout(() => {
            axios.get<{ data: Candidate[] }>(routes.candidates.url({ dispatchId: dispatch.id }), {
                params: { search: recipientName, exclude_id: selected?.id }, headers: { 'X-Municipality-Slug': slug }, signal: controller.signal,
            }).then((response) => setCandidates(response.data.data)).catch((error) => { if (!axios.isCancel(error)) setCandidateError(true); });
        }, 350);
        return () => { window.clearTimeout(timer); controller.abort(); };
    }, [recipientName, mode, selected?.id, dispatch.id, slug, routes.candidates]);

    const open = (next: Mode, person: BulkRecipient | null = null) => {
        setSelected(person);
        setHeader(person ? Object.fromEntries(Object.keys(labels).map((field) => [field, person[field as Header] ?? ''])) as Record<Header, string> : empty());
        setLines(person?.lines.map((line) => ({ key: line.id, bulk_dispatch_line_id: line.bulk_dispatch_line_id, quantity: line.quantity, existing: true })) ?? []);
        setReason(''); setErrors({}); setKey(crypto.randomUUID()); setMode(next);
    };
    const submit = async (another = false) => {
        if (!mode || mode === 'view') return;
        setBusy(true); setErrors({});
        const args = { dispatchId: dispatch.id, recipientId: selected?.id ?? '' };
        const endpoint = mode === 'create' ? routes.store.url({ dispatchId: dispatch.id }) : mode === 'complete' ? routes.complete.url(args) : mode === 'correct' ? routes.correct.url(args) : routes.void.url(args);
        const data = { version, ...(mode === 'create' ? { submission_key: key } : { operation_key: key, recipient_version: selected?.version }),
            ...(mode === 'void' ? { reason } : { ...header, lines: lines.map((line) => ({ bulk_dispatch_line_id: line.bulk_dispatch_line_id, quantity: line.quantity })), ...(mode === 'correct' ? { reason } : {}) }) };
        try {
            const response = await axios.request<{ data: BulkRecipient; dispatch_version: number }>({ url: endpoint, method: mode === 'complete' || mode === 'correct' ? 'patch' : 'post', data, headers: { 'X-Municipality-Slug': slug } });
            setVersion(response.data.dispatch_version);
            if (another) { open('create'); } else setMode(null);
            router.reload({ only: ['dispatch', 'recipients', 'recipientCoverage', 'recipientCounts', 'recipientBarangays'] });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const payload = error.response?.data as { message?: string; errors?: Record<string, string | string[]> } | undefined;
                setErrors(payload?.errors ? Object.fromEntries(Object.entries(payload.errors).map(([field, value]) => [field, Array.isArray(value) ? value[0] : value])) : { recipient: payload?.message ?? 'Could not save recipient. Try again.' });
            } else setErrors({ recipient: 'Could not save recipient. Try again.' });
        } finally { setBusy(false); }
    };

    if (!recipientReady) return <p className="border-y border-[#dfe6e1] py-6 text-sm text-muted-foreground">Recipient recording is not available yet.</p>;
    const missing = (value: string | null | undefined) => value || 'Not recorded';
    const hasExcess = recipientCoverage.some((row) => row.needs_review);
    const renderFields = (fields: Header[]) => <div className="grid gap-4 sm:grid-cols-2">{fields.map((field) => {
        const required = field === 'first_name' || field === 'last_name';
        const locked = mode === 'complete' && !!selected?.[field];
        return <div key={field} className={field === 'remarks' ? 'sm:col-span-2' : ''}><Field label={labels[field] + (required ? ' *' : '')}>
            {field === 'acknowledgement' ? <select aria-label={labels[field]} className={inputClass} value={header[field]} disabled={locked} onChange={(event) => setHeader({ ...header, [field]: event.target.value })}>
                <option value="">Not recorded</option><option value="signature">Signature on paper</option><option value="thumbmark">Thumbmark on paper</option>
            </select> : <Input aria-label={labels[field]} required={required} type={field === 'received_on' ? 'date' : 'text'} max={field === 'received_on' ? today : undefined} min={field === 'received_on' ? dispatch.actual_dispatch_on ?? undefined : undefined}
                value={header[field]} placeholder={required ? 'As recorded on paper' : 'Not recorded'} disabled={locked}
                maxLength={field === 'remarks' ? 2000 : field === 'paper_row' ? 50 : ['barangay', 'collector_relationship', 'paper_reference'].includes(field) ? 150 : 255}
                onChange={(event) => setHeader({ ...header, [field]: event.target.value })} />}
        </Field></div>;
    })}</div>;
    return <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{recipientCounts?.active ?? 0} active entries <span className="mx-2 text-[#d3dbd6]">|</span>{recipientCounts?.without_quantities ?? 0} with quantities not recorded</p>
            {writable && permissions.reconcile && <Button onClick={() => open('create')} className="bg-[#245e4f] text-white shadow-none"><UserRoundPlus className="size-4" />Add recipient</Button>}
        </div>
        {hasExcess && <section role="status" className="flex gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><div><p className="font-semibold">Recipient quantities need review</p><p className="mt-1 text-xs">Recorded recipient quantities exceed the revised distribution report. Review and correct the supporting entries.</p></div></section>}
        {recipientCoverage.length > 0 && <DirectoryPanel label="Recipient quantity coverage" countLabel={`${recipientCoverage.length} items`} toolbar={null}>
            <div className="hidden overflow-x-auto @min-[960px]/goods:block"><table className="w-full text-sm"><thead className="border-y border-[#e8ede9] bg-[#f8faf9] text-xs text-muted-foreground"><tr><th className="px-5 py-3 text-left font-medium">Item</th><th className="px-5 py-3 text-right font-medium">Reported distributed</th><th className="px-5 py-3 text-right font-medium">Recipient quantities recorded</th><th className="px-5 py-3 text-right font-medium">Without recipient quantity details</th></tr></thead><tbody>{recipientCoverage.map((row) => <tr key={row.bulk_dispatch_line_id} className="border-b border-[#e8ede9] last:border-0"><td className="px-5 py-4 font-medium">{row.item_name}</td><td className="px-5 py-4 text-right tabular-nums">{quantity(row.reported_distributed)} {row.base_unit}</td><td className="px-5 py-4 text-right tabular-nums">{quantity(row.recorded)} {row.base_unit}</td><td className="px-5 py-4 text-right tabular-nums">{row.needs_review ? <span className="text-amber-800">{quantity(row.excess)} {row.base_unit} excess</span> : `${quantity(row.without_details)} ${row.base_unit}`}</td></tr>)}</tbody></table></div>
            <div className="@min-[960px]/goods:hidden">{recipientCoverage.map((row) => <div key={row.bulk_dispatch_line_id} className="space-y-2 border-b border-[#e8ede9] px-5 py-4 last:border-0"><p className="text-sm font-semibold">{row.item_name}</p><dl className="space-y-1 text-xs">{[['Reported distributed', row.reported_distributed], ['Recipient quantities recorded', row.recorded], [row.needs_review ? 'Excess needing review' : 'Without recipient quantity details', row.needs_review ? row.excess : row.without_details]].map(([label, amount]) => <div key={label} className="flex flex-wrap justify-between gap-4"><dt className="text-muted-foreground">{label}</dt><dd className="shrink-0 tabular-nums">{quantity(amount)} {row.base_unit}</dd></div>)}</dl></div>)}</div>
        </DirectoryPanel>}
        <DirectoryPanel label="Recipient entries" countLabel={`${recipients?.meta.total ?? 0} records`} toolbar={<form key={JSON.stringify(filters)} className="grid w-full gap-3 sm:grid-cols-2 @min-[960px]/goods:grid-cols-6" onSubmit={(event) => { event.preventDefault(); const form = Object.fromEntries(new FormData(event.currentTarget).entries()); router.get(url, { ...form, tab: 'recipients' }, { preserveScroll: true }); }}>
            <Input aria-label="Search recipients" name="search" placeholder="Search name or paper reference" defaultValue={filters.search ?? ''} className="@min-[960px]/goods:col-span-2" />
            <select aria-label="Recipient barangay" name="barangay" defaultValue={filters.barangay ?? ''} className={inputClass}><option value="">All barangays</option>{recipientBarangays.map((name) => <option key={name}>{name}</option>)}</select>
            <select aria-label="Quantity details" name="quantity_details" defaultValue={filters.quantity_details ?? ''} className={inputClass}><option value="">All quantity details</option><option value="recorded">Quantities recorded</option><option value="missing">Quantities not recorded</option></select>
            <select aria-label="Recipient status" name="recipient_status" defaultValue={filters.recipient_status ?? ''} className={inputClass}><option value="">All statuses</option><option value="active">Active</option><option value="voided">Voided</option></select>
            <Button variant="outline" type="submit"><Search className="size-4" />Filter</Button>
            <Field label="Receipt date from"><Input aria-label="Receipt date from" type="date" name="from" defaultValue={filters.from ?? ''} /></Field><Field label="Receipt date to"><Input aria-label="Receipt date to" type="date" name="to" defaultValue={filters.to ?? ''} /></Field>
        </form>}>
            <div className="hidden overflow-x-auto @min-[960px]/goods:block"><table className="w-full text-sm"><thead className="border-y border-[#e8ede9] bg-[#f8faf9] text-xs text-muted-foreground"><tr>{['Intended recipient', 'Location / Date', 'Recorded goods', 'Paper / Collector', 'Status', ''].map((label) => <th key={label} className="px-5 py-3 text-left font-medium">{label}</th>)}</tr></thead><tbody>{recipients?.data.map((person) => <tr key={person.id} className="border-b border-[#e8ede9] last:border-0"><td className="max-w-64 break-words px-5 py-4"><button className="text-left font-semibold hover:underline" onClick={() => open('view', person)}>{person.full_name}</button></td><td className="px-5 py-4"><p>{missing(person.barangay)}</p><p className="mt-1 text-xs text-muted-foreground">{missing(person.received_on)}</p></td><td className="px-5 py-4"><Goods person={person} /></td><td className="px-5 py-4 text-xs"><p>{missing(person.paper_reference)}</p><p className="mt-1 text-muted-foreground">Collector: {missing(person.collector_name)}</p></td><td className="px-5 py-4 text-xs capitalize">{person.status}</td><td className="px-5 py-4"><Button variant="ghost" size="icon" title="View recipient" aria-label={`View ${person.full_name}`} onClick={() => open('view', person)}><Eye className="size-4" /></Button></td></tr>)}</tbody></table></div>
            <div className="@min-[960px]/goods:hidden">{recipients?.data.map((person) => <button key={person.id} aria-label={`View ${person.full_name}`} onClick={() => open('view', person)} className="block w-full space-y-2 border-b border-[#e8ede9] px-5 py-4 text-left last:border-0"><div className="flex items-start justify-between gap-3"><p className="min-w-0 break-words text-sm font-semibold">{person.full_name}</p><span className="shrink-0 text-xs capitalize text-muted-foreground">{person.status}</span></div><p className="text-xs text-muted-foreground">{missing(person.barangay)} · {missing(person.received_on)}</p><Goods person={person} /><p className="text-xs text-muted-foreground">Collector: {missing(person.collector_name)}</p></button>)}</div>
            {!recipients?.data.length && <p className="px-5 py-9 text-center text-sm text-muted-foreground">No recipient entries found.</p>}
            {recipients && <DirectoryPagination records={recipients} />}
        </DirectoryPanel>
        <Dialog open={mode !== null} onOpenChange={(open) => { if (!busy && !open) setMode(null); }}><DialogContent className="flex max-h-[90dvh] w-[calc(100%-2rem)] sm:max-w-2xl flex-col overflow-hidden p-5 sm:p-6"><DialogHeader className="shrink-0"><DialogTitle>{mode === 'create' ? 'Add recipient' : mode === 'complete' ? 'Complete missing details' : mode === 'correct' ? 'Correct recipient entry' : mode === 'void' ? 'Void recipient entry' : 'Recipient details'}</DialogTitle></DialogHeader>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <Errors errors={errors} />
            {mode === 'view' && selected ? <div className="space-y-5"><dl className="grid gap-x-5 gap-y-4 sm:grid-cols-2">{(Object.keys(labels) as Header[]).map((field) => <div key={field} className={field === 'remarks' ? 'sm:col-span-2' : ''}><dt className="text-xs text-muted-foreground">{labels[field]}</dt><dd className="mt-1 break-words text-sm">{missing(selected[field])}</dd></div>)}</dl><div className="border-y border-[#e8ede9] py-4"><Goods person={selected} /></div>{selected.status === 'voided' && <p className="text-sm text-muted-foreground">Voided: {selected.void_reason}</p>}</div> : <>
                {mode !== 'void' && <div className="space-y-4">{renderFields(['first_name', 'middle_name', 'last_name', 'suffix', 'barangay', 'purok', 'received_on'])}
                    <details className="border-y border-[#e8ede9] py-3"><summary className="cursor-pointer text-sm font-medium">Collector and paper details</summary><div className="pt-4">{renderFields(['collector_name', 'collector_relationship', 'paper_reference', 'paper_row', 'acknowledgement', 'remarks'])}</div></details>
                    {candidates.length > 0 && <div role="status" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950"><p className="font-semibold">Similar names already appear on this dispatch</p>{candidates.map((person) => <p key={person.id} className="mt-1 break-words">{person.full_name} · {missing(person.barangay)} · {missing(person.received_on)}</p>)}</div>}{candidateError && <p role="status" className="text-xs text-muted-foreground">Similar-name check is unavailable. Review the list for possible repeated entries.</p>}
                    <section className="border-y border-[#e8ede9] py-4"><div className="mb-3 flex items-center justify-between gap-3"><p className="text-sm font-medium">Documented goods</p><Button variant="outline" size="sm" disabled={!recipientCoverage.length} onClick={() => setLines([...lines, { key: crypto.randomUUID(), bulk_dispatch_line_id: '', quantity: '', existing: false }])}><Plus className="size-4" />Add item</Button></div>{!lines.length && <p className="text-sm text-muted-foreground">Quantities not recorded</p>}{lines.map((line) => { const item = recipientCoverage.find((row) => row.bulk_dispatch_line_id === line.bulk_dispatch_line_id); const locked = mode === 'complete' && line.existing; return <div key={line.key} className="mb-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_8rem_2.5rem] sm:items-end"><Field label="Issued item"><select aria-label="Issued item" value={line.bulk_dispatch_line_id} disabled={locked} className={inputClass} onChange={(event) => setLines(lines.map((row) => row.key === line.key ? { ...row, bulk_dispatch_line_id: event.target.value } : row))}><option value="">Select issued item</option>{recipientCoverage.map((row) => <option key={row.bulk_dispatch_line_id} value={row.bulk_dispatch_line_id}>{row.item_name} / {row.base_unit}</option>)}</select></Field><Field label={`Quantity (${item?.base_unit ?? 'unit'})`}><Input aria-label="Documented quantity" type="number" min="0.001" step={item?.base_unit === 'piece' ? '1' : '0.001'} value={line.quantity} disabled={locked} onChange={(event) => setLines(lines.map((row) => row.key === line.key ? { ...row, quantity: event.target.value } : row))} /></Field><Button title="Remove documented item" aria-label="Remove documented item" variant="ghost" size="icon" disabled={locked} onClick={() => setLines(lines.filter((row) => row.key !== line.key))}><Trash2 className="size-4" /></Button></div>; })}</section>
                </div>}
                {mode === 'void' && <p className="text-sm">Void the entry for <strong>{selected?.full_name}</strong>? Its details remain in history and its quantities stop counting toward recipient coverage.</p>}
                {(mode === 'correct' || mode === 'void') && <Field label="Reason for correction *"><textarea aria-label="Reason for correction" className="min-h-24 w-full rounded-md border border-gray-300 p-3 text-sm" value={reason} minLength={10} maxLength={2000} onChange={(event) => setReason(event.target.value)} /></Field>}
            </>}
            </div>
            {mode === 'view' && selected ? <DialogFooter className="shrink-0 flex-wrap gap-2 border-t border-[#e8ede9] pt-3">{writable && selected.status === 'active' && <>{permissions.reconcile && <Button variant="outline" onClick={() => open('complete', selected)}><Plus className="size-4" />Complete details</Button>}{permissions.correct && <><Button variant="outline" onClick={() => open('correct', selected)}><FilePenLine className="size-4" />Correct</Button><Button variant="outline" onClick={() => open('void', selected)}><X className="size-4" />Void entry</Button></>}</>}<Button variant="outline" onClick={() => setMode(null)}>Close</Button></DialogFooter> : <DialogFooter className="shrink-0 flex-col gap-2 border-t border-[#e8ede9] pt-3 sm:flex-row sm:flex-wrap"><Button variant="outline" disabled={busy} onClick={() => setMode(null)}>Cancel</Button>{mode === 'create' && <Button variant="outline" disabled={busy || !hasRequiredNames} onClick={() => void submit(true)}><Check className="size-4" />Save and add another</Button>}<Button disabled={busy || (mode !== 'void' && !hasRequiredNames) || (['correct', 'void'].includes(mode ?? '') && reason.trim().length < 10)} onClick={() => void submit()}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{mode === 'void' ? 'Void entry' : 'Save recipient'}</Button></DialogFooter>}
        </DialogContent></Dialog>
    </div>;
}

function Goods({ person }: { person: BulkRecipient }) {
    return person.lines.length ? <ul className="space-y-1 text-xs">{person.lines.map((line) => <li key={line.id} className="break-words">{line.item_name_snapshot}: <span className="tabular-nums">{quantity(line.quantity)} {line.base_unit}</span></li>)}</ul> : <p className="text-xs text-muted-foreground">Quantities not recorded</p>;
}
