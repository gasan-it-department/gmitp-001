import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Pencil, RefreshCw, XCircle } from 'lucide-react';
import { useState } from 'react';
import {
    Errors,
    Field,
    inputClass,
    programUrl,
    quantity,
    ReceiptPrograms,
    StateBadge,
    useInventoryContext,
    useInventoryMutation,
    withProgram,
} from './components';
import { DirectoryLayout, DirectoryPanel } from './DirectoryLayout';
import type { CommonProps, Receipt } from './types';

export default function ReceiptDetails({ receipt, canManage, canAdjust, program, filters }: CommonProps & { receipt: Receipt }) {
    const { slug } = useInventoryContext();
    const mutation = useInventoryMutation();
    const [command, setCommand] = useState<'post' | 'void' | null>(null);
    const [reason, setReason] = useState('');
    const args = { municipality: slug, receiptId: receipt.id };
    const programIds = new Set(receipt.lines.map((line) => line.program_id));
    const mixed = receipt.is_mixed_program || programIds.size > 1 || (receipt.programs?.length ?? 0) > 1;
    const scopedEdit = program && !mixed && programIds.size === 1 && programIds.has(program.id);
    const unavailable = receipt.status === 'draft' && receipt.lines.some((line) => line.receivable === false);
    const execute = async () => {
        const result = await mutation.submit(
            command === 'post'
                ? goodsDistribution.inventory.api.receipts.post.url({ receiptId: receipt.id })
                : goodsDistribution.inventory.api.receipts.void.url({ receiptId: receipt.id }),
            command === 'post' ? { draft_fingerprint: receipt.draft_fingerprint } : { reason },
        );
        if (result) {
            setCommand(null);
            router.reload();
        }
    };
    return (
        <DirectoryLayout
            title={receipt.receipt_number}
            program={program}
            actions={
                <div className="flex flex-wrap items-center gap-2 [&_a]:shadow-none [&_button]:shadow-none">
                    <Button asChild variant="outline" className="border-[#dfe6e1] bg-white">
                        <Link
                            href={
                                program
                                    ? `${programUrl(slug, program.id)}?tab=receipts`
                                    : withProgram(goodsDistribution.inventory.receipts.index.url({ municipality: slug }), filters?.program_id)
                            }
                        >
                            <ArrowLeft className="size-4" />
                            Receipts
                        </Link>
                    </Button>
                    <Button variant="outline" size="icon" title="Refresh receipt" aria-label="Refresh receipt" onClick={() => router.reload()}>
                        <RefreshCw className="size-4" />
                    </Button>
                    {receipt.status === 'draft' && canManage && (
                        <>
                            <Button asChild variant="outline">
                                <Link
                                    href={
                                        scopedEdit
                                            ? programUrl(slug, program.id, 'edit', receipt.id)
                                            : goodsDistribution.inventory.receipts.edit.url(args)
                                    }
                                >
                                    <Pencil className="size-4" />
                                    Edit draft
                                </Link>
                            </Button>
                            <Button
                                className="bg-[#245e4f] text-white hover:bg-[#194c3e]"
                                disabled={unavailable}
                                onClick={() => {
                                    mutation.clearErrors();
                                    setCommand('post');
                                }}
                            >
                                <CheckCircle2 className="size-4" />
                                Post receipt
                            </Button>
                        </>
                    )}
                    {receipt.status !== 'voided' && (receipt.status === 'draft' ? canManage : canAdjust) && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                mutation.clearErrors();
                                setReason('');
                                setCommand('void');
                            }}
                        >
                            <XCircle className="size-4" />
                            Void receipt
                        </Button>
                    )}
                </div>
            }
        >
            <div className="flex flex-wrap items-center gap-3">
                <StateBadge value={receipt.status} />
                {receipt.kind === 'opening' && <StateBadge value="opening stock" />}
            </div>
            {unavailable && (
                <p role="alert" className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    An item is unavailable in its program or the shared catalog. Enable the item or edit the draft selection, then refresh and review
                    before posting.
                </p>
            )}
            <section
                className={`space-y-2 border-l-2 px-3 py-2 ${mixed ? 'border-amber-500 bg-amber-50' : 'border-[#dfe6e1]'}`}
                aria-label="Receipt programs"
            >
                <ReceiptPrograms receipt={receipt} />
                {mixed && (
                    <p className="text-sm">This receipt contains multiple programs. Posting or voiding affects every line and all programs shown.</p>
                )}
            </section>
            <dl className="grid gap-x-6 gap-y-5 border-y border-[#dfe6e1] py-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
                {[
                    ['Source / Donor', receipt.source_name],
                    ['Storage', receipt.location_name],
                    ['Received date', receipt.received_on],
                    ['Reference', receipt.reference],
                    ['Recorded by', receipt.created_by],
                    ['Posted by', receipt.posted_by],
                    ['Posted at', receipt.posted_at ? new Date(receipt.posted_at).toLocaleString() : null],
                    ['Notes', receipt.notes],
                ].map(([label, value]) => (
                    <div key={label}>
                        <dt className="text-xs text-[#75827c]">{label}</dt>
                        <dd className="mt-1 break-words">{value || '-'}</dd>
                    </div>
                ))}
            </dl>
            {receipt.status === 'voided' && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    <p className="font-medium">
                        Voided by {receipt.voided_by ?? 'staff'}
                        {receipt.voided_at && ` on ${new Date(receipt.voided_at).toLocaleString()}`}
                    </p>
                    <p className="mt-1">{receipt.void_reason}</p>
                </div>
            )}
            <DirectoryPanel
                label="Received items"
                countLabel={`${receipt.lines.length} ${receipt.lines.length === 1 ? 'item' : 'items'}`}
                toolbar={<h2 className="text-sm font-medium">Receipt lines</h2>}
            >
                <table className="w-full table-fixed text-left text-sm">
                    <thead className="hidden border-y border-[#e8ede9] bg-[#f8faf9] text-xs text-[#75827c] lg:table-header-group">
                        <tr>
                            {['Item', 'Program', 'Packaging', 'Received quantity', 'Expiry', 'Batch'].map((label) => (
                                <th key={label} className={`px-3 py-3 font-medium ${label === 'Received quantity' ? 'text-right' : ''}`}>
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="block lg:table-row-group">
                        {receipt.lines.map((line) => (
                            <tr
                                key={line.id}
                                className="grid grid-cols-2 border-b border-[#e8ede9] last:border-b-0 hover:bg-[#fafcfb] lg:table-row [&>td]:min-w-0 [&>td]:[overflow-wrap:anywhere]"
                            >
                                <td className="px-3 py-4">
                                    <Link
                                        className="font-medium text-[#245e4f] hover:underline"
                                        href={withProgram(
                                            goodsDistribution.inventory.item.url({ municipality: slug, itemId: line.item_id }),
                                            line.program_id ?? 'unassigned',
                                        )}
                                    >
                                        {line.item_name}
                                    </Link>
                                    {line.notes && <p className="mt-1 text-xs text-muted-foreground">{line.notes}</p>}
                                </td>
                                <td className="px-3 py-4">
                                    <span className="block text-xs text-[#75827c] lg:hidden">Program</span>
                                    {line.program_name ?? 'Unassigned'}
                                </td>
                                <td className="px-3 py-4">
                                    <span className="block text-xs text-[#75827c] lg:hidden">Packaging</span>
                                    {line.package_type
                                        ? `${line.package_count} ${line.package_type}${Number(line.package_count) !== 1 ? 's' : ''} x ${quantity(line.quantity_per_package ?? '0')} ${line.base_unit}`
                                        : '-'}
                                </td>
                                <td className="px-3 py-4 text-right font-semibold tabular-nums">
                                    <span className="block text-xs font-normal text-muted-foreground lg:hidden">Received quantity</span>
                                    {quantity(line.quantity)} {line.base_unit}
                                </td>
                                <td className="px-3 py-4">
                                    <span className="block text-xs text-muted-foreground lg:hidden">Expiry</span>
                                    {line.expires_on ?? '-'}
                                    {line.expiry_state === 'expired' && (
                                        <div className="mt-1">
                                            <StateBadge value="expired" />
                                        </div>
                                    )}
                                </td>
                                <td className="px-3 py-4">
                                    <span className="block text-xs text-muted-foreground lg:hidden">Batch</span>
                                    {line.batch_reference ?? '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </DirectoryPanel>
            <Dialog
                open={command !== null}
                onOpenChange={(value) => {
                    if (!value && !mutation.busy) setCommand(null);
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto border-[#dfe6e1] text-[#243c33]">
                    <DialogHeader>
                        <DialogTitle>{command === 'post' ? 'Post stock receipt' : 'Void stock receipt'}</DialogTitle>
                    </DialogHeader>
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            void execute();
                        }}
                    >
                        <Errors errors={mutation.errors} />
                        <div className="space-y-2 border-b border-border pb-3">
                            <ReceiptPrograms receipt={receipt} />
                            {mixed && (
                                <p className="text-sm font-medium text-amber-800">
                                    {command === 'post' ? 'Post' : 'Void'} all lines across all programs in this receipt.
                                </p>
                            )}
                        </div>
                        {command === 'post' ? (
                            <ul className="space-y-2 text-sm">
                                {receipt.lines.map((line) => (
                                    <li key={line.id} className="flex justify-between gap-4 border-b border-border pb-2">
                                        <span className="min-w-0 break-words">
                                            {line.item_name}
                                            <span className="block text-xs text-muted-foreground">{line.program_name ?? 'Unassigned'}</span>
                                        </span>
                                        <strong className="shrink-0">
                                            {quantity(line.quantity)} {line.base_unit}
                                        </strong>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Field label="Reason">
                                <textarea
                                    required
                                    minLength={5}
                                    maxLength={1000}
                                    className={`${inputClass} h-24 py-2`}
                                    value={reason}
                                    onChange={(event) => setReason(event.target.value)}
                                />
                            </Field>
                        )}
                        <DialogFooter>
                            <Button variant="outline" type="button" disabled={mutation.busy} onClick={() => setCommand(null)}>
                                Cancel
                            </Button>
                            <Button
                                className={
                                    command === 'post' ? 'bg-[#245e4f] text-white hover:bg-[#194c3e]' : 'bg-red-700 text-white hover:bg-red-800'
                                }
                                type="submit"
                                disabled={mutation.busy}
                            >
                                {command === 'post' ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                                {command === 'post' ? 'Post receipt' : 'Void receipt'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DirectoryLayout>
    );
}
