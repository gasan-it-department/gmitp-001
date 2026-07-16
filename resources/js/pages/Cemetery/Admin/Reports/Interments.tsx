import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    CemeteryReportFilterOptions,
    IntermentEndTypeValue,
    IntermentLifecycleReportFilters,
    IntermentLifecycleReportRow,
    IntermentLifecycleStatusValue,
    SelectOption,
} from '@/Core/Types/Cemetery/cemetery';
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
    rows: PaginatedResponse<IntermentLifecycleReportRow>;
    summary: { total: number; active: number; moved: number; exhumed: number; transferred_out: number; voided: number };
    filters: IntermentLifecycleReportFilters;
    filter_options: CemeteryReportFilterOptions;
    lifecycle_status_options: SelectOption<IntermentLifecycleStatusValue>[];
    end_type_options: SelectOption<IntermentEndTypeValue>[];
}

export default function Interments({ municipality, rows, summary, filters, filter_options, lifecycle_status_options, end_type_options }: Props) {
    const [form, setForm] = useState<IntermentLifecycleReportFilters>(filters);
    const path = `/${municipality.slug}/cemetery/admin/reports/interments`;
    const exportPath = `${path}/export`;

    return (
        <AppLayout>
            <Head title="Interment Lifecycle Report" />
            <div className="m-6 space-y-6">
                <ReportHeader
                    title="Interment Lifecycle Report"
                    description="Review current and historical interment lifecycle events, including moves, exhumations, transfers out, and voided mistakes."
                    backHref={`/${municipality.slug}/cemetery/admin/reports`}
                    exportHref={exportUrl(exportPath, form)}
                />

                <SummaryCards
                    items={[
                        { label: 'Rows', value: summary.total },
                        { label: 'Active', value: summary.active, tone: 'emerald' },
                        { label: 'Moved', value: summary.moved, tone: 'sky' },
                        { label: 'Exhumed / Transferred', value: summary.exhumed + summary.transferred_out, tone: 'amber' },
                    ]}
                />

                <FilterPanel
                    onApply={() => visitReport(path, form)}
                    onClear={() => visitReport(path, { lifecycle_status: 'all', per_page: form.per_page })}
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
                        label="Lifecycle"
                        value={form.lifecycle_status}
                        options={lifecycle_status_options}
                        includeEmptyOption={false}
                        onChange={(lifecycle_status) =>
                            setForm({ ...form, lifecycle_status: (lifecycle_status ?? 'all') as IntermentLifecycleStatusValue })
                        }
                    />
                    <ReportSelect
                        label="End Type"
                        value={form.end_type}
                        options={end_type_options}
                        onChange={(end_type) => setForm({ ...form, end_type: end_type as IntermentEndTypeValue | null })}
                    />
                    <ReportInput
                        label="Interment Date From"
                        type="date"
                        value={form.date_from}
                        onChange={(date_from) => setForm({ ...form, date_from })}
                    />
                    <ReportInput label="Interment Date To" type="date" value={form.date_to} onChange={(date_to) => setForm({ ...form, date_to })} />
                </FilterPanel>

                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Decedent</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Interment Date</TableHead>
                                <TableHead>Lifecycle</TableHead>
                                <TableHead>Ended / Voided</TableHead>
                                <TableHead>Destination / Permit</TableHead>
                                <TableHead>Reason</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.data.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell className="font-medium">{row.decedent_name}</TableCell>
                                    <TableCell className="text-sm text-slate-600">
                                        {[row.site_name, row.section_name, row.block_name, row.plot_label].filter(Boolean).join(' / ')}
                                    </TableCell>
                                    <TableCell>{formatBlank(row.interment_date)}</TableCell>
                                    <TableCell>{row.lifecycle_label}</TableCell>
                                    <TableCell>{formatBlank(row.ended_or_voided_at)}</TableCell>
                                    <TableCell>
                                        {formatBlank(row.transfer_destination)}
                                        {row.permit_reference ? ` / ${row.permit_reference}` : ''}
                                    </TableCell>
                                    <TableCell>{formatBlank(row.reason)}</TableCell>
                                </TableRow>
                            ))}
                            {rows.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-slate-500">
                                        No interment lifecycle rows match the current filters.
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
