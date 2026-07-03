import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DecedentDocumentTypeValue,
    DecedentIntermentStatusFilterValue,
    MissingDocumentsReportFilters,
    MissingDocumentsReportRow,
    RegistrationStatusValue,
    SelectOption,
    VitalRecordTypeValue,
} from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { exportUrl, FilterPanel, formatBlank, ReportHeader, ReportPagination, ReportSelect, SummaryCards, visitReport } from './Components';

interface Props {
    municipality: MunicipalityType;
    rows: PaginatedResponse<MissingDocumentsReportRow>;
    summary: { total: number; interred: number; unassigned: number; authorized: number };
    filters: MissingDocumentsReportFilters;
    registration_status_options: SelectOption<RegistrationStatusValue>[];
    vital_record_type_options: SelectOption<VitalRecordTypeValue>[];
    document_type_options: (SelectOption<DecedentDocumentTypeValue> & { restricted: boolean })[];
    interment_status_options: SelectOption<DecedentIntermentStatusFilterValue>[];
}

export default function MissingDocuments({
    municipality,
    rows,
    summary,
    filters,
    registration_status_options,
    vital_record_type_options,
    document_type_options,
    interment_status_options,
}: Props) {
    const [form, setForm] = useState<MissingDocumentsReportFilters>(filters);
    const path = `/${municipality.slug}/cemetery/admin/reports/missing-documents`;
    const exportPath = `${path}/export`;

    return (
        <AppLayout>
            <Head title="Missing Documents Report" />
            <div className="m-6 space-y-6">
                <ReportHeader
                    title="Missing Documents Report"
                    description="Follow up decedent records whose required cemetery documents are not yet attached."
                    backHref={`/${municipality.slug}/cemetery/admin/reports`}
                    exportHref={exportUrl(exportPath, form)}
                />

                <SummaryCards
                    items={[
                        { label: 'Rows', value: summary.total },
                        { label: 'Interred', value: summary.interred, tone: 'emerald' },
                        { label: 'Unassigned', value: summary.unassigned, tone: 'amber' },
                        { label: 'Authorized Pending', value: summary.authorized, tone: 'sky' },
                    ]}
                />

                <FilterPanel
                    onApply={() => visitReport(path, form)}
                    onClear={() => visitReport(path, { registration_status: 'verified', per_page: form.per_page })}
                >
                    <ReportSelect
                        label="Registration Status"
                        value={form.registration_status}
                        options={registration_status_options}
                        onChange={(registration_status) =>
                            setForm({ ...form, registration_status: registration_status as RegistrationStatusValue | null })
                        }
                    />
                    <ReportSelect
                        label="Vital Record Type"
                        value={form.vital_record_type}
                        options={vital_record_type_options}
                        onChange={(vital_record_type) => setForm({ ...form, vital_record_type: vital_record_type as VitalRecordTypeValue | null })}
                    />
                    <ReportSelect
                        label="Missing Document"
                        value={form.missing_document_type}
                        options={document_type_options}
                        onChange={(missing_document_type) =>
                            setForm({ ...form, missing_document_type: missing_document_type as DecedentDocumentTypeValue | null })
                        }
                    />
                    <ReportSelect
                        label="Interment Status"
                        value={form.interment_status}
                        options={interment_status_options}
                        onChange={(interment_status) =>
                            setForm({ ...form, interment_status: interment_status as DecedentIntermentStatusFilterValue | null })
                        }
                    />
                </FilterPanel>

                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Decedent</TableHead>
                                <TableHead>Registry No.</TableHead>
                                <TableHead>Vital Type</TableHead>
                                <TableHead>Interment</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Missing Documents</TableHead>
                                <TableHead>Pending Authorization</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.data.map((row) => (
                                <TableRow key={row.decedent_id}>
                                    <TableCell className="font-medium">{row.decedent_name}</TableCell>
                                    <TableCell>{formatBlank(row.registry_number)}</TableCell>
                                    <TableCell>{formatBlank(row.vital_record_type_label)}</TableCell>
                                    <TableCell>{row.interment_status_label}</TableCell>
                                    <TableCell>{formatBlank(row.location_label)}</TableCell>
                                    <TableCell>{row.missing_documents_label}</TableCell>
                                    <TableCell>
                                        {row.pending_document_reason
                                            ? `${row.pending_document_reason} / ${row.pending_document_reference ?? '-'}`
                                            : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {rows.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-slate-500">
                                        No missing-document records match the current filters.
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
