import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlotProfile as PlotProfileType } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { Link } from '@inertiajs/react';
import { ArrowRightLeft, MoreVertical, Users } from 'lucide-react';
import { useState } from 'react';
import { CloseIntermentDialog } from '../../../../Interments/Components/CloseIntermentDialog';
import { ReverseMoveDialog } from '../../../../Interments/Components/ReverseMoveDialog';
import { VoidIntermentDialog } from '../../../../Interments/Components/VoidIntermentDialog';
import { EmptyState, formatDate } from '../Helpers';

export function CurrentIntermentsCard({ plot, municipality }: { plot: PlotProfileType; municipality: MunicipalityType }) {
    const [activeDialog, setActiveDialog] = useState<{ type: 'close' | 'void' | 'reverse'; interment: any } | null>(null);

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
                                <TableHead className="w-[80px] text-right">Actions</TableHead>
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
                                            <Link
                                                href={interment.decedent_profile_url}
                                                className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                                            >
                                                {interment.decedent_name}
                                            </Link>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600">{formatDate(interment.interment_date)}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200/60 ring-inset">
                                            {interment.type_label}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {interment.notes ? (
                                            <span className="line-clamp-2 max-w-[12rem] text-xs" title={interment.notes}>
                                                {interment.notes}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right align-middle">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                                                    <MoreVertical size={16} />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem asChild>
                                                    <Link href={interment.move_url} className="cursor-pointer">
                                                        <ArrowRightLeft size={14} className="mr-2" />
                                                        Move
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onSelect={() => setTimeout(() => setActiveDialog({ type: 'close', interment }), 10)}
                                                    className="cursor-pointer text-amber-700 focus:bg-amber-50 focus:text-amber-800"
                                                >
                                                    <ArrowRightLeft size={14} className="mr-2" />
                                                    Exhume / Transfer
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onSelect={() => setTimeout(() => setActiveDialog({ type: 'void', interment }), 10)}
                                                    className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                                                >
                                                    <Users size={14} className="mr-2" />
                                                    Void Wrong Interment
                                                </DropdownMenuItem>
                                                {interment.can_reverse_move && (
                                                    <DropdownMenuItem
                                                        onSelect={() => setTimeout(() => setActiveDialog({ type: 'reverse', interment }), 10)}
                                                        className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                                                    >
                                                        <ArrowRightLeft size={14} className="mr-2" />
                                                        Reverse
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <CloseIntermentDialog
                closeUrl={activeDialog?.interment?.close_url ?? ''}
                municipalitySlug={municipality.slug}
                activeLease={plot.active_lease}
                label="Exhume / Transfer"
                open={activeDialog?.type === 'close'}
                onOpenChange={(open) => {
                    if (!open) setActiveDialog(null);
                }}
            />
            <VoidIntermentDialog
                voidUrl={activeDialog?.interment?.void_url ?? ''}
                municipalitySlug={municipality.slug}
                label="Void Wrong Interment"
                open={activeDialog?.type === 'void'}
                onOpenChange={(open) => {
                    if (!open) setActiveDialog(null);
                }}
            />
            <ReverseMoveDialog
                reverseUrl={activeDialog?.interment?.reverse_move_url ?? ''}
                municipalitySlug={municipality.slug}
                label="Reverse"
                open={activeDialog?.type === 'reverse'}
                onOpenChange={(open) => {
                    if (!open) setActiveDialog(null);
                }}
            />
        </section>
    );
}
