import SetHouseholdMemberActiveController from '@/actions/App/External/Api/Controllers/ActionCenter/Household/SetHouseholdMemberActiveController';
import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import Utility from '@/pages/Utility/Utility';
import { Link, router, usePage } from '@inertiajs/react';
import { BadgeCheck, Link2, LogOut, MoreHorizontal, Pencil, RefreshCw, RotateCcw, Unlink, UserPlus } from 'lucide-react';
import { useState } from 'react';
import type { EnumOption, ReligionOption } from '../../../../Client/Apply/Beneficiary/types';
import ChangeHouseholdHeadDialog, { type HouseholdHeadState } from './ChangeHouseholdHeadDialog';
import type { HouseholdMemberRow } from './HouseholdMembersTable';
import LinkMemberDialog from './LinkMemberDialog';
import MemberFormDialog, { type RelationshipOption } from './MemberFormDialog';
import UnlinkMemberDialog from './UnlinkMemberDialog';

interface Props {
    members: HouseholdMemberRow[];
    totalIncome: number;
    beneficiaryId: string;
    religions: ReligionOption[];
    civilStatus: EnumOption[];
    educationalAttainment: EnumOption[];
    relationships: RelationshipOption[];
    householdId: string;
    headState: HouseholdHeadState;
    headDispositions: EnumOption[];
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
    householdId,
    headState,
    headDispositions,
}: Props) {
    const utils = Utility();
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [editing, setEditing] = useState<HouseholdMemberRow | undefined>(undefined);

    const [linkOpen, setLinkOpen] = useState(false);
    const [linking, setLinking] = useState<HouseholdMemberRow | undefined>(undefined);
    const [unlinkOpen, setUnlinkOpen] = useState(false);
    const [unlinking, setUnlinking] = useState<HouseholdMemberRow | undefined>(undefined);
    const [headDialogOpen, setHeadDialogOpen] = useState(false);

    const openLink = (member: HouseholdMemberRow) => {
        setLinking(member);
        setLinkOpen(true);
    };

    const openUnlink = (member: HouseholdMemberRow) => {
        setUnlinking(member);
        setUnlinkOpen(true);
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
            <div className="flex flex-wrap justify-end gap-2">
                {(headState.profile_is_current_head || headState.household_on_hold) && (
                    <button
                        type="button"
                        onClick={() => setHeadDialogOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        {headState.household_on_hold ? 'Assign household head' : 'Change household head'}
                    </button>
                )}
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
                                            {member.beneficiary_id && (
                                                <Link
                                                    href={ShowBeneficiaryProfileController.url({
                                                        municipality: currentMunicipality.slug,
                                                        beneficiaryId: member.beneficiary_id,
                                                    })}
                                                    title="View linked beneficiary profile"
                                                    className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 transition hover:bg-indigo-100 hover:text-indigo-700"
                                                >
                                                    <Link2 className="h-3 w-3" /> View Profile
                                                </Link>
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

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    {member.beneficiary_id ? (
                                                        <DropdownMenuItem onSelect={() => setTimeout(() => openUnlink(member), 150)} className="flex cursor-pointer items-center gap-2 text-rose-600 focus:text-rose-700">
                                                            <Unlink className="h-4 w-4" /> Unlink Profile
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onSelect={() => setTimeout(() => openLink(member), 150)} className="flex cursor-pointer items-center gap-2">
                                                            <Link2 className="h-4 w-4" /> Link to Existing
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    <DropdownMenuItem onSelect={() => setTimeout(() => openEdit(member), 150)} className="flex cursor-pointer items-center gap-2">
                                                        <Pencil className="h-4 w-4" /> Edit Member
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem onSelect={() => setTimeout(() => setActive(member, false), 150)} className="flex cursor-pointer items-center gap-2 text-amber-600 focus:text-amber-700">
                                                        <LogOut className="h-4 w-4" /> Remove from Household
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
                                                {member.beneficiary_id && (
                                                    <Link
                                                        href={ShowBeneficiaryProfileController.url({
                                                            municipality: currentMunicipality.slug,
                                                            beneficiaryId: member.beneficiary_id,
                                                        })}
                                                        title="View linked beneficiary profile"
                                                        className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 transition hover:bg-indigo-100 hover:text-indigo-700"
                                                    >
                                                        <Link2 className="h-3 w-3" /> View Profile
                                                    </Link>
                                                )}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className="rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onSelect={() => setTimeout(() => openEdit(member), 150)} className="flex cursor-pointer items-center gap-2">
                                                            <Pencil className="h-4 w-4" /> Edit Member
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => setTimeout(() => setActive(member, true), 150)} className="flex cursor-pointer items-center gap-2 text-emerald-600 focus:text-emerald-700">
                                                            <RotateCcw className="h-4 w-4" /> Move Back In
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
                headDispositions={headDispositions}
            />

            {linking && (
                <LinkMemberDialog
                    open={linkOpen}
                    onClose={() => setLinkOpen(false)}
                    memberId={linking.id}
                    memberName={`${linking.first_name} ${linking.last_name}`}
                />
            )}

            {unlinking && (
                <UnlinkMemberDialog
                    open={unlinkOpen}
                    onClose={() => setUnlinkOpen(false)}
                    memberId={unlinking.id}
                    memberName={`${unlinking.first_name} ${unlinking.last_name}`}
                />
            )}

            <ChangeHouseholdHeadDialog
                open={headDialogOpen}
                onClose={() => setHeadDialogOpen(false)}
                householdId={householdId}
                members={members}
                headState={headState}
                relationships={relationships}
                headDispositions={headDispositions}
            />
        </div>
    );
}
