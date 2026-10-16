import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { inputClass, StateBadge, useInventoryContext } from '../Inventory/components';
import { DirectoryLayout, DirectoryPagination, DirectoryPanel } from '../Inventory/DirectoryLayout';
import ResponsiveTable from '../ResponsiveTable';
import type { PageData } from '../Inventory/types';
import type { BulkDispatch, BulkOptions, BulkPermissions, BulkStatus } from './types';

const statuses: BulkStatus[] = ['draft', 'approved', 'dispatched', 'closed', 'cancelled'];

export default function Index({ records, options, permissions, filters }: {
    records: PageData<BulkDispatch>;
    options: BulkOptions;
    permissions: BulkPermissions;
    filters: Record<string, string>;
}) {
    const { slug } = useInventoryContext();
    const routes = goodsDistribution.bulk;
    const [values, setValues] = useState(filters);
    const listUrl = routes.index.url({ municipality: slug });
    return <DirectoryLayout rootHref={listUrl} title="Bulk Dispatches" actions={permissions.prepare &&
        <Button asChild className="bg-[#245e4f] text-white shadow-none hover:bg-[#194c3e]">
            <Link href={routes.create.url({ municipality: slug })}><Plus className="size-4" />New bulk dispatch</Link>
        </Button>}>
        <DirectoryPanel label="Dispatch records" countLabel={`${records.meta.total} records`} toolbar={
            <form className="flex w-full flex-wrap items-end gap-2" onSubmit={(event) => { event.preventDefault(); router.get(listUrl, Object.fromEntries(Object.entries(values).filter(([key, value]) => key !== 'page' && value))); }}>
                <Input aria-label="Search dispatches" placeholder="Reference, requester or custodian" className="w-full sm:w-64" value={values.search ?? ''} onChange={(event) => setValues({ ...values, search: event.target.value })} />
                <select aria-label="Program" className={`${inputClass} sm:w-44`} value={values.program_id ?? ''} onChange={(event) => setValues({ ...values, program_id: event.target.value })}>
                    <option value="">All programs</option>{options.programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
                </select>
                <select aria-label="Status" className={`${inputClass} sm:w-36`} value={values.status ?? ''} onChange={(event) => setValues({ ...values, status: event.target.value })}>
                    <option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <select aria-label="Custodian type" className={`${inputClass} sm:w-44`} value={values.custodian_type ?? ''} onChange={(event) => setValues({ ...values, custodian_type: event.target.value })}>
                    <option value="">All custodians</option>{options.custodian_types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
                <select aria-label="Purpose" className={`${inputClass} sm:w-56`} value={values.purpose ?? ''} onChange={(event) => setValues({ ...values, purpose: event.target.value })}>
                    <option value="">All purposes</option>{options.purposes.map((purpose) => <option key={purpose.value} value={purpose.value}>{purpose.label}</option>)}
                </select>
                <Input aria-label="Destination barangay" placeholder="Destination barangay" className="w-full sm:w-44" list="bulk-barangay-options" value={values.barangay ?? ''} onChange={(event) => setValues({ ...values, barangay: event.target.value })} />
                <datalist id="bulk-barangay-options">{options.barangays.map((name) => <option key={name} value={name} />)}</datalist>
                <Input aria-label="Created from" type="date" className="w-full sm:w-40" value={values.from ?? ''} onChange={(event) => setValues({ ...values, from: event.target.value })} />
                <Input aria-label="Created to" type="date" className="w-full sm:w-40" value={values.to ?? ''} onChange={(event) => setValues({ ...values, to: event.target.value })} />
                <Button type="submit" variant="outline" size="icon" title="Apply filters" aria-label="Apply filters"><Search className="size-4" /></Button>
            </form>}>
            <div className="overflow-x-auto">
                <ResponsiveTable className="w-full table-fixed text-left text-sm">
                    <thead className="hidden border-y border-[#e8ede9] bg-[#f8faf9] text-xs text-muted-foreground @min-[800px]/goods:table-header-group"><tr>
                        {['Reference / Program', 'Requester / Custodian', 'Destinations', 'Status / Date'].map((label) => <th key={label} className="px-5 py-3 font-medium">{label}</th>)}
                    </tr></thead>
                    <tbody className="block @min-[800px]/goods:table-row-group">{records.data.map((record) => <tr key={record.id} className="grid grid-cols-2 border-b border-[#e8ede9] last:border-0 hover:bg-[#fafcfb] @min-[800px]/goods:table-row">
                        <td className="min-w-0 px-5 py-4 [overflow-wrap:anywhere]"><Link href={routes.show.url({ municipality: slug, dispatchId: record.id })} className="font-medium text-[#245e4f] hover:underline">{record.reference}</Link><p className="mt-1 text-xs text-muted-foreground">{record.program_name}</p></td>
                        <td className="min-w-0 px-5 py-4 [overflow-wrap:anywhere]"><span className="text-muted-foreground">Requested by</span> {record.requester_name ?? 'Not recorded'}<p className="mt-1 text-xs"><span className="text-muted-foreground">Custodian</span> {record.custodian_name ?? 'Not assigned'}</p><p className="mt-1 text-xs text-muted-foreground">{record.custodian_type_label}</p></td>
                        <td className="min-w-0 px-5 py-4 [overflow-wrap:anywhere]">{record.destination_barangays.length ? record.destination_barangays.join(', ') : 'Not specified'}<p className="mt-1 text-xs text-muted-foreground">{record.purpose_label}</p></td>
                        <td className="min-w-0 px-5 py-4 text-right @min-[800px]/goods:text-left"><StateBadge value={record.status} /><p className="mt-1 text-xs text-muted-foreground">{record.created_at.slice(0, 10)}</p></td>
                    </tr>)}</tbody>
                </ResponsiveTable>
                {!records.data.length && <p className="py-10 text-center text-sm text-muted-foreground">No bulk dispatches found.</p>}
            </div>
            <DirectoryPagination records={records} />
        </DirectoryPanel>
    </DirectoryLayout>;
}
