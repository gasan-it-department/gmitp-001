import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { inputClass, StateBadge, useInventoryContext } from '../Inventory/components';
import { DirectoryPagination, DirectoryPanel } from '../Inventory/DirectoryLayout';
import { RequestPersonLink } from '../RecipientProfileLinks';
import ResponsiveTable from '../ResponsiveTable';
import { distributionProgramContext } from './programContext';
import type { GoodsRequest, Options, PageData, Permissions, Status } from './types';

const statuses: Status[] = ['draft', 'pending', 'under_review', 'returned', 'approved', 'released', 'cancelled'];
export type RequestListProps = {
    records: PageData<GoodsRequest>;
    options: Pick<Options, 'programs'>;
    permissions?: Permissions;
    filters: Record<string, string>;
    programId?: string;
};
export default function RequestList({ records, options, filters, programId }: RequestListProps) {
    const { slug } = useInventoryContext();
    const routes = goodsDistribution.requests;
    const [values, setValues] = useState(filters);
    const context = programId ? distributionProgramContext(programId, filters) : undefined;
    const listUrl = programId
        ? goodsDistribution.inventory.programsShow.url({ municipality: slug, programId })
        : routes.index.url({ municipality: slug });
    return (
        <DirectoryPanel
            label="Distribution requests"
            countLabel={`${records.meta.total} records`}
            toolbar={
                <form
                    className="flex w-full flex-wrap gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.get(listUrl, { ...values, page: 1, ...(programId ? { tab: 'distributions', program_id: programId } : {}) });
                    }}
                >
                    <Input
                        aria-label="Search recipient, household or reference"
                        placeholder="Name, household or reference"
                        className="w-full sm:w-64"
                        value={values.search ?? ''}
                        onChange={(e) => setValues({ ...values, search: e.target.value })}
                    />
                    {!programId && (
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
                    )}
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
                        aria-label="Created from date"
                        type="date"
                        className="w-full sm:w-40"
                        value={values.from ?? ''}
                        onChange={(e) => setValues({ ...values, from: e.target.value })}
                    />
                    <Input
                        aria-label="Created to date"
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
            <ResponsiveTable className="goods-request-list w-full table-fixed text-left text-sm">
                <thead className="hidden border-y border-[#e8ede9] bg-[#f8faf9] text-xs text-muted-foreground @min-[800px]/goods:table-header-group">
                    <tr>
                        {[programId ? 'Reference' : 'Reference / Program', 'Recipient / Filer', 'Household / Barangay', 'Status / Dates'].map((h) => (
                            <th className="px-5 py-3 font-medium" key={h}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="block @min-[800px]/goods:table-row-group">
                    {records.data.map((r) => {
                        const snapshot = r.status === 'released' ? (r.handover_snapshot ?? r.snapshot) : r.snapshot;
                        return (
                            <tr
                                key={r.id}
                                className="grid grid-cols-2 border-b border-[#e8ede9] last:border-0 hover:bg-[#fafcfb] @min-[800px]/goods:table-row"
                            >
                                <td className="min-w-0 px-5 py-4 [overflow-wrap:anywhere]">
                                    <Link
                                        className="font-medium text-[#245e4f] hover:underline"
                                        href={routes.show.url({ municipality: slug, requestId: r.id }, { query: context })}
                                    >
                                        {r.reference}
                                    </Link>
                                    {!programId && <p className="mt-1 text-xs text-muted-foreground">{r.program_name}</p>}
                                </td>
                                <td className="min-w-0 px-5 py-4 break-words">
                                    <RequestPersonLink slug={slug} request={r} role="recipient" />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Filed by <RequestPersonLink slug={slug} request={r} role="filer" />
                                    </p>
                                </td>
                                <td className="min-w-0 px-5 py-4 break-words">
                                    {snapshot.household_code}
                                    <p className="text-xs text-muted-foreground">{snapshot.barangay}</p>
                                </td>
                                <td className="px-5 py-4">
                                    <StateBadge value={r.status.replaceAll('_', ' ')} />
                                    <p className="mt-1 text-xs text-muted-foreground">Created {r.created_at.slice(0, 10)}</p>
                                    {r.status === 'released' && r.actual_release_on && (
                                        <p className="mt-1 text-xs text-muted-foreground">Handed over {r.actual_release_on.slice(0, 10)}</p>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </ResponsiveTable>
            {!records.data.length && <p className="py-12 text-center text-sm text-muted-foreground">No distribution requests found.</p>}
            <DirectoryPagination records={records} />
        </DirectoryPanel>
    );
}
