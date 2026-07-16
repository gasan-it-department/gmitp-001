import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IntermentListItem } from '@/Core/Types/Cemetery/cemetery';
import cemetery from '@/routes/cemetery';
import { Link } from '@inertiajs/react';
import { CalendarDays, MapPin, Plus } from 'lucide-react';

interface Props {
    interments: IntermentListItem[];
    municipalitySlug: string;
    siteId: string;
    siteActive: boolean;
}

export function IntermentsTable({ interments, municipalitySlug, siteId, siteActive }: Props) {
    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-700">
                        <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-900">Active Interments</h2>
                        <p className="text-sm text-slate-500">Current occupied decedent-to-plot records for this cemetery site.</p>
                    </div>
                </div>
                {siteActive && (
                    <Button asChild className="bg-indigo-700 hover:bg-indigo-800">
                        <Link href={`/${municipalitySlug}/cemetery/admin/sites/${siteId}/interments/create`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Interment
                        </Link>
                    </Button>
                )}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Decedent</TableHead>
                            <TableHead>Plot</TableHead>
                            <TableHead>Section / Block</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Notes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {interments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-sm text-slate-500">
                                    No active interments are recorded for this Site yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            interments.map((interment) => (
                                <TableRow key={interment.id} className="hover:bg-slate-50">
                                    <TableCell>
                                        <Link
                                            href={cemetery.admin.decedents.profile.page.url([municipalitySlug, interment.decedent_id])}
                                            className="font-medium text-slate-900 hover:text-indigo-700"
                                        >
                                            {interment.decedent_name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-sm">{interment.plot_label ?? '-'}</span>
                                        {interment.plot_type_label && <p className="text-xs text-slate-500">{interment.plot_type_label}</p>}
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">
                                        {interment.section_name ?? '-'} / {interment.block_name ?? '-'}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center gap-1 text-sm text-slate-700">
                                            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                            {interment.interment_date_label ?? '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200">
                                            {interment.type_label}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate text-sm text-slate-500">{interment.notes ?? '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </section>
    );
}
