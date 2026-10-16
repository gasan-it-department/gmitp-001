import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { inputClass, StateBadge, useInventoryContext } from '../Inventory/components';
import { DirectoryLayout, DirectoryPagination, DirectoryPanel } from '../Inventory/DirectoryLayout';
import { RequestPersonLink } from '../RecipientProfileLinks';
import ResponsiveTable from '../ResponsiveTable';
import type { GoodsRequest, Options, PageData, Permissions, Status } from './types';

const statuses: Status[] = ['draft', 'pending', 'under_review', 'returned', 'approved', 'released', 'cancelled'];
export default function Index({
    records,
    options,
    permissions,
    filters,
}: {
    records: PageData<GoodsRequest>;
    options: Options;
    permissions: Permissions;
    filters: Record<string, string>;
}) {
    const { slug } = useInventoryContext();
    const routes = goodsDistribution.requests;
    const [values, setValues] = useState(filters);
    return (
        <DirectoryLayout
            rootHref={routes.index.url({ municipality: slug })}
            title="Distribution"
            actions={
                permissions.intake && (
                    <Button asChild className="bg-[#245e4f] text-white shadow-none">
                        <Link href={routes.create.url({ municipality: slug })}>
                            <Plus className="size-4" />
                            New distribution
                        </Link>
                    </Button>
                )
            }
        >
            <DirectoryPanel
                label="Distribution requests"
                countLabel={`${records.meta.total} records`}
                toolbar={
                    <form
                        className="flex w-full flex-wrap gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            router.get(routes.index.url({ municipality: slug }), values);
                        }}
                    >
                        <Input
                            aria-label="Search recipient, household or reference"
                            placeholder="Name, household or reference"
                            className="w-full sm:w-64"
                            value={values.search ?? ''}
                            onChange={(e) => setValues({ ...values, search: e.target.value })}
                        />
                        <select
                            aria-label="Program"
                            className={`${inputClass} sm:w-48`}
                            value={values.program_id ?? ''}
                            onChange={(e) => setValues({ ...values, program_id: e.target.value })}
                        >
                            <option value="">All programs</option>
                            {options.programs.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <select
                            aria-label="Status"
                            className={`${inputClass} sm:w-40`}
                            value={values.status ?? ''}
                            onChange={(e) => setValues({ ...values, status: e.target.value })}
                        >
                            <option value="">All statuses</option>
                            {statuses.map((s) => (
                                <option key={s} value={s}>
                                    {s.replaceAll('_', ' ')}
                                </option>
                            ))}
                        </select>
                        <Input
                            aria-label="From date"
                            type="date"
                            className="w-full sm:w-40"
                            value={values.from ?? ''}
                            onChange={(e) => setValues({ ...values, from: e.target.value })}
                        />
                        <Input
                            aria-label="To date"
                            type="date"
                            className="w-full sm:w-40"
                            value={values.to ?? ''}
                            onChange={(e) => setValues({ ...values, to: e.target.value })}
                        />
                        <Button type="submit" variant="outline" size="icon" title="Apply filters" aria-label="Apply filters">
                            <Search className="size-4" />
                        </Button>
                    </form>
                }
            >
                <ResponsiveTable className="w-full table-fixed text-left text-sm">
                    <thead className="hidden border-y border-[#e8ede9] bg-[#f8faf9] text-xs text-muted-foreground @min-[800px]/goods:table-header-group">
                        <tr>
                            {['Reference / Program', 'Recipient / Filer', 'Household', 'Status / Date'].map((h) => (
                                <th className="px-5 py-3 font-medium" key={h}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="block @min-[800px]/goods:table-row-group">
                        {records.data.map((r) => (
                            <tr key={r.id} className="grid grid-cols-2 border-b border-[#e8ede9] last:border-0 hover:bg-[#fafcfb] @min-[800px]/goods:table-row">
                                <td className="min-w-0 px-5 py-4 [overflow-wrap:anywhere]">
                                    <Link
                                        className="font-medium text-[#245e4f] hover:underline"
                                        href={routes.show.url({ municipality: slug, requestId: r.id })}
                                    >
                                        {r.reference}
                                    </Link>
                                    <p className="mt-1 text-xs text-muted-foreground">{r.program_name}</p>
                                </td>
                                <td className="min-w-0 px-5 py-4 break-words">
                                    <RequestPersonLink slug={slug} request={r} role="recipient" />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Filed by <RequestPersonLink slug={slug} request={r} role="filer" />
                                    </p>
                                </td>
                                <td className="min-w-0 px-5 py-4 break-words">
                                    {r.snapshot.household_code}
                                    <p className="text-xs text-muted-foreground">{r.snapshot.barangay}</p>
                                </td>
                                <td className="px-5 py-4">
                                    <StateBadge value={r.status.replaceAll('_', ' ')} />
                                    <p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </ResponsiveTable>
                {!records.data.length && <p className="py-12 text-center text-sm text-muted-foreground">No distribution requests found.</p>}
                <DirectoryPagination records={records} />
            </DirectoryPanel>
        </DirectoryLayout>
    );
}
