import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link } from '@inertiajs/react';
import { ArrowRight, ClipboardList, Plus } from 'lucide-react';
import { Filters, programUrl, ReceiptPrograms, StateBadge, useInventoryContext, withProgram } from './components';
import { DirectoryLayout, DirectoryPagination, DirectoryPanel } from './DirectoryLayout';
import type { CommonProps, Options, PageData, Receipt } from './types';

export default function Receipts({ records, filters, canManage, program, options }: CommonProps & { records: PageData<Receipt>; options?: Options }) {
    const { slug } = useInventoryContext();
    return (
        <DirectoryLayout
            title="Stock Receipts"
            program={program}
            actions={
                canManage && (
                    <Button asChild className="h-9 bg-[#245e4f] text-white shadow-none hover:bg-[#194c3e]">
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
                label="Stock receipts"
                countLabel={`${records.meta.total.toLocaleString()} ${records.meta.total === 1 ? 'receipt' : 'receipts'}`}
                toolbar={
                    <div className="w-full space-y-3">
                        <Filters
                            appearance="directory"
                            filters={filters}
                            options={options}
                            program={program}
                            period
                            url={goodsDistribution.inventory.receipts.index.url({ municipality: slug })}
                        />
                        <nav aria-label="Receipt status" className="flex flex-wrap gap-1">
                            {['', 'draft', 'posted', 'voided'].map((status) => (
                                <Link
                                    key={status}
                                    aria-current={filters.status === status || (!filters.status && !status) ? 'page' : undefined}
                                    className={`rounded-md px-3 py-1.5 text-xs capitalize ${filters.status === status || (!filters.status && !status) ? 'bg-[#eaf1ed] font-medium text-[#245e4f]' : 'text-[#75827c] hover:bg-[#f4f7f5]'}`}
                                    href={withProgram(
                                        goodsDistribution.inventory.receipts.index.url(
                                            { municipality: slug },
                                            { query: { ...filters, status, page: 1 } },
                                        ),
                                        program?.id,
                                    )}
                                >
                                    {status || 'All'}
                                </Link>
                            ))}
                        </nav>
                    </div>
                }
            >
                <table className="w-full table-fixed text-left text-sm">
                    <caption className="sr-only">Stock receipts and their receiving status</caption>
                    <thead className="hidden border-y border-[#e8ede9] bg-[#f8faf9] text-xs text-[#75827c] @min-[960px]/goods:table-header-group">
                        <tr>
                            {['Receipt', 'Received', 'Source', 'Storage', 'Kind', 'Status', ''].map((label) => (
                                <th key={label} className="px-3 py-3 font-medium">
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="block @min-[960px]/goods:table-row-group">
                        {records.data.map((receipt) => (
                            <tr
                                key={receipt.id}
                                className="grid grid-cols-2 border-b border-[#e8ede9] last:border-b-0 hover:bg-[#fafcfb] @min-[960px]/goods:table-row"
                            >
                                <td className="col-span-2 min-w-0 px-5 py-4 [overflow-wrap:anywhere] @min-[960px]/goods:col-span-1">
                                    <Link
                                        className="font-medium text-[#245e4f] hover:underline"
                                        href={withProgram(
                                            goodsDistribution.inventory.receipts.show.url({ municipality: slug, receiptId: receipt.id }),
                                            program?.id ?? filters.program_id,
                                        )}
                                    >
                                        {receipt.receipt_number}
                                    </Link>
                                    <div className="mt-2">
                                        <ReceiptPrograms receipt={receipt} />
                                    </div>
                                </td>
                                <td className="px-3 py-4 text-xs [overflow-wrap:anywhere] text-[#75827c]">
                                    <span className="block @min-[960px]/goods:hidden">Received</span>
                                    {receipt.received_on}
                                </td>
                                <td className="min-w-0 px-3 py-3 break-words">
                                    <span className="block text-xs text-[#75827c] @min-[960px]/goods:hidden">Source</span>
                                    {receipt.source_name}
                                </td>
                                <td className="min-w-0 px-3 py-3 break-words">
                                    <span className="block text-xs text-[#75827c] @min-[960px]/goods:hidden">Storage</span>
                                    {receipt.location_name}
                                </td>
                                <td className="px-3 py-3 capitalize">{receipt.kind === 'opening' ? 'Opening stock' : 'Receipt'}</td>
                                <td className="px-3 py-3">
                                    <StateBadge value={receipt.status} />
                                </td>
                                <td className="px-3 py-3 text-right">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Link
                                                aria-label={`Open receipt ${receipt.receipt_number}`}
                                                className="inline-flex size-8 items-center justify-center rounded text-[#607d6b] hover:bg-[#eaf1ed]"
                                                href={withProgram(
                                                    goodsDistribution.inventory.receipts.show.url({ municipality: slug, receiptId: receipt.id }),
                                                    program?.id ?? filters.program_id,
                                                )}
                                            >
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent>View receipt</TooltipContent>
                                    </Tooltip>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!records.data.length && (
                    <div className="py-12 text-center text-sm text-[#75827c]">
                        <ClipboardList className="mx-auto mb-3 size-6 text-[#9aaba1]" />
                        No stock receipts found.
                    </div>
                )}
                <DirectoryPagination records={records} />
            </DirectoryPanel>
        </DirectoryLayout>
    );
}
