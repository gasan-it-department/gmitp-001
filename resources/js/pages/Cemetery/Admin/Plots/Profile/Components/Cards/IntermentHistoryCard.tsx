import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlotProfile as PlotProfileType } from '@/Core/Types/Cemetery/cemetery';
import { Link } from '@inertiajs/react';
import { History } from 'lucide-react';
import { EmptyState, formatDate } from '../Helpers';

export function IntermentHistoryCard({ plot }: { plot: PlotProfileType }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Interment History</h2>
                <p className="text-sm text-slate-500">Past interments that used this plot but no longer count as current occupancy.</p>
            </div>

            {plot.interment_history.length === 0 ? (
                <EmptyState icon={<History size={20} />} text="No past interments are recorded for this plot." />
            ) : (
                <div className="overflow-hidden rounded-lg border border-slate-200">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Decedent</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Interred</TableHead>
                                <TableHead>Ended / Voided</TableHead>
                                <TableHead>Moved To</TableHead>
                                <TableHead>Reason</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plot.interment_history.map((interment) => (
                                <TableRow key={interment.id}>
                                    <TableCell>
                                        <Link href={interment.decedent_profile_url} className="font-medium text-emerald-700 hover:underline">
                                            {interment.decedent_name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{interment.status_label}</TableCell>
                                    <TableCell>{formatDate(interment.interment_date)}</TableCell>
                                    <TableCell>{formatDate(interment.voided_at ?? interment.ended_at)}</TableCell>
                                    <TableCell>
                                        {interment.destination_plot_profile_url ? (
                                            <Link
                                                href={interment.destination_plot_profile_url}
                                                className="font-medium text-emerald-700 hover:underline"
                                            >
                                                {interment.destination_plot_label}
                                            </Link>
                                        ) : interment.transfer_destination ? (
                                            interment.transfer_destination
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div>{interment.void_reason ?? interment.end_reason ?? '-'}</div>
                                            {interment.permit_reference && (
                                                <div className="text-xs text-slate-500">Permit: {interment.permit_reference}</div>
                                            )}
                                            {interment.end_notes && <div className="text-xs text-slate-500">{interment.end_notes}</div>}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </section>
    );
}
