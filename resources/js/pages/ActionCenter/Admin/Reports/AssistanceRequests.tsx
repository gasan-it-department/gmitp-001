import AssistanceRequestReportController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Report/AssistanceRequestReportController';
import ExportAssistanceRequestReportController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Report/ExportAssistanceRequestReportController';
import ShowAssistanceRequestProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ShowAssistanceRequestProfileController';
import { Pagination } from '@/components/Shared/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AssistanceRequestReportFilters, AssistanceRequestReportRow, ReportOption, ReportPaginator } from '@/Core/Types/ActionCenter/report';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Inbox } from 'lucide-react';
import { useState } from 'react';
import {
    ALL_OPTION,
    buildExportUrl,
    cleanFilters,
    FilterField,
    FilterSelect,
    FiltersPanel,
    formatCurrency,
    formatDate,
    ReportsHeader,
    ReportsTabs,
    SearchInput,
    StatusBadge,
    SummaryGrid,
} from './Components';

interface Props {
    rows: ReportPaginator<AssistanceRequestReportRow>;
    summary: {
        total: number;
        pending: number;
        under_review: number;
        released: number;
        released_amount: number;
    };
    filters: AssistanceRequestReportFilters;
    filterOptions: {
        assistanceTypes: ReportOption[];
        barangays: ReportOption[];
        statuses: ReportOption[];
    };
}

const SOURCE_OPTIONS: ReportOption[] = [
    { value: 'portal', label: 'Portal' },
    { value: 'walk_in', label: 'Admin / Walk-in' },
];

const DATE_BASIS_OPTIONS: ReportOption[] = [
    { value: 'submitted', label: 'Submitted date' },
    { value: 'released', label: 'Released date' },
];

export default function AssistanceRequests({ rows, summary, filters, filterOptions }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const pageUrl = AssistanceRequestReportController.url({ municipality: currentMunicipality.slug });
    const exportPath = ExportAssistanceRequestReportController.url({ municipality: currentMunicipality.slug });
    const [form, setForm] = useState({
        search: filters.search ?? '',
        status: filters.status ?? ALL_OPTION,
        assistance_type_id: filters.assistance_type_id ?? ALL_OPTION,
        barangay: filters.barangay ?? ALL_OPTION,
        source: filters.source ?? ALL_OPTION,
        date_basis: filters.date_basis ?? 'submitted',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
        per_page: filters.per_page ?? 15,
    });

    const applyFilters = () => {
        router.get(pageUrl, cleanFilters(form), { preserveScroll: true, preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setForm({
            search: '',
            status: ALL_OPTION,
            assistance_type_id: ALL_OPTION,
            barangay: ALL_OPTION,
            source: ALL_OPTION,
            date_basis: 'submitted',
            date_from: '',
            date_to: '',
            per_page: 15,
        });
        router.get(pageUrl, {}, { preserveScroll: true, replace: true });
    };

    const exportUrl = buildExportUrl(exportPath, form);
    const openCases = summary.pending + summary.under_review;

    return (
        <AppLayout>
            <Head title="Action Center Reports" />
            <main className="space-y-5 px-3 py-4 sm:px-4 md:px-5 lg:px-6 lg:py-6">
                <ReportsHeader exportUrl={exportUrl} />
                <ReportsTabs active="assistance" />

                <SummaryGrid
                    items={[
                        { label: 'Matching Requests', value: summary.total, detail: 'Current filtered result' },
                        {
                            label: 'Open Cases',
                            value: openCases,
                            detail: `${summary.pending} pending / ${summary.under_review} under review`,
                            accent: 'amber',
                        },
                        { label: 'Released', value: summary.released, detail: 'Completed disbursements', accent: 'blue' },
                        {
                            label: 'Released Value',
                            value: formatCurrency(summary.released_amount),
                            detail: 'Filtered released amount',
                            accent: 'emerald',
                        },
                    ]}
                />

                <FiltersPanel onSubmit={applyFilters} onReset={resetFilters}>
                    <FilterField label="Search">
                        <SearchInput value={form.search} onChange={(search) => setForm({ ...form, search })} placeholder="Transaction or person" />
                    </FilterField>
                    <FilterField label="Status">
                        <FilterSelect
                            value={form.status}
                            placeholder="All statuses"
                            options={filterOptions.statuses}
                            onChange={(status) => setForm({ ...form, status })}
                        />
                    </FilterField>
                    <FilterField label="Assistance Type">
                        <FilterSelect
                            value={form.assistance_type_id}
                            placeholder="All assistance types"
                            options={filterOptions.assistanceTypes}
                            onChange={(assistance_type_id) => setForm({ ...form, assistance_type_id })}
                        />
                    </FilterField>
                    <FilterField label="Barangay">
                        <FilterSelect
                            value={form.barangay}
                            placeholder="All barangays"
                            options={filterOptions.barangays}
                            onChange={(barangay) => setForm({ ...form, barangay })}
                        />
                    </FilterField>
                    <FilterField label="Filing Source">
                        <FilterSelect
                            value={form.source}
                            placeholder="All sources"
                            options={SOURCE_OPTIONS}
                            onChange={(source) => setForm({ ...form, source })}
                        />
                    </FilterField>
                    <FilterField label="Date Basis">
                        <FilterSelect
                            value={form.date_basis}
                            placeholder="Date basis"
                            options={DATE_BASIS_OPTIONS}
                            onChange={(date_basis) =>
                                setForm({
                                    ...form,
                                    date_basis: date_basis as AssistanceRequestReportFilters['date_basis'],
                                })
                            }
                            includeAll={false}
                        />
                    </FilterField>
                    <FilterField label="From">
                        <Input
                            className="h-10 bg-white"
                            type="date"
                            value={form.date_from}
                            onChange={(event) => setForm({ ...form, date_from: event.target.value })}
                        />
                    </FilterField>
                    <FilterField label="To">
                        <Input
                            className="h-10 bg-white"
                            type="date"
                            value={form.date_to}
                            onChange={(event) => setForm({ ...form, date_to: event.target.value })}
                        />
                    </FilterField>
                </FiltersPanel>

                {rows.data.length === 0 ? (
                    <EmptyState message="No assistance requests match the current filters." />
                ) : (
                    <>
                        <div className="grid gap-2 lg:grid-cols-2 xl:hidden">
                            {rows.data.map((row) => (
                                <RequestCard key={row.id} row={row} municipalitySlug={currentMunicipality.slug} />
                            ))}
                        </div>

                        <div className="hidden overflow-hidden rounded-md border border-slate-200 bg-white xl:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead>Transaction</TableHead>
                                        <TableHead>Person</TableHead>
                                        <TableHead>Assistance</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Timeline</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.data.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                <p className="font-mono text-xs font-semibold text-slate-900">{row.transaction_number}</p>
                                                <p className="mt-1 text-xs text-slate-500">{formatDate(row.submitted_date)}</p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium text-slate-900">{row.assisted_person}</p>
                                                {!row.filed_for_self && <p className="text-xs text-slate-500">Filed by {row.filer_name}</p>}
                                                <p className="text-xs text-slate-500">{row.beneficiary_number ?? 'No beneficiary number'}</p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm text-slate-800">{row.assistance_type ?? '-'}</p>
                                                <p className="text-xs text-slate-500">
                                                    {row.barangay ?? '-'} / {row.source_label}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={row.status} label={row.status_label} />
                                            </TableCell>
                                            <TableCell className="font-semibold tabular-nums">
                                                {row.amount_approved === null ? '-' : formatCurrency(row.amount_approved)}
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-600">
                                                <p>Reviewed: {formatDate(row.reviewed_date)}</p>
                                                <p>Released: {formatDate(row.released_date)}</p>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={requestHref(currentMunicipality.slug, row.id)}>
                                                    <Button variant="outline" size="sm" className="h-8">
                                                        View <ArrowRight className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <Pagination links={rows.meta.links} />
                    </>
                )}
            </main>
        </AppLayout>
    );
}

function RequestCard({ row, municipalitySlug }: { row: AssistanceRequestReportRow; municipalitySlug: string }) {
    return (
        <article className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-semibold text-slate-500">{row.transaction_number}</p>
                    <h2 className="mt-1 truncate font-semibold text-slate-950">{row.assisted_person}</h2>
                    {!row.filed_for_self && <p className="truncate text-xs text-slate-500">Filed by {row.filer_name}</p>}
                </div>
                <StatusBadge status={row.status} label={row.status_label} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs">
                <div>
                    <p className="text-slate-500">Assistance</p>
                    <p className="mt-0.5 font-medium text-slate-800">{row.assistance_type ?? '-'}</p>
                </div>
                <div>
                    <p className="text-slate-500">Approved</p>
                    <p className="mt-0.5 font-semibold text-slate-900 tabular-nums">
                        {row.amount_approved === null ? '-' : formatCurrency(row.amount_approved)}
                    </p>
                </div>
                <div>
                    <p className="text-slate-500">Barangay</p>
                    <p className="mt-0.5 text-slate-800">{row.barangay ?? '-'}</p>
                </div>
                <div>
                    <p className="text-slate-500">Submitted</p>
                    <p className="mt-0.5 text-slate-800">{formatDate(row.submitted_date)}</p>
                </div>
            </div>
            <Link href={requestHref(municipalitySlug, row.id)} className="mt-3 block">
                <Button variant="outline" className="h-9 w-full">
                    View request <ArrowRight className="h-4 w-4" />
                </Button>
            </Link>
        </article>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center rounded-md border border-dashed border-slate-300 px-6 py-12 text-center">
            <Inbox className="h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-700">{message}</p>
        </div>
    );
}

function requestHref(municipality: string, requestId: string): string {
    return ShowAssistanceRequestProfileController.url({ municipality, assistanceRequest: requestId });
}
