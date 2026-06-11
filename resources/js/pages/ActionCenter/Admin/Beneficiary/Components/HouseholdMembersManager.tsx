import SetHouseholdMemberActiveController from '@/actions/App/External/Api/Controllers/ActionCenter/Household/SetHouseholdMemberActiveController';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import Utility from '@/pages/Utility/Utility';
import { router, usePage } from '@inertiajs/react';
import { BadgeCheck, Link2, LogOut, Pencil, RotateCcw, UserPlus } from 'lucide-react';
import { useState } from 'react';
import type { EnumOption, ReligionOption } from '../../../Client/Apply/Beneficiary/types';
import type { HouseholdMemberRow } from './HouseholdMembersTable';
import LinkMemberDialog from './LinkMemberDialog';
import MemberFormDialog, { type RelationshipOption } from './MemberFormDialog';

interface Props {
    members: HouseholdMemberRow[];
    totalIncome: number;
    beneficiaryId: string;
    religions: ReligionOption[];
    civilStatus: EnumOption[];
    educationalAttainment: EnumOption[];
    relationships: RelationshipOption[];
}

/**
 * Interactive household-roster manager for the admin beneficiary profile.
 *
 * Active members (head first) plus a "moved out" section for deactivated rows.
 * The head row mirrors the beneficiary and is read-only here (corrected via
 * "Edit profile"). Non-head rows can be edited, moved out, or restored — moves
 * never delete (is_active toggle).
 */
export default function HouseholdMembersManager({
    members,
    totalIncome,
    beneficiaryId,
    religions,
    civilStatus,
    educationalAttainment,
    relationships,
}: Props) {
    const utils = Utility();
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [editing, setEditing] = useState<HouseholdMemberRow | undefined>(undefined);

    const [linkOpen, setLinkOpen] = useState(false);
    const [linking, setLinking] = useState<HouseholdMemberRow | undefined>(undefined);

    const openLink = (member: HouseholdMemberRow) => {
        setLinking(member);
        setLinkOpen(true);
    };

    const active = members.filter((m) => m.is_active);
    const inactive = members.filter((m) => !m.is_active);

    const openAdd = () => {
        setEditing(undefined);
        setDialogMode('add');
        setDialogOpen(true);
    };

    const openEdit = (member: HouseholdMemberRow) => {
        setEditing(member);
        setDialogMode('edit');
        setDialogOpen(true);
    };

    const setActive = (member: HouseholdMemberRow, isActive: boolean) => {
        if (!isActive && !window.confirm(`Mark ${member.first_name} ${member.last_name} as moved out of this household?`)) {
            return;
        }
        router.post(
            SetHouseholdMemberActiveController.url({ memberId: member.id }),
            { is_active: isActive },
            { headers: { 'X-Municipality-Slug': currentMunicipality.slug }, preserveScroll: true },
        );
    };

    const isHead = (m: HouseholdMemberRow) => m.relationship === 'head';

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                >
                    <UserPlus className="h-3.5 w-3.5" /> Add member
                </button>
            </div>

            <div className="overflow-hidden rounded-md border border-slate-100">
                <Table>
                    <TableHeader className="bg-slate-50/70">
                        <TableRow>
                            <TableHead className="text-xs">Name</TableHead>
                            <TableHead className="text-xs">Relationship</TableHead>
                            <TableHead className="text-xs">Age/Sex</TableHead>
                            <TableHead className="text-xs">Occupation</TableHead>
                            <TableHead className="text-right text-xs">Income</TableHead>
                            <TableHead className="text-right text-xs">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {active.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-4 text-center text-sm text-slate-400 italic">
                                    No active family members.
                                </TableCell>
                            </TableRow>
                        )}

                        {active.map((member) => (
                            <TableRow key={member.id} className="hover:bg-slate-50/50">
                                <TableCell className="text-xs font-medium text-slate-900 capitalize">
                                    {member.first_name} {member.middle_name ? `${member.middle_name[0]}. ` : ''} {member.last_name} {member.suffix}
                                    {isHead(member) && (
                                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                                            <BadgeCheck className="h-3 w-3" /> Head
                                        </span>
                                    )}
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
                                <TableCell className="text-right">
                                    {isHead(member) ? (
                                        <span className="text-[10px] text-slate-400 italic">Edit from profile</span>
                                    ) : (
                                        <div className="flex items-center justify-end gap-1">
                                            {member.beneficiary_id ? (
                                                <span
                                                    title="Linked to an existing beneficiary record"
                                                    className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600"
                                                >
                                                    <Link2 className="h-3 w-3" /> Linked
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => openLink(member)}
                                                    title="Link to an existing record"
                                                    className="rounded p-1.5 text-indigo-500 transition hover:bg-indigo-50 hover:text-indigo-700"
                                                >
                                                    <Link2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            {member.is_verified_dependent ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                                    <BadgeCheck className="h-3 w-3" /> Verified
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                                    Pending
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => openEdit(member)}
                                                title="Edit member"
                                                className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActive(member, false)}
                                                title="Mark as moved out"
                                                className="rounded p-1.5 text-amber-500 transition hover:bg-amber-50 hover:text-amber-700"
                                            >
                                                <LogOut className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* Moved-out (inactive) members — kept as history, restorable */}
                        {inactive.length > 0 && (
                            <>
                                <TableRow className="bg-slate-50/40">
                                    <TableCell colSpan={6} className="py-1.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                        Moved out
                                    </TableCell>
                                </TableRow>
                                {inactive.map((member) => (
                                    <TableRow key={member.id} className="opacity-60 hover:bg-slate-50/50">
                                        <TableCell className="text-xs font-medium text-slate-600 capitalize line-through">
                                            {member.first_name} {member.last_name} {member.suffix}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-500 capitalize">{member.relationship.toLowerCase()}</TableCell>
                                        <TableCell className="text-xs text-slate-500">
                                            {member.age ?? '—'} yrs / {member.sex || '—'}
                                        </TableCell>
                                        <TableCell className="max-w-[120px] truncate text-xs text-slate-400 capitalize">
                                            {member.occupation?.toLowerCase() || 'none'}
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-slate-400">—</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(member)}
                                                    title="Edit member"
                                                    className="rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActive(member, true)}
                                                    title="Move back in"
                                                    className="rounded p-1.5 text-emerald-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </>
                        )}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/40 px-4 py-2">
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Est. Total Monthly Income</span>
                    <span className="text-sm font-bold text-slate-700">{utils.formatCurrency(totalIncome)}</span>
                </div>
            </div>

            <MemberFormDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                mode={dialogMode}
                beneficiaryId={beneficiaryId}
                member={editing}
                religions={religions}
                civilStatus={civilStatus}
                educationalAttainment={educationalAttainment}
                relationships={relationships}
            />

            {linking && (
                <LinkMemberDialog
                    open={linkOpen}
                    onClose={() => setLinkOpen(false)}
                    memberId={linking.id}
                    memberName={`${linking.first_name} ${linking.last_name}`}
                />
            )}
        </div>
    );
}
