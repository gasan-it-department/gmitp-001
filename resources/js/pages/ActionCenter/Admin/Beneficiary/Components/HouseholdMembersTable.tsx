import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Utility from '@/pages/Utility/Utility';

export interface HouseholdMemberRow {
    id: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    relationship: string;
    birth_date: string | null;
    age: number | null;
    sex: string | null;
    civil_status: string | null;
    educational_attainment: string | null;
    occupation: string | null;
    monthly_income: number;
    religion_id: string | null;
    /** True for the server-managed head row (mirrors the beneficiary). */
    beneficiary_id: string | null;
    /** False = moved out (kept as history, dropped from active composition). */
    is_active: boolean;
}

interface Props {
    members: HouseholdMemberRow[];
    totalIncome: number;
}

/**
 * Read-only household composition table for the beneficiary profile.
 * Mirrors the Family Composition table on the assistance-request detail page.
 */
export default function HouseholdMembersTable({ members, totalIncome }: Props) {
    const utils = Utility();

    if (members.length === 0) {
        return <p className="py-4 text-center text-sm text-slate-400 italic">No family profiles declared.</p>;
    }

    return (
        <div className="overflow-hidden rounded-md border border-slate-100">
            <Table>
                <TableHeader className="bg-slate-50/70">
                    <TableRow>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">Relationship</TableHead>
                        <TableHead className="text-xs">Age/Sex</TableHead>
                        <TableHead className="text-xs">Occupation</TableHead>
                        <TableHead className="text-right text-xs">Income</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member) => (
                        <TableRow key={member.id} className="hover:bg-slate-50/50">
                            <TableCell className="text-xs font-medium text-slate-900 capitalize">
                                {member.first_name} {member.middle_name ? `${member.middle_name[0]}. ` : ''} {member.last_name} {member.suffix}
                            </TableCell>
                            <TableCell className="text-xs text-slate-600 capitalize">{member.relationship.toLowerCase()}</TableCell>
                            <TableCell className="text-xs text-slate-600">
                                {member.age ?? '—'} yrs / {member.sex || '—'}
                            </TableCell>
                            <TableCell className="max-w-[120px] truncate text-xs text-slate-500 capitalize">
                                {member.occupation?.toLowerCase() || 'none'}
                            </TableCell>
                            <TableCell className="text-right text-xs font-semibold text-slate-700">
                                {member.monthly_income > 0 ? utils.formatCurrency(member.monthly_income) : '—'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/40 px-4 py-2">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Est. Total Monthly Income</span>
                <span className="text-sm font-bold text-slate-700">{utils.formatCurrency(totalIncome)}</span>
            </div>
        </div>
    );
}
