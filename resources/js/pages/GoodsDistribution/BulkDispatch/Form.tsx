import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link, router } from '@inertiajs/react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Errors, Field, inputClass, useInventoryContext, useInventoryMutation } from '../Inventory/components';
import { DirectoryLayout } from '../Inventory/DirectoryLayout';
import ItemPicker from '../Inventory/ItemPicker';
import type { CatalogRecord } from '../Inventory/types';
import type { BulkCustodianType, BulkDispatch, BulkOptions, BulkPermissions, BulkPurpose } from './types';

type DraftLine = { key: string; item: CatalogRecord | null; quantity: string };
const emptyLine = (): DraftLine => ({ key: crypto.randomUUID(), item: null, quantity: '' });

export default function Form({ dispatch, options, filters, permissions }: {
    dispatch: BulkDispatch | null;
    options: BulkOptions;
    filters: Record<string, string>;
    permissions: BulkPermissions;
}) {
    const { slug } = useInventoryContext();
    const routes = goodsDistribution.bulk;
    const mutation = useInventoryMutation();
    const [submissionKey] = useState(() => crypto.randomUUID());
    const [programId, setProgramId] = useState(dispatch?.program_id ?? filters.program_id ?? '');
    const [locationId, setLocationId] = useState(dispatch?.storage_location_id ?? '');
    const [requesterName, setRequesterName] = useState(dispatch?.requester_name ?? '');
    const [requesterRole, setRequesterRole] = useState(dispatch?.requester_role ?? '');
    const [custodianType, setCustodianType] = useState<BulkCustodianType>(dispatch?.custodian_type ?? 'staff');
    const [custodianUserId, setCustodianUserId] = useState(dispatch?.custodian_user_id ?? '');
    const [custodianName, setCustodianName] = useState(dispatch?.custodian_name ?? '');
    const [custodianRole, setCustodianRole] = useState(dispatch?.custodian_role ?? '');
    const [destinations, setDestinations] = useState<string[]>(dispatch?.destination_barangays.length ? dispatch.destination_barangays : ['']);
    const [purpose, setPurpose] = useState<BulkPurpose | ''>(dispatch?.purpose ?? '');
    const [purposeNotes, setPurposeNotes] = useState(dispatch?.purpose_notes ?? '');
    const [locationNotes, setLocationNotes] = useState(dispatch?.location_notes ?? '');
    const [paperReference, setPaperReference] = useState(dispatch?.paper_reference ?? '');
    const [lines, setLines] = useState<DraftLine[]>(dispatch?.lines.map((line) => ({ key: line.id, item: {
        id: line.item_id, name: line.item_name_snapshot, code: line.item_code_snapshot, base_unit: line.base_unit, is_active: true,
    }, quantity: line.quantity ?? '' })) ?? []);
    const program = options.programs.find((row) => row.id === programId);
    const listUrl = routes.index.url({ municipality: slug });
    const save = async () => {
        const data = {
            ...(dispatch ? { version: dispatch.version, operation_key: submissionKey } : { submission_key: submissionKey }),
            program_id: programId, storage_location_id: locationId, requester_name: requesterName, requester_role: requesterRole,
            custodian_type: custodianType, custodian_user_id: custodianType === 'staff' ? custodianUserId || null : null,
            custodian_name: custodianName, custodian_role: custodianRole,
            destination_barangays: destinations.map((name) => name.trim()).filter(Boolean), purpose: purpose || null, purpose_notes: purposeNotes,
            location_notes: locationNotes, paper_reference: paperReference,
            lines: lines.filter((line) => line.item).map((line) => ({ item_id: line.item!.id, quantity: line.quantity || null })),
        };
        const result = await mutation.submit(dispatch ? routes.api.update.url({ dispatchId: dispatch.id }) : routes.api.store.url(), data, dispatch ? 'patch' : 'post');
        if (result) router.visit(routes.show.url({ municipality: slug, dispatchId: result.id }));
    };
    return <DirectoryLayout rootHref={listUrl} title={dispatch ? `Edit ${dispatch.reference}` : 'New Bulk Dispatch'}
        actions={<Button asChild variant="outline"><Link href={dispatch ? routes.show.url({ municipality: slug, dispatchId: dispatch.id }) : listUrl}>Back to dispatches</Link></Button>}>
        <div className="space-y-5">
            <Errors errors={mutation.errors} />
            <section className="grid gap-4 border-y border-[#dfe6e1] py-5 @min-[560px]/goods:grid-cols-2 @min-[800px]/goods:grid-cols-3">
                <Field label="Program *"><select aria-label="Program" className={inputClass} value={programId} onChange={(event) => { setProgramId(event.target.value); setLines([]); }}><option value="">Select program</option>{options.programs.map((row) => <option key={row.id} value={row.id} disabled={!row.is_active}>{row.name}</option>)}</select></Field>
                <Field label="Storage location *"><select aria-label="Storage location" className={inputClass} value={locationId} onChange={(event) => setLocationId(event.target.value)}><option value="">Select storage</option>{options.locations.map((row) => <option key={row.id} value={row.id} disabled={!row.is_active}>{row.name}</option>)}</select></Field>
                <Field label="Paper reference"><Input value={paperReference} maxLength={150} onChange={(event) => setPaperReference(event.target.value)} /></Field>
                <Field label="Requester name"><Input aria-label="Requester name" value={requesterName} maxLength={255} onChange={(event) => setRequesterName(event.target.value)} placeholder="Person or office" /></Field>
                <Field label="Requester role"><Input value={requesterRole} maxLength={255} onChange={(event) => setRequesterRole(event.target.value)} /></Field>
                <Field label="Custodian type *"><select aria-label="Custodian type" className={inputClass} value={custodianType} onChange={(event) => { setCustodianType(event.target.value as BulkCustodianType); setCustodianUserId(''); setCustodianName(''); }}>{options.custodian_types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></Field>
                {custodianType === 'staff' && <Field label="Link municipal staff (optional)"><select aria-label="Link municipal staff" className={inputClass} value={custodianUserId} onChange={(event) => { setCustodianUserId(event.target.value); setCustodianName(options.custodians.find((row) => row.id === event.target.value)?.name ?? ''); }}><option value="">No linked user</option>{options.custodians.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select></Field>}
                <Field label="Custodian name *"><Input aria-label="Custodian name" value={custodianName} onChange={(event) => setCustodianName(event.target.value)} disabled={!!custodianUserId} maxLength={255} /></Field>
                <Field label="Custodian role *"><Input aria-label="Custodian role" value={custodianRole} onChange={(event) => setCustodianRole(event.target.value)} maxLength={255} placeholder="Team leader, barangay captain, principal" /></Field>
                <Field label="Purpose *"><select aria-label="Purpose" className={inputClass} value={purpose} onChange={(event) => setPurpose(event.target.value as BulkPurpose | '')}><option value="">Select purpose</option>{options.purposes.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}</select></Field>
                <Field label={purpose === 'other' ? 'Purpose details *' : 'Purpose details'}><Input aria-label="Purpose details" value={purposeNotes} onChange={(event) => setPurposeNotes(event.target.value)} maxLength={2000} /></Field>
                <Field label={purpose === 'school_distribution' ? 'Venue / Specific location *' : 'Venue / Specific location'}><Input aria-label="Venue / Specific location" placeholder={purpose === 'school_distribution' ? 'School name' : 'School, evacuation center, sitio, etc.'} value={locationNotes} onChange={(event) => setLocationNotes(event.target.value)} maxLength={2000} /></Field>
            </section>
            <section className="space-y-3 border-b border-[#dfe6e1] pb-5">
                <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold">Destination barangays</h2><Button size="sm" variant="outline" onClick={() => setDestinations([...destinations, ''])}><Plus className="size-4" />Add destination</Button></div>
                <datalist id="bulk-destinations">{options.barangays.map((name) => <option key={name} value={name} />)}</datalist>
                <div className="grid gap-2 @min-[560px]/goods:grid-cols-2">{destinations.map((name, index) => <div key={index} className="flex gap-2"><Input aria-label={`Destination ${index + 1}`} list="bulk-destinations" value={name} maxLength={150} onChange={(event) => setDestinations(destinations.map((row, rowIndex) => rowIndex === index ? event.target.value : row))} /><Button variant="outline" size="icon" title="Remove destination" aria-label="Remove destination" disabled={destinations.length === 1} onClick={() => setDestinations(destinations.filter((_, rowIndex) => rowIndex !== index))}><Trash2 className="size-4" /></Button></div>)}</div>
            </section>
            <section className="overflow-hidden rounded-md border border-[#dfe6e1] bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-[#e8ede9] px-5 py-4"><h2 className="text-sm font-semibold">Goods to dispatch</h2><Button variant="outline" size="sm" disabled={!programId} onClick={() => setLines([...lines, emptyLine()])}><Plus className="size-4" />Add item</Button></div>
                {lines.length ? lines.map((line, index) => <div key={line.key} className="grid gap-3 border-b border-[#e8ede9] px-5 py-4 last:border-0 @min-[560px]/goods:grid-cols-[minmax(0,1fr)_11rem_2.5rem] sm:items-end">
                    <div className="min-w-0"><p className="mb-1.5 text-xs text-muted-foreground">Item {index + 1}</p><ItemPicker value={line.item} programId={programId} searchUrl={routes.api.items.url()} required={false} onChange={(item) => setLines(lines.map((row) => row.key === line.key ? { ...row, item } : row))} /></div>
                    <Field label={`Quantity (${line.item?.base_unit ?? 'unit'})`}><Input type="number" min="0.001" step={line.item?.base_unit === 'piece' ? '1' : '0.001'} value={line.quantity} placeholder="Can be filled later" onChange={(event) => setLines(lines.map((row) => row.key === line.key ? { ...row, quantity: event.target.value } : row))} /></Field>
                    <Button variant="ghost" size="icon" title="Remove item" aria-label="Remove item" onClick={() => setLines(lines.filter((row) => row.key !== line.key))}><Trash2 className="size-4" /></Button>
                </div>) : <p className="px-5 py-8 text-center text-sm text-muted-foreground">Items and quantities can be completed before approval.</p>}
            </section>
            <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Saving a draft does not reserve or deduct stock.</p><Button disabled={mutation.busy || !permissions.prepare} className="bg-[#245e4f] text-white shadow-none" onClick={() => void save()}><Save className="size-4" />Save draft</Button></div>
            {program && <p className="sr-only">Selected program: {program.name}</p>}
        </div>
    </DirectoryLayout>;
}
