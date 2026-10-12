import { Button } from '@/components/ui/button';
import goodsDistribution from '@/routes/goodsDistribution';
import { router } from '@inertiajs/react';
import { Pencil, Plus, Power } from 'lucide-react';
import { useState } from 'react';
import AttachProgramItemDialog from './AttachProgramItemDialog';
import { Errors, Filters, inputClass, programUrl, useInventoryContext, useInventoryMutation } from './components';
import { DirectoryPagination, DirectoryPanel, DirectoryStatus } from './DirectoryLayout';
import ItemDialog from './ItemDialog';
import type { CatalogRecord, PageData, Program, ProgramItemRecord } from './types';

export default function ProgramItems({
    program,
    records,
    filters,
    canManage,
}: {
    program: Program;
    records: PageData<ProgramItemRecord>;
    filters: Record<string, string>;
    canManage: boolean;
}) {
    const { slug } = useInventoryContext();
    const mutation = useInventoryMutation();
    const [dialog, setDialog] = useState<'existing' | 'new' | null>(null);
    const [reactivating, setReactivating] = useState<ProgramItemRecord | null>(null);
    const [editing, setEditing] = useState<CatalogRecord | null>(null);
    const refreshed = () => {
        setDialog(null);
        setReactivating(null);
        setEditing(null);
        router.reload();
    };
    const toggle = async (record: ProgramItemRecord, reactivateGlobal = false) => {
        if (!record.is_active && !record.item.is_active && !reactivateGlobal) {
            setReactivating(record);
            return;
        }
        const result = await mutation.submit(
            goodsDistribution.inventory.api.programItems.update.url({ programId: program.id, itemId: record.item.id }),
            { is_active: !record.is_active, reactivate_global: reactivateGlobal },
            'patch',
        );
        if (result) refreshed();
    };
    return (
        <>
            <Errors errors={mutation.errors} />
            <DirectoryPanel
                label="Program items"
                countLabel={`${records.meta.total.toLocaleString()} items`}
                toolbar={
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Filters appearance="directory" filters={{ ...filters, tab: 'items' }} url={programUrl(slug, program.id)}>
                            <select
                                aria-label="Program availability"
                                className={`${inputClass} sm:w-40`}
                                value={filters.active ?? ''}
                                onChange={(event) =>
                                    router.get(
                                        programUrl(slug, program.id),
                                        { ...filters, tab: 'items', active: event.target.value, page: 1 },
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                <option value="">All program items</option>
                                <option value="active">Enabled</option>
                                <option value="inactive">Disabled</option>
                            </select>
                        </Filters>
                        {canManage && program.is_active && (
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" onClick={() => setDialog('existing')}>
                                    <Plus className="size-4" />
                                    Add existing item
                                </Button>
                                <Button size="sm" className="bg-[#245e4f] text-white hover:bg-[#194c3e]" onClick={() => setDialog('new')}>
                                    <Plus className="size-4" />
                                    Create item
                                </Button>
                            </div>
                        )}
                    </div>
                }
            >
                <table className="w-full table-fixed text-left text-sm">
                    <colgroup className="hidden md:table-column-group">
                        <col className="w-[35%]" />
                        <col className="w-[10%]" />
                        <col className="w-[20%]" />
                        <col className="w-[20%]" />
                        <col className="w-[15%]" />
                    </colgroup>
                    <thead className="hidden border-y border-[#e8ede9] bg-[#f8faf9] text-xs text-[#75827c] md:table-header-group">
                        <tr>
                            {['Item', 'Unit', 'Shared catalog', 'In this program', ''].map((label, index) => (
                                <th key={index} className="px-5 py-3 font-medium">
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="block md:table-row-group">
                        {records.data.map((record) => (
                            <tr
                                key={record.id}
                                className="grid grid-cols-2 border-b border-[#e8ede9] last:border-b-0 hover:bg-[#fafcfb] md:table-row"
                            >
                                <td className="col-span-2 min-w-0 px-5 py-4 [overflow-wrap:anywhere]">
                                    <p className="font-medium">{record.item.name}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{record.item.code}</p>
                                </td>
                                <td className="px-5 py-4">
                                    <span className="block text-xs text-muted-foreground md:hidden">Unit</span>
                                    {record.item.base_unit}
                                </td>
                                <td className="px-5 py-4">
                                    <span className="mb-1 block text-xs text-muted-foreground md:hidden">Shared catalog</span>
                                    <DirectoryStatus active={record.item.is_active} />
                                </td>
                                <td className="px-5 py-4">
                                    <span className="mb-1 block text-xs text-muted-foreground md:hidden">In this program</span>
                                    <span className={`text-xs font-medium ${record.is_active ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                                        {record.is_active ? 'Enabled' : 'Disabled'}
                                    </span>
                                </td>
                                <td className="px-3 py-3 text-right">
                                    {canManage && (
                                        <div className="flex flex-wrap justify-end gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                disabled={mutation.busy}
                                                className="text-[#607d6b] hover:bg-[#eaf1ed]"
                                                title="Edit shared item"
                                                aria-label={`Edit shared item ${record.item.name}`}
                                                onClick={() => {
                                                    mutation.clearErrors();
                                                    setEditing(record.item);
                                                }}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            {(program.is_active || record.is_active) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={mutation.busy}
                                                    title={record.is_active ? 'Disable in this program' : 'Enable in this program'}
                                                    aria-label={`${record.is_active ? 'Disable' : 'Enable'} ${record.item.name} in this program`}
                                                    onClick={() => void toggle(record)}
                                                >
                                                    <Power className="size-4" />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!records.data.length && <p className="py-10 text-center text-sm text-muted-foreground">No program items found.</p>}
                <DirectoryPagination records={records} />
            </DirectoryPanel>
            {dialog === 'existing' && <AttachProgramItemDialog programId={program.id} onClose={() => setDialog(null)} onSaved={refreshed} />}
            {dialog === 'new' && <ItemDialog programId={program.id} receiving onClose={() => setDialog(null)} onSaved={refreshed} />}
            {editing && <ItemDialog item={editing} onClose={() => setEditing(null)} onSaved={refreshed} />}
            {reactivating && (
                <AttachProgramItemDialog
                    programId={program.id}
                    initialItem={reactivating.item}
                    onClose={() => setReactivating(null)}
                    onSaved={refreshed}
                />
            )}
        </>
    );
}
