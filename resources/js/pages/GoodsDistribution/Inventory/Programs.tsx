import { Button } from '@/components/ui/button';
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GoodsDialogContent as DialogContent } from '../GoodsDialog';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link, router } from '@inertiajs/react';
import { ArrowRight, Boxes, Layers, Loader2, Pencil, Plus, Power, Save, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Errors, Field, inputClass, programUrl, useInventoryContext, useInventoryMutation } from './components';
import { DirectoryLayout, DirectoryPagination, DirectoryPanel, DirectoryStatus } from './DirectoryLayout';
import type { CatalogRecord, CommonProps, PageData } from './types';

const blank = { name: '', description: '', is_active: true };

export default function Programs({ records, filters, canManage }: CommonProps & { records: PageData<CatalogRecord> }) {
    const { slug } = useInventoryContext();
    const mutation = useInventoryMutation();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<CatalogRecord | null>(null);
    const [form, setForm] = useState(blank);
    const [search, setSearch] = useState(filters.search ?? '');
    const [loading, setLoading] = useState(false);
    const directoryUrl = goodsDistribution.inventory.programs.url({ municipality: slug });
    const filtered = !!filters.search || !!filters.active;
    const applyFilters = (active = filters.active ?? '', term = search) => {
        router.get(
            directoryUrl,
            { ...(term.trim() ? { search: term.trim() } : {}), ...(active ? { active } : {}) },
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            },
        );
    };
    const edit = (record: CatalogRecord | null) => {
        setEditing(record);
        setForm(record ? { name: record.name, description: record.description ?? '', is_active: record.is_active } : blank);
        mutation.clearErrors();
        setOpen(true);
    };
    const save = async (data: typeof blank, record: CatalogRecord | null) => {
        const api = goodsDistribution.inventory.api.catalog;
        const result = await mutation.submit(
            record ? api.update.url({ catalog: 'programs', recordId: record.id }) : api.store.url({ catalog: 'programs' }),
            data,
            record ? 'patch' : 'post',
        );
        if (result) {
            setOpen(false);
            router.reload();
        }
    };
    return (
        <DirectoryLayout
            title="Programs"
            actions={
                canManage && (
                    <Button
                        disabled={mutation.busy}
                        onClick={() => edit(null)}
                        className="h-9 bg-[#245e4f] text-white shadow-none hover:bg-[#194c3e] focus-visible:ring-[#245e4f]"
                    >
                        <Plus className="size-4" /> Add program
                    </Button>
                )
            }
            dialogs={
                <Dialog
                    open={open}
                    onOpenChange={(value) => {
                        if (!mutation.busy) setOpen(value);
                    }}
                >
                    <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-lg border-[#dfe6e1] text-[#243c33] shadow-lg">
                        <DialogHeader>
                            <p className="text-xs text-[#829088]">Goods Distribution / Programs</p>
                            <DialogTitle>{editing ? 'Edit program' : 'Add program'}</DialogTitle>
                        </DialogHeader>
                        <form
                            className="space-y-4"
                            onSubmit={(event) => {
                                event.preventDefault();
                                void save(form, editing);
                            }}
                        >
                            <Errors errors={mutation.errors} />
                            {editing && (
                                <Field label="Code">
                                    <Input readOnly className="border-[#dfe6e1] bg-[#fafcfb] shadow-none" value={editing.code} />
                                </Field>
                            )}
                            <Field label="Name">
                                <Input
                                    required
                                    maxLength={255}
                                    className="border-[#dfe6e1] bg-[#fafcfb] shadow-none"
                                    value={form.name}
                                    onChange={(event) => setForm({ ...form, name: event.target.value.toUpperCase() })}
                                />
                            </Field>
                            <Field label="Description">
                                <textarea
                                    className={`${inputClass} h-24 border-[#dfe6e1] bg-[#fafcfb] py-2`}
                                    maxLength={2000}
                                    value={form.description}
                                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                                />
                            </Field>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    className="accent-[#245e4f]"
                                    onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
                                />
                                Active
                            </label>
                            <DialogFooter className="border-t border-[#e8ede9] pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-[#dfe6e1] shadow-none"
                                    disabled={mutation.busy}
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button disabled={mutation.busy} className="bg-[#245e4f] text-white hover:bg-[#194c3e]">
                                    {mutation.busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                    {mutation.busy ? 'Saving program' : 'Save program'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            }
        >
            <Errors errors={open ? {} : mutation.errors} />
            <DirectoryPanel
                label={filtered ? 'Filtered programs' : 'Program directory'}
                countLabel={`${records.meta.total.toLocaleString()} ${records.meta.total === 1 ? 'program' : 'programs'}`}
                toolbar={
                    <>
                        <div role="group" aria-label="Program status" className="flex shrink-0 items-center gap-1">
                            {[
                                ['', 'All programs'],
                                ['active', 'Active'],
                                ['inactive', 'Inactive'],
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    aria-pressed={(filters.active ?? '') === value}
                                    disabled={loading}
                                    onClick={() => applyFilters(value)}
                                    className={`rounded-md px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245e4f] disabled:opacity-50 ${(filters.active ?? '') === value ? 'bg-[#edf3ef] text-[#245e4f]' : 'text-[#748078] hover:bg-[#f6f8f7] hover:text-[#394c43]'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <form
                            className="flex w-full gap-2 sm:w-auto"
                            onSubmit={(event) => {
                                event.preventDefault();
                                applyFilters();
                            }}
                        >
                            <div className="relative min-w-0 flex-1 sm:w-72">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8b988f]" />
                                <Input
                                    aria-label="Search programs"
                                    placeholder="Search name or code"
                                    maxLength={100}
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="h-9 border-[#dfe6e1] bg-[#fafcfb] pr-9 pl-9 text-sm shadow-none placeholder:text-[#8b988f] focus-visible:border-[#709d8c] focus-visible:ring-[#709d8c]/20"
                                />
                                {(search || filters.search) && (
                                    <button
                                        type="button"
                                        aria-label="Clear search"
                                        title="Clear search"
                                        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-[#748078] hover:text-[#245e4f]"
                                        onClick={() => {
                                            setSearch('');
                                            applyFilters(filters.active ?? '', '');
                                        }}
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                )}
                            </div>
                            <Button
                                type="submit"
                                variant="outline"
                                size="icon"
                                aria-label="Search programs"
                                title="Search programs"
                                disabled={loading}
                                className="size-9 shrink-0 border-[#dfe6e1] text-[#426052] shadow-none hover:bg-[#edf3ef]"
                            >
                                {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                            </Button>
                        </form>
                    </>
                }
            >
                <table aria-busy={loading} className={`w-full table-fixed text-left text-sm transition-opacity ${loading ? 'opacity-50' : ''}`}>
                    <caption className="sr-only">Goods distribution programs, stock counts, and draft receipts</caption>
                    <thead className="hidden border-y border-[#e8ede9] bg-[#f9fbfa] text-[11px] text-[#748078] @min-[960px]/goods:table-header-group">
                        <tr>
                            <th scope="col" className="px-5 py-3 font-medium">
                                Program
                            </th>
                            <th scope="col" className="w-28 px-3 py-3 font-medium">
                                Status
                            </th>
                            <th scope="col" className="w-32 px-3 py-3 text-right font-medium">
                                Items in stock
                            </th>
                            <th scope="col" className="w-32 px-3 py-3 text-right font-medium">
                                Draft receipts
                            </th>
                            <th scope="col" className="w-36 pr-5">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="block @min-[960px]/goods:table-row-group">
                        {records.data.map((record) => (
                            <tr
                                key={record.id}
                                className="group grid grid-cols-2 items-center gap-y-1 border-t border-[#edf0ee] px-2 py-3 transition-colors first:border-t-0 hover:bg-[#fafcfb] @min-[960px]/goods:table-row @min-[960px]/goods:px-0 @min-[960px]/goods:py-0"
                            >
                                <td className="col-span-2 min-w-0 px-3 py-2 @min-[960px]/goods:px-5 @min-[960px]/goods:py-5">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md ${record.is_active ? 'bg-[#edf3ef] text-[#50816d]' : 'bg-[#f4f5f4] text-[#929b96]'}`}
                                        >
                                            <Layers className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <Link
                                                className="line-clamp-2 font-semibold [overflow-wrap:anywhere] text-[#2e493c] hover:text-[#245e4f] hover:underline hover:underline-offset-4"
                                                title={record.name}
                                                href={programUrl(slug, record.id)}
                                            >
                                                {record.name}
                                            </Link>
                                            <p className="mt-1 font-mono text-[11px] [overflow-wrap:anywhere] text-[#87948c]">{record.code}</p>
                                            {record.description && (
                                                <p
                                                    title={record.description}
                                                    className="mt-1.5 line-clamp-2 max-w-xl text-xs leading-5 [overflow-wrap:anywhere] text-[#748078]"
                                                >
                                                    {record.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 py-2">
                                    <DirectoryStatus active={record.is_active} />
                                </td>
                                <td className="px-3 py-2 text-right tabular-nums @min-[960px]/goods:py-5">
                                    <span className="mr-2 text-[11px] text-[#87948c] @min-[960px]/goods:hidden">Items in stock</span>
                                    <Link
                                        href={`${programUrl(slug, record.id)}?tab=stock`}
                                        title={`Stock for ${record.name}`}
                                        className="font-medium text-[#354c40] hover:text-[#245e4f] hover:underline"
                                    >
                                        {record.items_in_stock ?? '-'}
                                    </Link>
                                </td>
                                <td className="px-3 py-2 text-right tabular-nums @min-[960px]/goods:py-5">
                                    <span className="mr-2 text-[11px] text-[#87948c] @min-[960px]/goods:hidden">Draft receipts</span>
                                    <Link
                                        href={`${programUrl(slug, record.id)}?tab=receipts&status=draft`}
                                        title={`Draft receipts for ${record.name}`}
                                        className={`inline-flex items-center gap-1.5 font-medium hover:underline ${(record.draft_receipts_count ?? 0) > 0 ? 'text-[#967334]' : 'text-[#a0aaa3]'}`}
                                    >
                                        {(record.draft_receipts_count ?? 0) > 0 && <span className="size-1.5 rounded-full bg-[#c9a05c]" />}
                                        {record.draft_receipts_count ?? '-'}
                                    </Link>
                                </td>
                                <td className="px-3 py-2 @min-[960px]/goods:pr-5">
                                    <div className="flex justify-end gap-0.5">
                                        {canManage && (
                                            <>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title={`Edit ${record.name}`}
                                                            aria-label={`Edit ${record.name}`}
                                                            disabled={mutation.busy}
                                                            onClick={() => edit(record)}
                                                            className="size-8 text-[#829088] hover:bg-[#edf3ef] hover:text-[#245e4f]"
                                                        >
                                                            <Pencil className="size-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Edit program</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title={record.is_active ? 'Deactivate program' : 'Activate program'}
                                                            aria-label={record.is_active ? 'Deactivate program' : 'Activate program'}
                                                            disabled={mutation.busy}
                                                            className="size-8 text-[#829088] hover:bg-[#edf3ef] hover:text-[#245e4f]"
                                                            onClick={() =>
                                                                void save(
                                                                    {
                                                                        name: record.name,
                                                                        description: record.description ?? '',
                                                                        is_active: !record.is_active,
                                                                    },
                                                                    record,
                                                                )
                                                            }
                                                        >
                                                            <Power className="size-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>{record.is_active ? 'Deactivate program' : 'Activate program'}</TooltipContent>
                                                </Tooltip>
                                            </>
                                        )}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-[#607d6b] hover:bg-[#edf3ef] hover:text-[#245e4f]"
                                                >
                                                    <Link href={programUrl(slug, record.id)} aria-label={`Open ${record.name}`}>
                                                        <ArrowRight className="size-4" />
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Open program</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!records.data.length && (
                    <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
                        <Boxes className="size-8 text-[#a3b4a8]" />
                        <p className="text-sm font-medium text-[#54675a]">{filtered ? 'No matching programs' : 'No programs yet'}</p>
                        {filtered ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-[#dfe6e1] text-[#426052] shadow-none"
                                onClick={() => {
                                    setSearch('');
                                    applyFilters('', '');
                                }}
                            >
                                Clear filters
                            </Button>
                        ) : (
                            canManage && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-[#dfe6e1] text-[#426052] shadow-none"
                                    onClick={() => edit(null)}
                                >
                                    <Plus className="size-4" />
                                    Add program
                                </Button>
                            )
                        )}
                    </div>
                )}
                <DirectoryPagination records={records} />
            </DirectoryPanel>
        </DirectoryLayout>
    );
}
