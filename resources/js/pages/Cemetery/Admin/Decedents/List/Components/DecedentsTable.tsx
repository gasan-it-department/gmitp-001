import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DecedentListItem, IntermentStatusValue } from '@/Core/Types/Cemetery/cemetery';
import cemetery from '@/routes/cemetery';
import { Link } from '@inertiajs/react';
import { Eye, MapPin } from 'lucide-react';

interface Props {
    decedents: DecedentListItem[];
    municipalitySlug: string;
}

const STATUS_PILL: Record<IntermentStatusValue, string> = {
    interred: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    exhumed: 'bg-slate-100 text-slate-700 ring-slate-200',
    transferred: 'bg-sky-50 text-sky-700 ring-sky-200',
    unassigned: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const STATUS_LABEL: Record<IntermentStatusValue, string> = {
    interred: 'Interred',
    pending: 'Pending',
    exhumed: 'Exhumed',
    transferred: 'Transferred',
    unassigned: 'Unassigned',
};

const DECEDENT_TYPE_LABEL: Record<string, string> = {
    standard: 'Standard',
    child: 'Child',
    fetal: 'Fetal',
    unknown: 'Unknown',
};

export const DecedentsTable = ({ decedents, municipalitySlug }: Props) => {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="max-h-[70vh] overflow-y-auto">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
                        <TableRow className="border-slate-200">
                            <TableHead className="w-14 pl-4 text-xs font-semibold tracking-wide text-slate-600 uppercase">#</TableHead>
                            <TableHead className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Full Name</TableHead>
                            <TableHead className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Type</TableHead>
                            <TableHead className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Death Cert. No.</TableHead>
                            <TableHead className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Date of Death</TableHead>
                            <TableHead className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Plot</TableHead>
                            <TableHead className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Status</TableHead>
                            <TableHead className="pr-4 text-right text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {decedents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-sm text-slate-500">
                                    No decedent records registered yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            decedents.map((decedent, index) => (
                                <TableRow key={decedent.id} className="border-slate-100 transition-colors hover:bg-slate-50">
                                    <TableCell className="pl-4 text-xs text-slate-500">{index + 1}</TableCell>
                                    <TableCell className="text-sm font-medium text-slate-900">{decedent.full_name}</TableCell>
                                    <TableCell className="text-xs text-slate-600">
                                        {decedent.decedent_type ? DECEDENT_TYPE_LABEL[decedent.decedent_type] : '—'}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-slate-600">{decedent.death_certificate_no}</TableCell>
                                    <TableCell className="text-xs text-slate-600">{decedent.date_of_death}</TableCell>
                                    <TableCell className="text-xs text-slate-600">{decedent.plot_label ?? '—'}</TableCell>
                                    <TableCell className="text-xs">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_PILL[decedent.interment_status]}`}
                                        >
                                            {STATUS_LABEL[decedent.interment_status]}
                                        </span>
                                    </TableCell>
                                    <TableCell className="pr-4 text-right">
                                        <div className="inline-flex gap-1">
                                            <Link href={cemetery.admin.decedents.profile.page.url([municipalitySlug, decedent.id])}>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50">
                                                    <Eye size={16} />
                                                </Button>
                                            </Link>
                                            {decedent.interment_status === 'unassigned' && (
                                                <Link href={cemetery.admin.interments.assign.page.url([municipalitySlug, decedent.id])}>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                                        title="Assign to plot"
                                                    >
                                                        <MapPin size={16} />
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
