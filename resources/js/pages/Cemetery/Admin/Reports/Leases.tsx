import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CemeteryReportFilterOptions, LeaseReportFilters, LeaseReportRow, LeaseReportStateValue, SelectOption } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    exportUrl,
    FilterPanel,
    formatBlank,
    ReportHeader,
    ReportInput,
    ReportPagination,
    ReportSelect,
    SummaryCards,
    visitReport,
} from './Components';

interface Props {
    municipality: MunicipalityType;
    rows: PaginatedResponse<LeaseReportRow>;
    summary: { total: number; expired: number; expiring_soon: number; active: number; no_active_lease: number };
    filters: LeaseReportFilters;
    filter_options: CemeteryReportFilterOptions;
    lease_state_options: SelectOption<LeaseReportStateValue>[];
}

export default function Leases({ municipality, rows, summary, filters, filter_options, lease_state_options }: Props) {
    const [form, setForm] = useState<LeaseReportFilters>(filters);
    const path = `/${municipality.slug}/cemetery/admin/reports/leases`;
    const exportPath = `${path}/export`;

    return (
        <AppLayout>
            <Head title="Lease Expiry Report" />
            <div className="m-6 space-y-6">
                <ReportHeader
                    title="Lease Expiry Report"
                    description="Track expired leases, upcoming expirations, and occupied plots without an active responsible person."
                    backHref={`/${municipality.slug}/cemetery/admin/reports`}
                    exportHref={exportUrl(exportPath, form)}
                />

                <SummaryCards
                    items={[
                        { label: 'Rows', value: summary.total },
                        { label: 'Expired', value: summary.expired, tone: 'rose' },
                        { label: 'Expiring Soon', value: summary.expiring_soon, tone: 'amber' },
                        { label: 'Active', value: summary.active, tone: 'emerald' },
                        { label: 'No Active Lease', value: summary.no_active_lease, tone: 'sky' },
                    ]}
                />

                <FilterPanel
                    onApply={() => visitReport(path, form)}
                    onClear={() => visitReport(path, { lease_state: 'all', per_page: form.per_page })}
                >
                    <ReportSelect
                        label="Cemetery Site"
                        value={form.site_id}
                        options={filter_options.sites}
                        onChange={(site_id) => setForm({ ...form, site_id })}
                    />
                    <ReportSelect
                        label="Section"
                        value={form.section_id}
                        options={filter_options.sections}
                        onChange={(section_id) => setForm({ ...form, section_id })}
                    />
                    <ReportSelect
                        label="Block"
                        value={form.block_id}
                        options={filter_options.blocks}
                        onChange={(block_id) => setForm({ ...form, block_id })}
                    />
                    <ReportSelect
                        label="Lease State"
                        value={form.lease_state}
                        options={lease_state_options}
                        includeEmptyOption={false}
                        onChange={(lease_state) => setForm({ ...form, lease_state: (lease_state ?? 'all') as LeaseReportStateValue })}
                    />
                    <ReportInput
                        label="Lease End From"
                        type="date"
                        value={form.lease_end_from}
                        onChange={(lease_end_from) => setForm({ ...form, lease_end_from })}
                    />
                    <ReportInput
                        label="Lease End To"
                        type="date"
                        value={form.lease_end_to}
                        onChange={(lease_end_to) => setForm({ ...form, lease_end_to })}
                    />
                    <ReportInput
                        label="Expiring Within Days"
                        type="number"
                        value={form.expiring_within_days}
                        onChange={(value) => setForm({ ...form, expiring_within_days: Number(value || 90) })}
                    />
                </FilterPanel>

                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plot</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead>Leaseholder</TableHead>
                                <TableHead>Lease End</TableHead>
                                <TableHead>Days</TableHead>
                                <TableHead>OR / Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.data.map((row) => (
                                <TableRow key={`${row.plot_id}-${row.lease_state}`}>
                                    <TableCell className="font-medium">{row.plot_label}</TableCell>
                                    <TableCell className="text-sm text-slate-600">
                                        {[row.site_name, row.section_name, row.block_name].filter(Boolean).join(' / ')}
                                    </TableCell>
                                    <TableCell>{row.lease_state_label}</TableCell>
                                    <TableCell>{formatBlank(row.leaseholder_name)}</TableCell>
                                    <TableCell>{formatBlank(row.lease_end)}</TableCell>
                                    <TableCell>{row.days_label}</TableCell>
                                    <TableCell>
                                        {formatBlank(row.or_number)} {row.amount_paid ? ` / ${row.amount_paid}` : ''}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {rows.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-slate-500">
                                        No lease records match the current filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <ReportPagination rows={rows} />
            </div>
        </AppLayout>
    );
}
