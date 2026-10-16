import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, ChevronDown, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AttachProgramItemDialog from './AttachProgramItemDialog';
import { Errors, Field, inputClass, quantity, useInventoryContext, useInventoryMutation } from './components';
import { DirectoryLayout } from './DirectoryLayout';
import ItemDialog from './ItemDialog';
import ItemPicker from './ItemPicker';
import type { CatalogRecord, CommonProps, Options, Receipt } from './types';

const blankLine = (programId = '') => ({
    key: crypto.randomUUID(),
    item_id: '',
    program_id: programId,
    quantity: '',
    package_type: '',
    package_count: '',
    quantity_per_package: '',
    batch_reference: '',
    expires_on: '',
    notes: '',
});

function packagedQuantity(count: string, value: string): string {
    if (!/^\d+$/.test(count) || !/^\d{1,12}(\.\d{1,3})?$/.test(value)) return '';
    const [whole, fraction = ''] = value.split('.');
    const amount = BigInt(count) * (BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, '0')));
    return `${amount / 1000n}.${String(amount % 1000n).padStart(3, '0')}`;
}

export default function ReceiptForm({
    receipt,
    options,
    today,
    program,
}: CommonProps & { receipt: Receipt | null; options: Options; today: string }) {
    const { slug } = useInventoryContext();
    const mutation = useInventoryMutation();
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
    const [creating, setCreating] = useState<{ key: string; name: string } | null>(null);
    const [attaching, setAttaching] = useState<{ key: string; programId: string } | null>(null);
    const [expanded, setExpanded] = useState<string[]>([]);
    const [items, setItems] = useState<CatalogRecord[]>(() => [
        ...options.items,
        ...(receipt?.lines ?? [])
            .filter((line) => !options.items.some((item) => item.id === line.item_id))
            .map((line) => ({ id: line.item_id, code: '', name: line.item_name, base_unit: line.base_unit, is_active: line.item_is_active ?? true })),
    ]);
    const [form, setForm] = useState({
        kind: receipt?.kind ?? 'receipt',
        stock_source_id: receipt?.stock_source_id ?? '',
        storage_location_id: receipt?.storage_location_id ?? '',
        received_on: receipt?.received_on ?? today,
        reference: receipt?.reference ?? '',
        notes: receipt?.notes ?? '',
        draft_fingerprint: receipt?.draft_fingerprint ?? '',
        lines: receipt?.lines.map((line) => ({
            ...blankLine(program?.id),
            item_id: line.item_id,
            program_id: line.program_id ?? '',
            quantity: line.quantity,
            package_type: line.package_type ?? '',
            package_count: line.package_count == null ? '' : String(line.package_count),
            quantity_per_package: line.quantity_per_package ?? '',
            batch_reference: line.batch_reference ?? '',
            expires_on: line.expires_on ?? '',
            notes: line.notes ?? '',
        })) ?? [blankLine(program?.id)],
    });
    const backUrl = program
        ? goodsDistribution.inventory.programsShow.url({ municipality: slug, programId: program.id }, { query: { tab: 'receipts' } })
        : goodsDistribution.inventory.receipts.index.url({ municipality: slug });
    const lineField = (key: string, field: keyof ReturnType<typeof blankLine>, value: string) =>
        setForm((previous) => ({
            ...previous,
            lines: previous.lines.map((line) =>
                line.key === key ? { ...line, [field]: value, ...(field === 'program_id' ? { item_id: '' } : {}) } : line,
            ),
        }));
    const selectItem = (key: string, item: CatalogRecord) => {
        setItems((previous) => [...previous.filter((row) => row.id !== item.id), item]);
        lineField(key, 'item_id', item.id);
    };
    const save = async () => {
        setLocalErrors({});
        const missing = form.lines.findIndex((line) => !line.item_id);
        if (missing !== -1) {
            setLocalErrors({ item: `Select an item for row ${missing + 1}.` });
            return;
        }
        const data = {
            ...form,
            reference: form.reference || null,
            notes: form.notes || null,
            lines: form.lines.map((line) => ({
                item_id: line.item_id,
                program_id: program?.id ?? (line.program_id || null),
                quantity: line.package_type ? packagedQuantity(line.package_count, line.quantity_per_package) : line.quantity,
                package_type: line.package_type || null,
                package_count: line.package_type ? line.package_count : null,
                quantity_per_package: line.package_type ? line.quantity_per_package : null,
                batch_reference: line.batch_reference || null,
                expires_on: line.expires_on || null,
                notes: line.notes || null,
            })),
        };
        const api = goodsDistribution.inventory.api;
        const url = program
            ? receipt
                ? api.programsReceiptsUpdate.url({ programId: program.id, receiptId: receipt.id })
                : api.programsReceiptsStore.url({ programId: program.id })
            : receipt
              ? api.receipts.update.url({ receiptId: receipt.id })
              : api.receipts.store.url();
        const result = await mutation.submit(url, data, receipt ? 'patch' : 'post');
        if (result)
            router.visit(
                goodsDistribution.inventory.receipts.show.url(
                    { municipality: slug, receiptId: result.id },
                    { query: program ? { program_id: program.id } : {} },
                ),
            );
    };
    const selectOptions = (label: string, field: 'stock_source_id' | 'storage_location_id', records: Options['sources'], previousName?: string) => (
        <Field label={label}>
            <select required className={inputClass} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })}>
                <option value="">Select {label.toLowerCase()}</option>
                {form[field] && !records.some((row) => row.id === form[field]) && <option value={form[field]}>{previousName} (inactive)</option>}
                {records.map((row) => (
                    <option key={row.id} value={row.id}>
                        {row.name}
                    </option>
                ))}
            </select>
        </Field>
    );
    return (
        <DirectoryLayout
            title={receipt ? 'Edit Draft Receipt' : 'Receive Stock'}
            program={program}
            actions={
                <Button variant="outline" className="border-[#dfe6e1] bg-white shadow-none" asChild>
                    <Link href={backUrl}>
                        <ArrowLeft className="size-4" />
                        Stock receipts
                    </Link>
                </Button>
            }
        >
            {program && (
                <div className="flex flex-wrap items-center gap-2 border-l-2 border-[#dfe6e1] pl-3 text-sm">
                    <span className="text-muted-foreground">Program</span>
                    <span className="font-semibold break-words">{program.name}</span>
                    <span className="text-xs text-muted-foreground">{program.code}</span>
                </div>
            )}
            <form
                className="space-y-6 [&_button]:shadow-none [&_input]:border-[#dfe6e1] [&_input]:bg-[#fafcfb] [&_input]:shadow-none [&_select]:border-[#dfe6e1] [&_select]:bg-[#fafcfb] [&_select]:shadow-none"
                onSubmit={(event) => {
                    event.preventDefault();
                    void save();
                }}
            >
                <Errors errors={{ ...localErrors, ...mutation.errors }} />
                <section className="space-y-4 border-y border-[#dfe6e1] py-6">
                    <h2 className="text-sm font-semibold">Delivery details</h2>
                    <div className="grid gap-4 @min-[520px]/goods:grid-cols-2 @min-[960px]/goods:grid-cols-3">
                        <Field label="Record kind">
                            <select
                                className={inputClass}
                                value={form.kind}
                                onChange={(event) => setForm({ ...form, kind: event.target.value as 'receipt' | 'opening' })}
                            >
                                <option value="receipt">Stock receipt</option>
                                <option value="opening">Opening stock</option>
                            </select>
                        </Field>
                        {selectOptions('Source / Donor', 'stock_source_id', options.sources, receipt?.source_name)}
                        {selectOptions('Storage location', 'storage_location_id', options.locations, receipt?.location_name)}
                        <Field label={form.kind === 'opening' ? 'Stock count date' : 'Received date'}>
                            <Input
                                type="date"
                                required
                                max={today}
                                value={form.received_on}
                                onChange={(event) => setForm({ ...form, received_on: event.target.value })}
                            />
                        </Field>
                        <Field label="Reference">
                            <Input maxLength={150} value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} />
                        </Field>
                        <Field label="Notes">
                            <Input maxLength={2000} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
                        </Field>
                    </div>
                </section>
                <section className="rounded-md border border-[#dfe6e1] bg-white">
                    <div className="flex items-center justify-between gap-3 border-b border-[#e8ede9] px-4 py-4 sm:px-5">
                        <h2 className="text-sm font-semibold">
                            Received items <span className="ml-1 font-normal text-muted-foreground">({form.lines.length})</span>
                        </h2>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-[#dfe6e1] text-[#245e4f] hover:bg-[#eaf1ed]"
                            disabled={form.lines.length >= 100}
                            onClick={() => setForm({ ...form, lines: [...form.lines, blankLine(program?.id)] })}
                        >
                            <Plus className="size-4" />
                            Add line
                        </Button>
                    </div>
                    <div className="divide-y divide-[#e8ede9]">
                        {form.lines.map((line, index) => {
                            const selected = items.find((item) => item.id === line.item_id) ?? null;
                            const unit = selected?.base_unit ?? 'kg';
                            const total = line.package_type ? packagedQuantity(line.package_count, line.quantity_per_package) : line.quantity;
                            const extraOpen =
                                expanded.includes(line.key) ||
                                Object.keys(mutation.errors).some((key) =>
                                    [`lines.${index}.batch_reference`, `lines.${index}.expires_on`, `lines.${index}.notes`].includes(key),
                                );
                            return (
                                <fieldset key={line.key} aria-label={`Item ${index + 1}`} className="min-w-0 space-y-3 px-4 py-5 sm:px-5">
                                    <div className="grid items-end gap-3 @min-[520px]/goods:grid-cols-2 @min-[960px]/goods:grid-cols-12">
                                        <div className="min-w-0 @min-[520px]/goods:col-span-2 @min-[960px]/goods:col-span-4">
                                            <p className="mb-1.5 text-sm leading-none font-medium">Item {index + 1}</p>
                                            <ItemPicker
                                                value={selected}
                                                programId={program?.id ?? line.program_id}
                                                onChange={(item) => selectItem(line.key, item)}
                                                onCreate={(name) => setCreating({ key: line.key, name })}
                                            />
                                        </div>
                                        <div className="min-w-0 @min-[960px]/goods:col-span-2">
                                            <Field label="Packaging">
                                                <select
                                                    className={inputClass}
                                                    value={line.package_type}
                                                    onChange={(event) => lineField(line.key, 'package_type', event.target.value)}
                                                >
                                                    <option value="">Direct quantity</option>
                                                    <option value="sack">Sacks</option>
                                                    <option value="pack">Packs</option>
                                                    <option value="box">Boxes</option>
                                                </select>
                                            </Field>
                                        </div>
                                        <div className="grid min-w-0 grid-cols-2 items-end gap-3 @min-[960px]/goods:col-span-4">
                                            {line.package_type ? (
                                                <>
                                                    <Field label="Packages">
                                                        <Input
                                                            className="h-10"
                                                            required
                                                            type="number"
                                                            min="1"
                                                            step="1"
                                                            value={line.package_count}
                                                            onChange={(event) => lineField(line.key, 'package_count', event.target.value)}
                                                        />
                                                    </Field>
                                                    <Field label={`${unit} per package`}>
                                                        <Input
                                                            className="h-10"
                                                            required
                                                            type="number"
                                                            min={unit === 'piece' ? '1' : '0.001'}
                                                            step={unit === 'piece' ? '1' : '0.001'}
                                                            value={line.quantity_per_package}
                                                            onChange={(event) => lineField(line.key, 'quantity_per_package', event.target.value)}
                                                        />
                                                    </Field>
                                                </>
                                            ) : (
                                                <div className="col-span-2">
                                                    <Field label={`Quantity (${unit})`}>
                                                        <Input
                                                            className="h-10"
                                                            required
                                                            type="number"
                                                            min={unit === 'piece' ? '1' : '0.001'}
                                                            step={unit === 'piece' ? '1' : '0.001'}
                                                            value={line.quantity}
                                                            onChange={(event) => lineField(line.key, 'quantity', event.target.value)}
                                                        />
                                                    </Field>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex min-w-0 items-end gap-2 @min-[520px]/goods:col-span-2 @min-[960px]/goods:col-span-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="mb-1.5 text-sm leading-none font-medium">Total</p>
                                                <output
                                                    aria-label={`Total received quantity for item ${index + 1}`}
                                                    aria-live="polite"
                                                    className="flex min-h-10 items-center justify-end text-right text-sm font-semibold [overflow-wrap:anywhere] text-[#245e4f] tabular-nums"
                                                >
                                                    {total ? quantity(total) : '-'} {unit}
                                                </output>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-10 shrink-0 text-muted-foreground hover:text-destructive"
                                                title="Remove item"
                                                aria-label={`Remove item ${index + 1}`}
                                                disabled={form.lines.length === 1}
                                                onClick={() => setForm({ ...form, lines: form.lines.filter((row) => row.key !== line.key) })}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                        {selected && (
                                            <p className="min-w-0 text-xs [overflow-wrap:anywhere] text-muted-foreground">
                                                {selected.code ? `${selected.code} / ${unit}` : unit}
                                            </p>
                                        )}
                                        {(program?.id || line.program_id) && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-0 text-[#245e4f] hover:bg-transparent"
                                                onClick={() => setAttaching({ key: line.key, programId: program?.id ?? line.program_id })}
                                            >
                                                <Plus className="size-3.5" />
                                                Add existing program item
                                            </Button>
                                        )}
                                    </div>
                                    {receipt?.lines[index]?.receivable === false && selected?.id === receipt.lines[index].item_id && (
                                        <p className="text-xs text-amber-800">
                                            This saved selection is unavailable. Enable it in the program or choose an enabled item before saving or
                                            posting.
                                        </p>
                                    )}
                                    {!program && (
                                        <div className="max-w-sm">
                                            <Field label="Program">
                                                <select
                                                    className={inputClass}
                                                    value={line.program_id}
                                                    onChange={(event) => lineField(line.key, 'program_id', event.target.value)}
                                                >
                                                    <option value="">Unassigned</option>
                                                    {line.program_id && !options.programs.some((entry) => entry.id === line.program_id) && (
                                                        <option value={line.program_id}>{receipt?.lines[index]?.program_name} (inactive)</option>
                                                    )}
                                                    {options.programs.map((entry) => (
                                                        <option key={entry.id} value={entry.id}>
                                                            {entry.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </Field>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        className="flex items-center gap-1 text-xs font-medium text-[#75827c] hover:text-[#245e4f]"
                                        aria-expanded={extraOpen}
                                        onClick={() =>
                                            setExpanded((previous) =>
                                                extraOpen ? previous.filter((key) => key !== line.key) : [...previous, line.key],
                                            )
                                        }
                                    >
                                        <ChevronDown className={`size-3.5 transition-transform ${extraOpen ? 'rotate-180' : ''}`} />
                                        Batch, expiry and notes
                                        {!extraOpen && (line.batch_reference || line.expires_on || line.notes) ? ' / Added' : ''}
                                    </button>
                                    {extraOpen && (
                                        <div className="grid gap-3 @min-[520px]/goods:grid-cols-3">
                                            <Field label="Batch reference">
                                                <Input
                                                    maxLength={100}
                                                    value={line.batch_reference}
                                                    onChange={(event) => lineField(line.key, 'batch_reference', event.target.value)}
                                                />
                                            </Field>
                                            <Field label="Expiry date">
                                                <Input
                                                    type="date"
                                                    value={line.expires_on}
                                                    onChange={(event) => lineField(line.key, 'expires_on', event.target.value)}
                                                />
                                            </Field>
                                            <Field label="Item notes">
                                                <Input
                                                    maxLength={2000}
                                                    value={line.notes}
                                                    onChange={(event) => lineField(line.key, 'notes', event.target.value)}
                                                />
                                            </Field>
                                        </div>
                                    )}
                                </fieldset>
                            );
                        })}
                    </div>
                </section>
                <footer className="bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#dfe6e1] bg-[#f6f8f7]/95 py-4 backdrop-blur-sm @min-[960px]/goods:sticky">
                    <p className="text-sm text-muted-foreground">{receipt ? receipt.receipt_number : 'New receipt'} / Draft</p>
                    <Button
                        className="bg-[#245e4f] text-white hover:bg-[#194c3e]"
                        type="submit"
                        disabled={mutation.busy || (program ? !program.is_active : false)}
                    >
                        <Save className="size-4" />
                        {mutation.busy ? 'Saving draft' : 'Save draft'}
                    </Button>
                </footer>
            </form>
            {creating && (
                <ItemDialog
                    initialName={creating.name}
                    receiving
                    programId={program?.id ?? form.lines.find((line) => line.key === creating.key)?.program_id}
                    onClose={() => setCreating(null)}
                    onSaved={(item) => {
                        selectItem(creating.key, item);
                        setCreating(null);
                    }}
                />
            )}
            {attaching && (
                <AttachProgramItemDialog
                    programId={attaching.programId}
                    onClose={() => setAttaching(null)}
                    onSaved={(item) => {
                        selectItem(attaching.key, item);
                        setAttaching(null);
                    }}
                />
            )}
        </DirectoryLayout>
    );
}
