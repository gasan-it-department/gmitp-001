import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link } from '@inertiajs/react';
import { ArrowRight, Boxes, Package, Plus } from 'lucide-react';
import { Filters, programUrl, quantity, useInventoryContext, withProgram } from './components';
import { DirectoryLayout, DirectoryPagination, DirectoryPanel, DirectoryStatus } from './DirectoryLayout';
import { useItemCategories } from './ItemCategorySelect';
import type { CommonProps, InventoryItem, Options, PageData } from './types';

export default function Inventory({
    records,
    options,
    filters,
    canManage,
    program,
}: CommonProps & { records: PageData<InventoryItem>; options: Options }) {
    const { slug } = useInventoryContext();
    const categories = useItemCategories();
    const itemUrl = (id: string) =>
        withProgram(goodsDistribution.inventory.item.url({ municipality: slug, itemId: id }), program?.id ?? filters.program_id);
    const filtered = ['search', 'source_id', 'program_id', 'location_id', 'expiry'].some((key) => !!filters[key]);
    return (
        <DirectoryLayout
            title="Inventory"
            program={program}
            actions={
                canManage && (
                    <Button asChild className="h-9 bg-[#245e4f] text-white shadow-none hover:bg-[#194c3e] focus-visible:ring-[#245e4f]">
                        <Link
                            href={
                                program
                                    ? programUrl(slug, program.id, 'create')
                                    : goodsDistribution.inventory.receipts.create.url({ municipality: slug })
                            }
                        >
                            <Plus className="size-4" />
                            Receive stock
                        </Link>
                    </Button>
                )
            }
        >
            <DirectoryPanel
                label={filtered ? 'Filtered inventory' : 'Stock inventory'}
                countLabel={`${records.meta.total.toLocaleString()} ${records.meta.total === 1 ? 'item' : 'items'}`}
                toolbar={
                    <Filters
                        filters={filters}
                        options={options}
                        program={program}
                        stock
                        appearance="directory"
                        url={goodsDistribution.inventory.index.url({ municipality: slug })}
                    />
                }
            >
                <table className="w-full table-fixed text-left text-sm">
                    <caption className="sr-only">Inventory items and remaining stock in their base units</caption>
                    <thead className="hidden border-y border-[#e8ede9] bg-[#f9fbfa] text-[11px] text-[#748078] lg:table-header-group">
                        <tr>
                            <th scope="col" className="px-5 py-3 font-medium">
                                Item
                            </th>
                            <th scope="col" className="w-32 px-3 py-3 font-medium">
                                Code
                            </th>
                            <th scope="col" className="w-28 px-3 py-3 font-medium">
                                Status
                            </th>
                            <th scope="col" className="w-40 px-3 py-3 text-right font-medium">
                                On hand
                            </th>
                            <th scope="col" className="w-16 pr-5">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="block lg:table-row-group">
                        {records.data.map((item) => (
                            <tr
                                key={item.id}
                                className="grid grid-cols-2 items-center gap-y-1 border-t border-[#edf0ee] px-2 py-3 transition-colors first:border-t-0 hover:bg-[#fafcfb] lg:table-row lg:px-0 lg:py-0"
                            >
                                <td className="col-span-2 min-w-0 px-3 py-2 lg:px-5 lg:py-5">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md ${item.is_active ? 'bg-[#edf3ef] text-[#50816d]' : 'bg-[#f4f5f4] text-[#929b96]'}`}
                                        >
                                            <Package className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <Link
                                                className="line-clamp-2 font-semibold [overflow-wrap:anywhere] text-[#2e493c] hover:text-[#245e4f] hover:underline hover:underline-offset-4"
                                                title={item.name}
                                                href={itemUrl(item.id)}
                                            >
                                                {item.name}
                                            </Link>
                                            <p className="mt-1 font-mono text-[11px] [overflow-wrap:anywhere] text-[#87948c] lg:hidden">
                                                {item.code}
                                            </p>
                                            {item.category && (
                                                <p className="mt-1.5 text-xs [overflow-wrap:anywhere] text-[#748078]">
                                                    {categories.label(item.category)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="hidden px-3 py-5 font-mono text-[11px] [overflow-wrap:anywhere] text-[#87948c] lg:table-cell">
                                    {item.code}
                                </td>
                                <td className="px-3 py-4">
                                    <DirectoryStatus active={item.is_active} />
                                </td>
                                <td className="px-3 py-4 text-right font-medium tabular-nums">
                                    <span className="mb-1 block text-[11px] font-normal text-[#87948c] lg:hidden">Remaining stock</span>
                                    {quantity(item.balance)} <span className="text-xs font-normal text-[#75827c]">{item.base_unit}</span>
                                    <p className="mt-1 text-xs font-normal text-muted-foreground">
                                        Reserved {quantity(item.reserved ?? '0')} {item.base_unit}
                                    </p>
                                    <p className="mt-1 text-xs text-[#245e4f]">
                                        Available {quantity(item.available ?? item.balance)} {item.base_unit}
                                    </p>
                                </td>
                                <td className="col-span-2 px-3 py-2 lg:pr-5">
                                    <div className="flex justify-end">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-[#607d6b] hover:bg-[#edf3ef] hover:text-[#245e4f]"
                                                >
                                                    <Link href={itemUrl(item.id)} aria-label={`Open ${item.name}`}>
                                                        <ArrowRight className="size-4" />
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>View batches and movements</TooltipContent>
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
                        <p className="text-sm font-medium text-[#54675a]">No inventory items found.</p>
                    </div>
                )}
                <DirectoryPagination records={records} />
            </DirectoryPanel>
        </DirectoryLayout>
    );
}
