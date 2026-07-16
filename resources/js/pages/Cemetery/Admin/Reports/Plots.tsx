import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    CemeteryReportFilterOptions,
    PlotInventoryReportFilters,
    PlotInventoryReportRow,
    PlotInventoryReportScopeValue,
    PlotOccupancyModeValue,
    PlotStatusOption,
    PlotStatusValue,
    PlotTypeValue,
    SelectOption,
} from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { exportUrl, FilterPanel, formatBlank, ReportHeader, ReportPagination, ReportSelect, SummaryCards, visitReport } from './Components';

interface Props {
    municipality: MunicipalityType;
    rows: PaginatedResponse<PlotInventoryReportRow>;
    summary: { total: number; available: number; occupied: number; maintenance: number; containers: number };
    filters: PlotInventoryReportFilters;
    filter_options: CemeteryReportFilterOptions;
    type_options: SelectOption<PlotTypeValue>[];
    status_options: PlotStatusOption[];
    occupancy_mode_options: SelectOption<PlotOccupancyModeValue>[];
    scope_options: SelectOption<PlotInventoryReportScopeValue>[];
}

export default function Plots({
    municipality,
    rows,
    summary,
    filters,
    filter_options,
    type_options,
    status_options,
    occupancy_mode_options,
    scope_options,
}: Props) {
    const [form, setForm] = useState<PlotInventoryReportFilters>(filters);
    const path = `/${municipality.slug}/cemetery/admin/reports/plots`;
    const exportPath = `${path}/export`;

    return (
        <AppLayout>
            <Head title="Plot Inventory Report" />
            <div className="m-6 space-y-6">
                <ReportHeader
                    title="Plot Inventory Report"
                    description="Review plot type, status, capacity, active occupancy, and area by cemetery location."
                    backHref={`/${municipality.slug}/cemetery/admin/reports`}
                    exportHref={exportUrl(exportPath, form)}
                />

                <SummaryCards
                    items={[
                        { label: 'Rows', value: summary.total },
                        { label: 'Available', value: summary.available, tone: 'emerald' },
                        { label: 'Occupied', value: summary.occupied, tone: 'rose' },
                        { label: 'Maintenance', value: summary.maintenance, tone: 'slate' },
                    ]}
                />

                <FilterPanel
                    onApply={() => visitReport(path, form)}
                    onClear={() => visitReport(path, { scope: 'assignable', per_page: form.per_page })}
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
                        label="Plot Type"
                        value={form.type}
                        options={type_options}
                        onChange={(type) => setForm({ ...form, type: type as PlotTypeValue | null })}
                    />
                    <ReportSelect
                        label="Status"
                        value={form.status}
                        options={status_options}
                        onChange={(status) => setForm({ ...form, status: status as PlotStatusValue | null })}
                    />
                    <ReportSelect
                        label="Occupancy Mode"
                        value={form.occupancy_mode}
                        options={occupancy_mode_options}
                        onChange={(occupancy_mode) => setForm({ ...form, occupancy_mode: occupancy_mode as PlotOccupancyModeValue | null })}
                    />
                    <ReportSelect
                        label="Scope"
                        value={form.scope}
                        options={scope_options}
                        includeEmptyOption={false}
                        onChange={(scope) => setForm({ ...form, scope: (scope ?? 'assignable') as PlotInventoryReportScopeValue })}
                    />
                </FilterPanel>

                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plot</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Occupancy</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Remaining</TableHead>
                                <TableHead>Area</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.data.map((row) => (
                                <TableRow key={row.plot_id}>
                                    <TableCell className="font-medium">{row.plot_label}</TableCell>
                                    <TableCell className="text-sm text-slate-600">
                                        {[row.site_name, row.section_name, row.block_name].filter(Boolean).join(' / ')}
                                    </TableCell>
                                    <TableCell>{formatBlank(row.type_label)}</TableCell>
                                    <TableCell>{formatBlank(row.status_label)}</TableCell>
                                    <TableCell>{formatBlank(row.occupancy_mode_label)}</TableCell>
                                    <TableCell>
                                        {row.active_interments_count} / {row.capacity}
                                    </TableCell>
                                    <TableCell>{row.remaining_capacity}</TableCell>
                                    <TableCell>{row.area_sqm ? `${row.area_sqm} sqm` : '-'}</TableCell>
                                </TableRow>
                            ))}
                            {rows.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-10 text-center text-slate-500">
                                        No plot inventory records match the current filters.
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
