import { Button } from '@/components/ui/button';
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GoodsDialogContent as DialogContent } from '../GoodsDialog';
import { Input } from '@/components/ui/input';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Check, SlidersHorizontal, Undo2 } from 'lucide-react';
import { useState } from 'react';
import {
    Errors,
    Field,
    Filters,
    inputClass,
    programUrl,
    quantity,
    StateBadge,
    useInventoryContext,
    useInventoryMutation,
    withProgram,
} from './components';
import { DirectoryLayout, DirectoryPagination, DirectoryPanel, DirectoryStatus } from './DirectoryLayout';
import type { CommonProps, InventoryItem, Movement, Options, PageData, ReceiptLine } from './types';

export default function ItemDetails({
    item,
    batches,
    movements,
    filters,
    options,
    canAdjust,
    program,
    canViewDistribution,
    canViewBulk,
}: CommonProps & { item: InventoryItem; batches: PageData<ReceiptLine>; movements: PageData<Movement>; options: Options }) {
    const { slug } = useInventoryContext();
    const mutation = useInventoryMutation();
    const [target, setTarget] = useState<{ mode: 'adjust'; batch: ReceiptLine } | { mode: 'reverse'; movement: Movement } | null>(null);
    const [form, setForm] = useState({ direction: 'remove', quantity: '', reason: '', reference: '', operation_key: '' });
    const open = (value: NonNullable<typeof target>) => {
        setTarget(value);
        setForm({ direction: 'remove', quantity: '', reason: '', reference: '', operation_key: crypto.randomUUID() });
        mutation.clearErrors();
    };
    const execute = async () => {
        if (!target) return;
        const result = await mutation.submit(
            target.mode === 'adjust'
                ? goodsDistribution.inventory.api.adjustments.store.url({ lineId: target.batch.id })
                : goodsDistribution.inventory.api.adjustments.reverse.url({ movementId: target.movement.id }),
            form,
        );
        if (result) {
            setTarget(null);
            router.reload();
        }
    };
    return (
        <DirectoryLayout
            title={item.name}
            program={program}
            actions={
                <Button asChild variant="outline" className="border-[#dfe6e1] bg-white shadow-none">
                    <Link
                        href={
                            program
                                ? programUrl(slug, program.id)
                                : withProgram(goodsDistribution.inventory.index.url({ municipality: slug }), filters.program_id)
                        }
                    >
                        <ArrowLeft className="size-4" />
                        {program ? 'Program stock' : 'Inventory'}
                    </Link>
                </Button>
            }
        >
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#dfe6e1] pb-5">
                <div>
                    <p className="text-sm text-muted-foreground">{item.code}</p>
                    <div className="mt-2">
                        <DirectoryStatus active={item.is_active} />
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">On hand</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                        {quantity(item.balance)} {item.base_unit}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Reserved {quantity(item.reserved ?? '0')} {item.base_unit} · Available {quantity(item.available ?? item.balance)}{' '}
                        {item.base_unit}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        With staff {quantity(item.with_staff ?? '0')} · Reported distributed {quantity(item.reported_distributed ?? '0')} · Returned {quantity(item.returned ?? '0')} {item.base_unit}
                    </p>
                </div>
            </div>
            <DirectoryPanel
                label="Stock batches"
                countLabel={`${batches.meta.total.toLocaleString()} batches`}
                toolbar={
                    <Filters
                        appearance="directory"
                        filters={filters}
                        options={options}
                        program={program}
                        url={goodsDistribution.inventory.item.url({ municipality: slug, itemId: item.id })}
                    />
                }
            >
                <table className="w-full table-fixed text-left text-sm">
                    <thead className="hidden border-y border-[#e8ede9] bg-[#f8faf9] text-xs text-[#75827c] @min-[960px]/goods:table-header-group">
                        <tr>
                            {['Receipt / Batch', 'Source', 'Program', 'Storage', 'Expiry', 'Stock', ''].map((label, index) => (
                                <th key={index} className={`px-3 py-3 font-medium ${label === 'Stock' ? 'text-right' : ''}`}>
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="block @min-[960px]/goods:table-row-group">
                        {batches.data.map((batch) => (
                            <tr
                                key={batch.id}
                                className="grid grid-cols-2 border-b border-[#e8ede9] last:border-b-0 hover:bg-[#fafcfb] @min-[960px]/goods:table-row [&>td]:min-w-0 [&>td]:[overflow-wrap:anywhere]"
                            >
                                <td className="px-3 py-3">
                                    {batch.receipt && (
                                        <Link
                                            className="font-medium text-[#245e4f] hover:underline"
                                            href={withProgram(
                                                goodsDistribution.inventory.receipts.show.url({
                                                    municipality: slug,
                                                    receiptId: batch.receipt.id,
                                                }),
                                                program?.id ?? filters.program_id,
                                            )}
                                        >
                                            {batch.receipt.receipt_number}
                                        </Link>
                                    )}
                                    <p className="mt-1 text-xs text-muted-foreground">{batch.batch_reference ?? `Line ${batch.line_number}`}</p>
                                    {batch.receipt?.status === 'voided' && <StateBadge value="voided" />}
                                </td>
                                <td className="px-3 py-3">
                                    <span className="block text-xs text-muted-foreground @min-[960px]/goods:hidden">Source</span>
                                    {batch.receipt?.source_name_snapshot}
                                </td>
                                <td className="px-3 py-3">
                                    <span className="block text-xs text-muted-foreground @min-[960px]/goods:hidden">Program</span>
                                    {batch.program_name ?? 'Unassigned'}
                                </td>
                                <td className="px-3 py-3">
                                    <span className="block text-xs text-muted-foreground @min-[960px]/goods:hidden">Storage</span>
                                    {batch.receipt?.storage_location_name_snapshot}
                                </td>
                                <td className="px-3 py-3">
                                    <span className="block text-xs text-muted-foreground @min-[960px]/goods:hidden">Expiry</span>
                                    {batch.expires_on ?? '-'}
                                    {['expired', 'soon'].includes(batch.expiry_state) && (
                                        <div className="mt-1">
                                            <StateBadge value={batch.expiry_state === 'soon' ? 'expiring soon' : 'expired'} />
                                        </div>
                                    )}
                                </td>
                                <td className="px-3 py-3 text-right font-semibold tabular-nums">
                                    <span className="block text-xs font-normal text-muted-foreground">On hand</span>
                                    {quantity(batch.balance)} {batch.base_unit}
                                    <p className="mt-1 text-xs font-normal text-muted-foreground">
                                        Reserved {quantity(batch.reserved ?? '0')} {batch.base_unit}
                                    </p>
                                    <p className="text-xs font-normal text-muted-foreground">
                                        Available {quantity(batch.available ?? batch.balance)} {batch.base_unit}
                                    </p>
                                    <p className="text-xs font-normal text-muted-foreground">
                                        With staff {quantity(batch.with_staff ?? '0')} · Distributed {quantity(batch.reported_distributed ?? '0')} · Returned {quantity(batch.returned ?? '0')} {batch.base_unit}
                                    </p>
                                </td>
                                <td className="px-3 py-3">
                                    {canAdjust && batch.receipt?.status === 'posted' && (
                                        <Button
                                            className="border-[#dfe6e1] text-[#607d6b] shadow-none hover:bg-[#eaf1ed]"
                                            size="icon"
                                            variant="outline"
                                            title="Adjust this batch"
                                            aria-label="Adjust this batch"
                                            onClick={() => open({ mode: 'adjust', batch })}
                                        >
                                            <SlidersHorizontal className="size-4" />
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!batches.data.length && <p className="py-8 text-center text-sm text-muted-foreground">No posted stock batches found.</p>}
                <DirectoryPagination records={batches} />
            </DirectoryPanel>
            <DirectoryPanel
                label="Movement history"
                countLabel={`${movements.meta.total.toLocaleString()} movements`}
                toolbar={<h2 className="text-sm font-medium">Stock movements</h2>}
            >
                <table className="w-full table-fixed text-left text-sm">
                    <thead className="hidden border-y border-[#e8ede9] bg-[#f8faf9] text-xs text-[#75827c] @min-[960px]/goods:table-header-group">
                        <tr>
                            {['Date / Posted', 'Type', 'Quantity', 'Reason / Reference', 'Actor', ''].map((label, index) => (
                                <th key={index} className={`px-3 py-3 font-medium ${label === 'Quantity' ? 'text-right' : ''}`}>
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="block @min-[960px]/goods:table-row-group">
                        {movements.data.map((movement) => (
                            <tr
                                key={movement.id}
                                className="grid grid-cols-2 border-b border-[#e8ede9] last:border-b-0 hover:bg-[#fafcfb] @min-[960px]/goods:table-row [&>td]:min-w-0 [&>td]:[overflow-wrap:anywhere]"
                            >
                                <td className="px-3 py-3">
                                    {movement.occurred_on}
                                    <p className="mt-1 text-xs text-muted-foreground">{new Date(movement.posted_at).toLocaleString()}</p>
                                </td>
                                <td className="px-3 py-3 capitalize">
                                    {movement.type}
                                    {movement.reversal_id && <p className="mt-1 text-xs text-muted-foreground">Reversed</p>}
                                </td>
                                <td
                                    className={`px-3 py-3 text-right font-medium tabular-nums ${movement.quantity.startsWith('-') ? 'text-red-700' : 'text-emerald-700'}`}
                                >
                                    <span className="block text-xs font-normal text-muted-foreground @min-[960px]/goods:hidden">Quantity</span>
                                    {!movement.quantity.startsWith('-') && '+'}
                                    {quantity(movement.quantity)} {movement.base_unit}
                                </td>
                                <td className="max-w-sm px-3 py-3 break-words">
                                    {movement.reason ?? '-'}
                                    {canViewDistribution && movement.distribution_request_id ? (
                                        <Link
                                            className="mt-1 block text-xs text-[#245e4f] underline"
                                            href={goodsDistribution.requests.show.url({
                                                municipality: slug,
                                                requestId: movement.distribution_request_id,
                                            })}
                                        >
                                            {movement.reference}
                                        </Link>
                                    ) : (
                                        <p className="mt-1 text-xs text-muted-foreground">{movement.reference ?? movement.receipt.receipt_number}</p>
                                    )}
                                    {canViewBulk && movement.bulk_dispatch_id && (
                                        <Link className="mt-1 block text-xs text-[#245e4f] underline" href={goodsDistribution.bulk.show.url({ municipality: slug, dispatchId: movement.bulk_dispatch_id })}>View bulk dispatch</Link>
                                    )}
                                </td>
                                <td className="px-3 py-3">{movement.actor ?? '-'}</td>
                                <td className="px-3 py-3">
                                    {canAdjust && movement.type === 'adjustment' && !movement.reversal_id && movement.receipt.status === 'posted' && (
                                        <Button
                                            className="border-[#dfe6e1] text-[#607d6b] shadow-none hover:bg-[#eaf1ed]"
                                            size="icon"
                                            variant="outline"
                                            title="Reverse adjustment"
                                            aria-label="Reverse adjustment"
                                            onClick={() => open({ mode: 'reverse', movement })}
                                        >
                                            <Undo2 className="size-4" />
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!movements.data.length && <p className="py-8 text-center text-sm text-muted-foreground">No stock movements found.</p>}
                <DirectoryPagination records={movements} />
            </DirectoryPanel>
            <Dialog
                open={target !== null}
                onOpenChange={(value) => {
                    if (!value && !mutation.busy) setTarget(null);
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto border-[#dfe6e1] text-[#243c33]">
                    <DialogHeader>
                        <DialogTitle>{target?.mode === 'reverse' ? 'Reverse adjustment' : 'Adjust stock'}</DialogTitle>
                    </DialogHeader>
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            void execute();
                        }}
                    >
                        <Errors errors={mutation.errors} />
                        {target?.mode === 'adjust' ? (
                            <>
                                <p className="text-sm">
                                    Unreserved stock:{' '}
                                    <strong>
                                        {quantity(target.batch.unreserved ?? target.batch.balance)} {item.base_unit}
                                    </strong>
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Operation">
                                        <select
                                            className={inputClass}
                                            value={form.direction}
                                            onChange={(event) => setForm({ ...form, direction: event.target.value })}
                                        >
                                            <option value="remove">Remove</option>
                                            <option value="add">Add</option>
                                        </select>
                                    </Field>
                                    <Field label={`Quantity (${item.base_unit})`}>
                                        <Input
                                            required
                                            type="number"
                                            min={item.base_unit === 'piece' ? '1' : '0.001'}
                                            step={item.base_unit === 'piece' ? '1' : '0.001'}
                                            value={form.quantity}
                                            onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                                        />
                                    </Field>
                                </div>
                            </>
                        ) : (
                            target && (
                                <p className="text-sm">
                                    Original adjustment:{' '}
                                    <strong>
                                        {quantity(target.movement.quantity)} {item.base_unit}
                                    </strong>
                                </p>
                            )
                        )}
                        <Field label="Reason">
                            <textarea
                                required
                                minLength={5}
                                maxLength={1000}
                                className={`${inputClass} h-24 py-2`}
                                value={form.reason}
                                onChange={(event) => setForm({ ...form, reason: event.target.value })}
                            />
                        </Field>
                        <Field label="Reference">
                            <Input
                                required
                                maxLength={150}
                                value={form.reference}
                                onChange={(event) => setForm({ ...form, reference: event.target.value })}
                            />
                        </Field>
                        <DialogFooter>
                            <Button variant="outline" type="button" disabled={mutation.busy} onClick={() => setTarget(null)}>
                                Cancel
                            </Button>
                            <Button className="bg-[#245e4f] text-white hover:bg-[#194c3e]" type="submit" disabled={mutation.busy}>
                                <Check className="size-4" />
                                {target?.mode === 'reverse' ? 'Reverse adjustment' : 'Record adjustment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DirectoryLayout>
    );
}
