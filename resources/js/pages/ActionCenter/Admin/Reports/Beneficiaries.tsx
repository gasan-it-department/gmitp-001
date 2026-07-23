import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import BeneficiaryRegistryReportController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Report/BeneficiaryRegistryReportController';
import ExportBeneficiaryRegistryReportController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Report/ExportBeneficiaryRegistryReportController';
import { Pagination } from '@/components/Shared/Pagination';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BeneficiaryRegistryReportFilters, BeneficiaryRegistryReportRow, ReportOption, ReportPaginator } from '@/Core/Types/ActionCenter/report';
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
    rows: ReportPaginator<BeneficiaryRegistryReportRow>;
    summary: { total: number; verified: number; pending: number; portal: number; walk_in: number };
    filters: BeneficiaryRegistryReportFilters;
    filterOptions: { barangays: ReportOption[]; sexes: ReportOption[] };
}

const VERIFICATION_OPTIONS: ReportOption[] = [
    { value: 'verified', label: 'Verified' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' },
];

const SOURCE_OPTIONS: ReportOption[] = [
    { value: 'portal', label: 'Portal' },
    { value: 'walk_in', label: 'Walk-in' },
];

const LIFECYCLE_OPTIONS: ReportOption[] = [
    { value: 'current', label: 'Current registry' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'merged', label: 'Merged duplicates' },
    { value: 'all', label: 'All records' },
];

export default function Beneficiaries({ rows, summary, filters, filterOptions }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const pageUrl = BeneficiaryRegistryReportController.url({ municipality: currentMunicipality.slug });
    const exportPath = ExportBeneficiaryRegistryReportController.url({ municipality: currentMunicipality.slug });
    const [form, setForm] = useState({
        search: filters.search ?? '',
        barangay: filters.barangay ?? ALL_OPTION,
        sex: filters.sex ?? ALL_OPTION,
        verification: filters.verification ?? ALL_OPTION,
        source: filters.source ?? ALL_OPTION,
        lifecycle: filters.lifecycle ?? 'current',
        per_page: filters.per_page ?? 15,
    });

    const applyFilters = () => router.get(pageUrl, cleanFilters(form), { preserveScroll: true, preserveState: true, replace: true });
    const resetFilters = () => {
        setForm({
            search: '',
            barangay: ALL_OPTION,
            sex: ALL_OPTION,
            verification: ALL_OPTION,
            source: ALL_OPTION,
            lifecycle: 'current',
            per_page: 15,
        });
        router.get(pageUrl, {}, { preserveScroll: true, replace: true });
    };

    return (
        <AppLayout>
            <Head title="Beneficiary Registry Report" />
            <main className="space-y-5 px-3 py-4 sm:px-4 md:px-5 lg:px-6 lg:py-6">
                <ReportsHeader exportUrl={buildExportUrl(exportPath, form)} />
                <ReportsTabs active="beneficiaries" />

                <SummaryGrid
                    items={[
                        { label: 'Matching Records', value: summary.total, detail: 'Current filtered result' },
                        { label: 'Verified', value: summary.verified, detail: 'Identity-approved records', accent: 'emerald' },
                        { label: 'Pending Intake', value: summary.pending, detail: 'Awaiting admin verification', accent: 'amber' },
                        { label: 'Profile Source', value: `${summary.portal} / ${summary.walk_in}`, detail: 'Portal / walk-in', accent: 'blue' },
                    ]}
                />

                <FiltersPanel onSubmit={applyFilters} onReset={resetFilters}>
                    <FilterField label="Search">
                        <SearchInput
                            value={form.search}
                            onChange={(search) => setForm({ ...form, search })}
                            placeholder="Name or beneficiary number"
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
                    <FilterField label="Sex">
                        <FilterSelect
                            value={form.sex}
                            placeholder="All"
                            options={filterOptions.sexes}
                            onChange={(sex) => setForm({ ...form, sex })}
                        />
                    </FilterField>
                    <FilterField label="Intake Status">
                        <FilterSelect
                            value={form.verification}
                            placeholder="All statuses"
                            options={VERIFICATION_OPTIONS}
                            onChange={(verification) => setForm({ ...form, verification })}
                        />
                    </FilterField>
                    <FilterField label="Profile Source">
                        <FilterSelect
                            value={form.source}
                            placeholder="All sources"
                            options={SOURCE_OPTIONS}
                            onChange={(source) => setForm({ ...form, source })}
                        />
                    </FilterField>
                    <FilterField label="Lifecycle">
                        <FilterSelect
                            value={form.lifecycle}
                            placeholder="Lifecycle"
                            options={LIFECYCLE_OPTIONS}
                            onChange={(lifecycle) =>
                                setForm({
                                    ...form,
                                    lifecycle: lifecycle as BeneficiaryRegistryReportFilters['lifecycle'],
                                })
                            }
                            includeAll={false}
                        />
                    </FilterField>
                </FiltersPanel>

                {rows.data.length === 0 ? (
                    <EmptyState message="No beneficiaries match the current filters." />
                ) : (
                    <>
                        <div className="grid gap-2 lg:grid-cols-2 xl:hidden">
                            {rows.data.map((row) => (
                                <BeneficiaryCard key={row.id} row={row} municipalitySlug={currentMunicipality.slug} />
                            ))}
                        </div>

                        <div className="hidden overflow-hidden rounded-md border border-slate-200 bg-white xl:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead>Beneficiary</TableHead>
                                        <TableHead>Demographics</TableHead>
                                        <TableHead>Household</TableHead>
                                        <TableHead>Intake</TableHead>
                                        <TableHead>Assistance History</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.data.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                <p className="font-semibold text-slate-950">{row.full_name}</p>
                                                <p className="mt-1 font-mono text-xs text-slate-500">{row.beneficiary_number ?? '-'}</p>
                                                <p className="text-xs text-slate-500">{row.source_label}</p>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-700">
                                                <p>
                                                    {row.age ?? '-'} yrs / {row.sex_label ?? '-'}
                                                </p>
                                                <p className="text-xs text-slate-500">Born {formatDate(row.birth_date)}</p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm text-slate-800">{row.household_code ?? '-'}</p>
                                                <p className="text-xs text-slate-500">
                                                    {row.barangay ?? '-'} / {row.official_household_size} official members
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1.5">
                                                    <StatusBadge status={row.intake_status} label={row.intake_status_label} />
                                                    {row.lifecycle !== 'active' && <StatusBadge status={row.lifecycle} label={row.lifecycle_label} />}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {row.total_requests} requests / {row.released_requests} released
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {formatCurrency(row.total_released_amount)} total / Last {formatDate(row.last_request_date)}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={profileHref(currentMunicipality.slug, row.id)}>
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

function BeneficiaryCard({ row, municipalitySlug }: { row: BeneficiaryRegistryReportRow; municipalitySlug: string }) {
    return (
        <article className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="truncate font-semibold text-slate-950">{row.full_name}</h2>
                    <p className="mt-1 font-mono text-xs text-slate-500">{row.beneficiary_number ?? '-'}</p>
                </div>
                <StatusBadge status={row.intake_status} label={row.intake_status_label} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs">
                <div>
                    <p className="text-slate-500">Household</p>
                    <p className="mt-0.5 font-medium text-slate-800">{row.household_code ?? '-'}</p>
                </div>
                <div>
                    <p className="text-slate-500">Barangay</p>
                    <p className="mt-0.5 text-slate-800">{row.barangay ?? '-'}</p>
                </div>
                <div>
                    <p className="text-slate-500">Requests</p>
                    <p className="mt-0.5 text-slate-800">
                        {row.total_requests} total / {row.released_requests} released
                    </p>
                </div>
                <div>
                    <p className="text-slate-500">Total Released</p>
                    <p className="mt-0.5 font-semibold text-slate-900 tabular-nums">{formatCurrency(row.total_released_amount)}</p>
                </div>
            </div>
            <Link href={profileHref(municipalitySlug, row.id)} className="mt-3 block">
                <Button variant="outline" className="h-9 w-full">
                    View beneficiary <ArrowRight className="h-4 w-4" />
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

function profileHref(municipality: string, beneficiaryId: string): string {
    return ShowBeneficiaryProfileController.url({ municipality, beneficiaryId });
}
