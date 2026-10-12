import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Filters, programUrl, quantity, ReceiptPrograms, StateBadge, useInventoryContext, withProgram } from './components';
import { DirectoryLayout, DirectoryPagination, DirectoryPanel, DirectoryStatus } from './DirectoryLayout';
import ProgramDocuments, { type DocumentSettings } from './ProgramDocuments';
import ProgramItems from './ProgramItems';
import type { CommonProps, InventoryItem, Movement, Options, PageData, Program, ProgramItemRecord, Receipt } from './types';

type ProgramRecords =
    | { tab: 'documents'; documentSettings: DocumentSettings }
    | { tab: 'items'; records: PageData<ProgramItemRecord> }
    | { tab: 'stock'; records: PageData<InventoryItem> }
    | { tab: 'receipts'; records: PageData<Receipt> }
    | { tab: 'movements'; records: PageData<Movement> };
export type ProgramDetailsProps = Omit<CommonProps, 'program'> & {
    program: Program;
    options: Options;
    canIntakeDistribution?: boolean;
} & ProgramRecords;

export default function ProgramDetails(props: ProgramDetailsProps) {
    const { program, tab, filters, options, canManage } = props;
    const { slug } = useInventoryContext();
    const url = programUrl(slug, program.id);
    const itemUrl = (id: string) => withProgram(goodsDistribution.inventory.item.url({ municipality: slug, itemId: id }), program.id);
    const receiptUrl = (id: string) => withProgram(goodsDistribution.inventory.receipts.show.url({ municipality: slug, receiptId: id }), program.id);
    const cell = 'min-w-0 px-5 py-4 [overflow-wrap:anywhere]';
    const row = 'grid grid-cols-2 border-b border-[#e8ede9] last:border-b-0 hover:bg-[#fafcfb] py-2 md:table-row md:py-0';
    return (
        <DirectoryLayout
            title={program.name}
            actions={
                <div className="flex flex-wrap gap-2">
                    {props.canIntakeDistribution && program.is_active && (
                        <Button variant="outline" asChild>
                            <Link href={`${goodsDistribution.requests.create.url({ municipality: slug })}?program_id=${program.id}`}>
                                <Plus className="size-4" />
                                New distribution
                            </Link>
                        </Button>
                    )}
                    {canManage && program.is_active && (
                        <Button asChild className="h-9 bg-[#245e4f] text-white shadow-none hover:bg-[#194c3e]">
                            <Link href={programUrl(slug, program.id, 'create')}>
                                <Plus className="size-4" />
                                Receive stock
                            </Link>
                        </Button>
                    )}
                </div>
            }
        >
            <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-muted-foreground">{program.code}</span>
                <DirectoryStatus active={program.is_active} />
                {program.description && <p className="w-full max-w-3xl break-words text-muted-foreground">{program.description}</p>}
            </div>
            <Tabs value={tab} onValueChange={(value) => router.get(url, { tab: value }, { preserveScroll: true })}>
                <TabsList className="max-w-full bg-[#eaf1ed] shadow-none">
                    {(['stock', 'items', 'receipts', 'movements', 'documents'] as const).map((value) => (
                        <TabsTrigger key={value} value={value} className="capitalize">
                            {value}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
            {props.tab === 'documents' ? (
                <ProgramDocuments
                    key={props.documentSettings.requirements_fingerprint}
                    programId={program.id}
                    settings={props.documentSettings}
                    canManage={canManage}
                />
            ) : props.tab === 'items' ? (
                <ProgramItems program={program} records={props.records} filters={filters} canManage={canManage} />
            ) : (
                <DirectoryPanel
                    label={tab === 'stock' ? 'Program stock' : tab === 'receipts' ? 'Program receipts' : 'Stock movements'}
                    countLabel={`${props.records.meta.total.toLocaleString()} records`}
                    toolbar={
                        <div className="w-full space-y-3">
                            <Filters
                                appearance="directory"
                                key={`${program.id}-${tab}`}
                                filters={{ ...filters, tab }}
                                options={tab === 'stock' ? options : undefined}
                                program={program}
                                period={tab !== 'stock'}
                                stock={tab === 'stock'}
                                url={url}
                            />
                            {tab === 'receipts' && (
                                <nav aria-label="Receipt status" className="flex flex-wrap gap-1 text-xs">
                                    {['', 'draft', 'posted', 'voided'].map((status) => (
                                        <Link
                                            key={status}
                                            aria-current={(filters.status ?? '') === status ? 'page' : undefined}
                                            className={`rounded-md px-3 py-1.5 capitalize ${(filters.status ?? '') === status ? 'bg-[#eaf1ed] font-medium text-[#245e4f]' : 'text-[#75827c] hover:bg-[#f4f7f5]'}`}
                                            href={`${url}?${new URLSearchParams({ ...filters, program_id: program.id, tab, status, page: '1' })}`}
                                        >
                                            {status || 'All receipts'}
                                        </Link>
                                    ))}
                                </nav>
                            )}
                        </div>
                    }
                >
                    <div className="[&_a]:text-[#245e4f] [&_table]:table-fixed [&_th]:font-medium [&_thead]:border-y [&_thead]:border-[#e8ede9] [&_thead]:bg-[#f8faf9] [&_thead]:text-xs [&_thead]:text-[#75827c]">
                        {props.tab === 'stock' && (
                            <table className="w-full text-left text-sm">
                                <thead className="hidden border-b bg-muted/40 md:table-header-group">
                                    <tr>
                                        <th className={cell}>Item</th>
                                        <th className={cell}>Status</th>
                                        <th className={`${cell} text-right`}>On hand / Reserved / Available</th>
                                    </tr>
                                </thead>
                                <tbody className="block md:table-row-group">
                                    {props.records.data.map((item) => (
                                        <tr key={item.id} className={row}>
                                            <td className={`${cell} min-w-0`}>
                                                <Link className="font-medium text-blue-700 hover:underline" href={itemUrl(item.id)}>
                                                    {item.name}
                                                </Link>
                                                <p className="mt-1 text-xs text-muted-foreground">{item.code}</p>
                                            </td>
                                            <td className={`${cell} text-right md:text-left`}>
                                                <DirectoryStatus active={item.is_active} />
                                            </td>
                                            <td className={`${cell} col-span-2 text-right font-semibold tabular-nums`}>
                                                <span className="mr-2 text-xs font-normal text-muted-foreground md:hidden">Remaining stock</span>
                                                {quantity(item.balance)} {item.base_unit}
                                                <p className="mt-1 text-xs font-normal text-muted-foreground">
                                                    Reserved {quantity(item.reserved ?? '0')} {item.base_unit}
                                                </p>
                                                <p className="mt-1 text-xs text-[#245e4f]">
                                                    Available {quantity(item.available ?? item.balance)} {item.base_unit}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {props.tab === 'receipts' && (
                            <table className="w-full text-left text-sm">
                                <thead className="hidden border-b bg-muted/40 md:table-header-group">
                                    <tr>
                                        {['Receipt', 'Received', 'Source / Storage', 'Status'].map((label) => (
                                            <th key={label} className={cell}>
                                                {label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="block md:table-row-group">
                                    {props.records.data.map((receipt) => (
                                        <tr key={receipt.id} className={row}>
                                            <td className={`${cell} min-w-0`}>
                                                <Link className="font-medium text-blue-700 hover:underline" href={receiptUrl(receipt.id)}>
                                                    {receipt.receipt_number}
                                                </Link>
                                                <div className="mt-2">
                                                    <ReceiptPrograms receipt={receipt} />
                                                </div>
                                            </td>
                                            <td className={`${cell} text-right md:text-left`}>{receipt.received_on}</td>
                                            <td className={cell}>
                                                {receipt.source_name}
                                                <p className="text-xs text-muted-foreground">{receipt.location_name}</p>
                                            </td>
                                            <td className={`${cell} text-right md:text-left`}>
                                                <StateBadge value={receipt.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {props.tab === 'movements' && (
                            <table className="w-full text-left text-sm">
                                <thead className="hidden border-b bg-muted/40 md:table-header-group">
                                    <tr>
                                        {['Date / Item', 'Type / Receipt', 'Reason / Reference', 'Quantity'].map((label) => (
                                            <th key={label} className={`${cell} ${label === 'Quantity' ? 'text-right' : ''}`}>
                                                {label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="block md:table-row-group">
                                    {props.records.data.map((movement) => (
                                        <tr key={movement.id} className={row}>
                                            <td className={cell}>
                                                {movement.occurred_on}
                                                {movement.item_id && (
                                                    <p className="mt-1">
                                                        <Link className="text-blue-700 hover:underline" href={itemUrl(movement.item_id)}>
                                                            {movement.item_name}
                                                        </Link>
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">{movement.batch_reference}</p>
                                            </td>
                                            <td className={cell}>
                                                <span className="capitalize">{movement.type}</span>
                                                <p className="mt-1">
                                                    <Link className="text-blue-700 hover:underline" href={receiptUrl(movement.receipt.id)}>
                                                        {movement.receipt.receipt_number}
                                                    </Link>
                                                </p>
                                                {movement.reversal_id && <StateBadge value="reversed" />}
                                            </td>
                                            <td className={cell}>
                                                {movement.reason ?? '-'}
                                                {props.canViewDistribution && movement.distribution_request_id ? (
                                                    <Link
                                                        className="text-xs text-[#245e4f] underline"
                                                        href={goodsDistribution.requests.show.url({
                                                            municipality: slug,
                                                            requestId: movement.distribution_request_id,
                                                        })}
                                                    >
                                                        {movement.reference}
                                                    </Link>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground">{movement.reference}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground">{movement.actor}</p>
                                            </td>
                                            <td
                                                className={`${cell} text-right font-semibold tabular-nums ${movement.quantity.startsWith('-') ? 'text-red-700' : 'text-emerald-700'}`}
                                            >
                                                {quantity(movement.quantity)} {movement.base_unit}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {!props.records.data.length && (
                            <p className="py-10 text-center text-sm text-muted-foreground">No {tab === 'stock' ? 'stock items' : tab} found.</p>
                        )}
                    </div>
                    <DirectoryPagination records={props.records as PageData<InventoryItem | Receipt | Movement>} />
                </DirectoryPanel>
            )}
        </DirectoryLayout>
    );
}
