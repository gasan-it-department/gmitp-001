import SetHouseholdMemberActiveController from '@/actions/App/External/Api/Controllers/ActionCenter/Household/SetHouseholdMemberActiveController';
import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/Core/Hooks/Shared/usePermissions';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import Utility from '@/pages/Utility/Utility';
import { Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, BadgeCheck, Link2, LogOut, MoreHorizontal, Pencil, RefreshCw, RotateCcw, Unlink, UserPlus } from 'lucide-react';
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
    const { can } = usePermissions();
    const canManageBeneficiaries = can('action_center.beneficiaries.manage');
    const canCorrectBeneficiaries = can('action_center.beneficiaries.correct');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [editing, setEditing] = useState<HouseholdMemberRow | undefined>(undefined);

    const [linkOpen, setLinkOpen] = useState(false);
    const [linking, setLinking] = useState<HouseholdMemberRow | undefined>(undefined);
    const [unlinkOpen, setUnlinkOpen] = useState(false);
    const [unlinking, setUnlinking] = useState<HouseholdMemberRow | undefined>(undefined);
    const [headDialogOpen, setHeadDialogOpen] = useState(false);

    const getLinkStatus = (member: HouseholdMemberRow) => {
        if (!member.beneficiary_id) {
            return { color: 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]', title: 'Not linked to a Beneficiary Profile' };
        }
        if (member.beneficiary_has_portal_account) {
            return { color: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]', title: 'Linked to a Beneficiary with a Portal Account' };
        }
        return { color: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]', title: 'Linked to a Walk-in Beneficiary (No Portal Account)' };
    };

    const openLink = (member: HouseholdMemberRow) => {
        setLinking(member);
        setLinkOpen(true);
    };

    const openUnlink = (member: HouseholdMemberRow) => {
        setUnlinking(member);
        setUnlinkOpen(true);
    };

    const hasPrimaryHouseholdElsewhere = (member: HouseholdMemberRow) =>
        member.beneficiary_id !== null && member.is_linked_to_primary_household === false;

    const primaryHouseholdTitle = (member: HouseholdMemberRow) =>
        member.linked_beneficiary_primary_household_code
            ? `Linked beneficiary's primary household is ${member.linked_beneficiary_primary_household_code}`
            : "Linked beneficiary's primary household is different from this household";

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

    const getLinkStatusLabel = (member: HouseholdMemberRow) => {
        if (!member.beneficiary_id) {
            return 'Not linked';
        }

        return member.beneficiary_has_portal_account ? 'Portal account' : 'Walk-in profile';
    };

    const renderMobileMemberMenu = (member: HouseholdMemberRow, movedOut = false) => {
        const canViewLinkedProfile = member.beneficiary_id !== null && member.beneficiary_id !== beneficiaryId;
        const hasAvailableAction = canViewLinkedProfile || canManageBeneficiaries || (canCorrectBeneficiaries && !isHead(member));

        if (!hasAvailableAction) {
            return null;
        }

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        aria-label={`Actions for ${member.first_name} ${member.last_name}`}
                    >
                        <MoreHorizontal className="h-5 w-5" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    {member.beneficiary_id &&
                        (member.beneficiary_id === beneficiaryId ? (
                            <DropdownMenuItem disabled>
                                <Link2 className="h-4 w-4" /> Current Profile
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem asChild>
                                <Link
                                    href={ShowBeneficiaryProfileController.url({
                                        municipality: currentMunicipality.slug,
                                        beneficiaryId: member.beneficiary_id,
                                    })}
                                    className="cursor-pointer"
                                >
                                    <Link2 className="h-4 w-4" /> View Linked Profile
                                </Link>
                            </DropdownMenuItem>
                        ))}

                    {movedOut
                        ? canManageBeneficiaries && (
                              <>
                                  <DropdownMenuItem onSelect={() => setTimeout(() => openEdit(member), 150)}>
                                      <Pencil className="h-4 w-4" /> Edit Member
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                      onSelect={() => setTimeout(() => setActive(member, true), 150)}
                                      className="text-emerald-600 focus:text-emerald-700"
                                  >
                                      <RotateCcw className="h-4 w-4" /> Move Back In
                                  </DropdownMenuItem>
                              </>
                          )
                        : !isHead(member) && (
                              <>
                                  {canCorrectBeneficiaries &&
                                      (member.beneficiary_id ? (
                                          <DropdownMenuItem
                                              onSelect={() => setTimeout(() => openUnlink(member), 150)}
                                              className="text-rose-600 focus:text-rose-700"
                                          >
                                              <Unlink className="h-4 w-4" /> Unlink Profile
                                          </DropdownMenuItem>
                                      ) : (
                                          <DropdownMenuItem onSelect={() => setTimeout(() => openLink(member), 150)}>
                                              <Link2 className="h-4 w-4" /> Link to Existing
                                          </DropdownMenuItem>
                                      ))}
                                  {canManageBeneficiaries && (
                                      <>
                                          <DropdownMenuItem onSelect={() => setTimeout(() => openEdit(member), 150)}>
                                              <Pencil className="h-4 w-4" /> Edit Member
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                              onSelect={() => setTimeout(() => setActive(member, false), 150)}
                                              className="text-amber-600 focus:text-amber-700"
                                          >
                                              <LogOut className="h-4 w-4" /> Remove from Household
                                          </DropdownMenuItem>
                                      </>
                                  )}
                              </>
                          )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                {canCorrectBeneficiaries && (headState.profile_is_current_head || headState.household_on_hold) && (
                    <button
                        type="button"
                        onClick={() => setHeadDialogOpen(true)}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        {headState.household_on_hold ? 'Assign household head' : 'Change household head'}
                    </button>
                )}
                {canManageBeneficiaries && (
                    <button
                        type="button"
                        onClick={openAdd}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                        <UserPlus className="h-3.5 w-3.5" /> Add member
                    </button>
                )}
            </div>

            {headState.household_on_hold && active.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <p>
                        This household has no active head. Assign a household head before using this household for verification or assistance
                        decisions.
                    </p>
                </div>
            )}

            <div className="space-y-3 md:hidden">
                {active.length === 0 && (
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500 italic">
                        Historical household: no active family members.
                    </div>
                )}

                {active.map((member) => (
                    <div key={member.id} className="rounded-md border border-slate-200 bg-white p-3">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`h-2 w-2 shrink-0 rounded-full ${getLinkStatus(member).color}`}
                                        title={getLinkStatus(member).title}
                                    />
                                    <p className="min-w-0 text-sm font-semibold break-words text-slate-900 capitalize">
                                        {member.first_name} {member.middle_name ? `${member.middle_name[0]}. ` : ''}
                                        {member.last_name} {member.suffix}
                                    </p>
                                    {isHead(member) && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                            <BadgeCheck className="h-3 w-3" /> Head
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-[11px] text-slate-500">{getLinkStatusLabel(member)}</p>
                            </div>
                            {renderMobileMemberMenu(member)}
                        </div>

                        {hasPrimaryHouseholdElsewhere(member) && (
                            <div className="mt-2 flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] text-amber-800">
                                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                <span>{primaryHouseholdTitle(member)}.</span>
                            </div>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-3">
                            <div>
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Relationship</p>
                                <p className="mt-0.5 text-xs text-slate-700">{member.relationship_label || member.relationship}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Age / Sex</p>
                                <p className="mt-0.5 text-xs text-slate-700">
                                    {member.age ?? '—'} yrs / {member.sex || '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Occupation</p>
                                <p className="mt-0.5 text-xs break-words text-slate-700 capitalize">{member.occupation?.toLowerCase() || 'none'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Monthly income</p>
                                <p className="mt-0.5 text-xs font-semibold text-slate-800">
                                    {member.monthly_income > 0 ? utils.formatCurrency(member.monthly_income) : '—'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Roster verification</span>
                            {isHead(member) ? (
                                <span className="text-[11px] text-slate-500">Identity gate applies</span>
                            ) : member.is_verified_dependent ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                    <BadgeCheck className="h-3 w-3" /> Verified
                                </span>
                            ) : (
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Pending</span>
                            )}
                        </div>
                    </div>
                ))}

                {inactive.length > 0 && (
                    <div className="space-y-2 pt-1">
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Moved out</p>
                        {inactive.map((member) => (
                            <div key={member.id} className="rounded-md border border-slate-200 bg-slate-50 p-3 opacity-75">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`h-2 w-2 shrink-0 rounded-full ${getLinkStatus(member).color}`} />
                                            <p className="text-sm font-semibold break-words text-slate-600 capitalize line-through">
                                                {member.first_name} {member.last_name} {member.suffix}
                                            </p>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500 capitalize">
                                            {member.relationship_label || member.relationship} · {member.age ?? '—'} yrs / {member.sex || '—'}
                                        </p>
                                    </div>
                                    {renderMobileMemberMenu(member, true)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
                    <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Est. total monthly income</span>
                    <span className="shrink-0 text-sm font-bold text-slate-800">{utils.formatCurrency(totalIncome)}</span>
                </div>
            </div>

            <div className="hidden overflow-hidden rounded-md border border-slate-100 md:block">
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
                                    Historical household: no active family members.
                                </TableCell>
                            </TableRow>
                        )}

                        {active.map((member) => (
                            <TableRow key={member.id} className="hover:bg-slate-50/50">
                                <TableCell>
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-900 capitalize">
                                        <div
                                            className={`h-2 w-2 shrink-0 rounded-full ${getLinkStatus(member).color}`}
                                            title={getLinkStatus(member).title}
                                            aria-label={getLinkStatus(member).title}
                                        />
                                        <span>
                                            {member.first_name} {member.middle_name ? `${member.middle_name[0]}. ` : ''} {member.last_name}{' '}
                                            {member.suffix}
                                        </span>
                                        {isHead(member) && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                                <BadgeCheck className="h-3 w-3" /> Head
                                            </span>
                                        )}
                                        {hasPrimaryHouseholdElsewhere(member) && (
                                            <span
                                                title={`${primaryHouseholdTitle(member)}. Use Change beneficiary residence only if this person actually moved.`}
                                                className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
                                            >
                                                <AlertTriangle className="h-3 w-3" />
                                                Primary elsewhere
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-slate-600">{member.relationship_label || member.relationship}</TableCell>
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
                                    <div className="flex items-center justify-end gap-1">
                                        {isHead(member) ? (
                                            <span className="mr-2 text-[10px] text-slate-400 italic">Edit from profile</span>
                                        ) : member.is_verified_dependent ? (
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
                                                {member.beneficiary_id &&
                                                    (member.beneficiary_id === beneficiaryId ? (
                                                        <DropdownMenuItem disabled className="flex items-center gap-2 opacity-50">
                                                            <Link2 className="h-4 w-4" /> Current Profile
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={ShowBeneficiaryProfileController.url({
                                                                    municipality: currentMunicipality.slug,
                                                                    beneficiaryId: member.beneficiary_id,
                                                                })}
                                                                className="flex cursor-pointer items-center gap-2"
                                                            >
                                                                <Link2 className="h-4 w-4" /> View Linked Profile
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    ))}

                                                {!isHead(member) && (
                                                    <>
                                                        {canCorrectBeneficiaries &&
                                                            (member.beneficiary_id ? (
                                                                <DropdownMenuItem
                                                                    onSelect={() => setTimeout(() => openUnlink(member), 150)}
                                                                    className="flex cursor-pointer items-center gap-2 text-rose-600 focus:text-rose-700"
                                                                >
                                                                    <Unlink className="h-4 w-4" /> Unlink Profile
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem
                                                                    onSelect={() => setTimeout(() => openLink(member), 150)}
                                                                    className="flex cursor-pointer items-center gap-2"
                                                                >
                                                                    <Link2 className="h-4 w-4" /> Link to Existing
                                                                </DropdownMenuItem>
                                                            ))}

                                                        {canManageBeneficiaries && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onSelect={() => setTimeout(() => openEdit(member), 150)}
                                                                    className="flex cursor-pointer items-center gap-2"
                                                                >
                                                                    <Pencil className="h-4 w-4" /> Edit Member
                                                                </DropdownMenuItem>

                                                                <DropdownMenuItem
                                                                    onSelect={() => setTimeout(() => setActive(member, false), 150)}
                                                                    className="flex cursor-pointer items-center gap-2 text-amber-600 focus:text-amber-700"
                                                                >
                                                                    <LogOut className="h-4 w-4" /> Remove from Household
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
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
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 capitalize line-through">
                                                <div
                                                    className={`h-2 w-2 shrink-0 rounded-full ${getLinkStatus(member).color}`}
                                                    title={getLinkStatus(member).title}
                                                    aria-label={getLinkStatus(member).title}
                                                />
                                                <span>
                                                    {member.first_name} {member.last_name} {member.suffix}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-500">{member.relationship_label || member.relationship}</TableCell>
                                        <TableCell className="text-xs text-slate-500">
                                            {member.age ?? '—'} yrs / {member.sex || '—'}
                                        </TableCell>
                                        <TableCell className="max-w-[120px] truncate text-xs text-slate-400 capitalize">
                                            {member.occupation?.toLowerCase() || 'none'}
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-slate-400">—</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
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
                                                        {member.beneficiary_id && (
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={ShowBeneficiaryProfileController.url({
                                                                        municipality: currentMunicipality.slug,
                                                                        beneficiaryId: member.beneficiary_id,
                                                                    })}
                                                                    className="flex cursor-pointer items-center gap-2"
                                                                >
                                                                    <Link2 className="h-4 w-4" /> View Linked Profile
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canManageBeneficiaries && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onSelect={() => setTimeout(() => openEdit(member), 150)}
                                                                    className="flex cursor-pointer items-center gap-2"
                                                                >
                                                                    <Pencil className="h-4 w-4" /> Edit Member
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onSelect={() => setTimeout(() => setActive(member, true), 150)}
                                                                    className="flex cursor-pointer items-center gap-2 text-emerald-600 focus:text-emerald-700"
                                                                >
                                                                    <RotateCcw className="h-4 w-4" /> Move Back In
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
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
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Est. Total Monthly Income</span>
                        <div className="hidden gap-4 text-[10px] text-slate-500 sm:flex">
                            <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" /> Portal Account
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]" /> Walk-in
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]" /> Not Linked
                            </div>
                            <div className="flex items-center gap-1.5">
                                <AlertTriangle className="h-3 w-3 text-amber-500" /> Primary Elsewhere
                            </div>
                        </div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{utils.formatCurrency(totalIncome)}</span>
                </div>
            </div>

            {canManageBeneficiaries && (
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
            )}

            {canCorrectBeneficiaries && linking && (
                <LinkMemberDialog
                    open={linkOpen}
                    onClose={() => setLinkOpen(false)}
                    memberId={linking.id}
                    memberName={`${linking.first_name} ${linking.last_name}`}
                />
            )}

            {canCorrectBeneficiaries && unlinking && (
                <UnlinkMemberDialog
                    open={unlinkOpen}
                    onClose={() => setUnlinkOpen(false)}
                    memberId={unlinking.id}
                    memberName={`${unlinking.first_name} ${unlinking.last_name}`}
                />
            )}

            {canCorrectBeneficiaries && (
                <ChangeHouseholdHeadDialog
                    open={headDialogOpen}
                    onClose={() => setHeadDialogOpen(false)}
                    householdId={householdId}
                    members={members}
                    headState={headState}
                    relationships={relationships}
                    headDispositions={headDispositions}
                />
            )}
        </div>
    );
}
