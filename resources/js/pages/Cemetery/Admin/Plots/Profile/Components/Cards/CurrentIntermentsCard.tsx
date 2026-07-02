import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlotProfile as PlotProfileType } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { Link } from '@inertiajs/react';
import { ArrowRightLeft, Users } from 'lucide-react';
import { ReverseMoveDialog } from '../../../../Interments/Components/ReverseMoveDialog';
import { EmptyState, formatDate } from '../Helpers';

export function CurrentIntermentsCard({ plot, municipality }: { plot: PlotProfileType; municipality: MunicipalityType }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Currently Interred</h2>
                    <p className="text-sm text-slate-500">Active interments attached to this physical plot.</p>
                </div>
                {plot.can_accept_more && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Can still accept {plot.available_capacity}
                    </span>
                )}
            </div>

            {plot.current_interments.length === 0 ? (
                <EmptyState icon={<Users size={20} />} text="No active interments are recorded in this plot." />
            ) : (
                <div className="overflow-hidden rounded-lg border border-slate-200">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead>Decedent</TableHead>
                                <TableHead>Interment Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plot.current_interments.map((interment) => (
                                <TableRow key={interment.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100/50 text-emerald-600">
                                                <Users size={14} />
                                            </div>
                                            <Link href={interment.decedent_profile_url} className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">
                                                {interment.decedent_name}
                                            </Link>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600">{formatDate(interment.interment_date)}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200/60">
                                            {interment.type_label}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {interment.notes ? (
                                            <span className="line-clamp-2 max-w-[12rem] text-xs" title={interment.notes}>{interment.notes}</span>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right align-middle">
                                        <div className="flex justify-end gap-1.5">
                                            <Button asChild size="sm" variant="outline" className="h-7 px-2.5 text-xs font-medium text-slate-600">
                                                <Link href={interment.move_url}>
                                                    <ArrowRightLeft size={12} className="mr-1.5" />
                                                    Move
                                                </Link>
                                            </Button>
                                            {interment.can_reverse_move && (
                                                <ReverseMoveDialog
                                                    reverseUrl={interment.reverse_move_url}
                                                    municipalitySlug={municipality.slug}
                                                    label="Reverse"
                                                    size="sm"
                                                    className="h-7 px-2.5 text-xs font-medium text-slate-600"
                                                />
                                            )}
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
