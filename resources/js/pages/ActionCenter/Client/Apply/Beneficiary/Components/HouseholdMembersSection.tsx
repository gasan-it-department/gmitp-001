import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Info, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import type { EnumOption, HouseholdMemberDraft, ReligionOption, SectionProps } from '../types';
import { HouseholdMemberForm } from './HouseholdMemberForm';

/**
 * Section 4 of the profile setup wizard — the citizen's household roster.
 *
 * Skippable (citizen can check "I don't want to list family members and
 * have MSWD admin collect during interview"), but encouraged. When skipped,
 * the array is empty and the admin will populate during the interview
 * verification phase.
 *
 * The list is rendered as compact rows above an "Add member" button that
 * toggles an inline mini-form (HouseholdMemberForm). When the citizen
 * saves the form, the draft is pushed onto data.household_members and
 * the inline form is removed.
 *
 * Hard cap (20 active members) is enforced server-side in
 * StoreHouseholdMemberAction; the section surfaces soft warnings at 8
 * and 13 to nudge the citizen toward accurate self-reporting without
 * blocking legitimate large extended families.
 */

const SOFT_WARNING_THRESHOLD = 8;
const STRONG_WARNING_THRESHOLD = 13;
const HARD_CAP = 20;

interface Props extends SectionProps {
    relationships: EnumOption[];
    civilStatus: EnumOption[];
    educationalAttainment: EnumOption[];
    religions: ReligionOption[];
}

export function HouseholdMembersSection({ data, setData, relationships, civilStatus, educationalAttainment, religions }: Props) {
    // Local UI state: whether the "Add" form is currently expanded.
    const [showForm, setShowForm] = useState(false);

    // "Skip" is a derived state: citizen ticked the checkbox AND the array is empty.
    // We don't persist a separate "skipped" flag; an empty array IS the skip signal.
    const [explicitlySkipped, setExplicitlySkipped] = useState(false);

    const members = data.household_members;
    const isAtCap = members.length >= HARD_CAP;

    const addMember = (member: HouseholdMemberDraft) => {
        setData('household_members', [...members, member]);
        setShowForm(false);
        // Adding a member implicitly cancels any "skip" state.
        setExplicitlySkipped(false);
    };

    const removeMember = (index: number) => {
        setData(
            'household_members',
            members.filter((_, i) => i !== index),
        );
    };

    const toggleSkip = (checked: boolean) => {
        setExplicitlySkipped(checked);
        if (checked) {
            // Clear any partial drafts and close the form.
            setData('household_members', []);
            setShowForm(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* "You are counted automatically" banner — clarifies that the
                citizen does NOT need to list themselves; the system writes
                their head-of-household row from their profile data. */}
            <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <p className="text-xs leading-relaxed text-blue-800">
                    <strong>You are automatically counted as the head of your household.</strong> Use the section below to
                    list the OTHER family members who live with you — spouse, children, parents, siblings, etc.
                </p>
            </div>

            {/* Skip-section opt-out */}
            <Label
                htmlFor="skip_household_members"
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-slate-200"
            >
                <Checkbox
                    id="skip_household_members"
                    checked={explicitlySkipped}
                    onCheckedChange={(value) => toggleSkip(Boolean(value))}
                    disabled={members.length > 0}
                    className="mt-0.5"
                />
                <span className="text-xs leading-relaxed text-slate-600">
                    <strong>I'd rather not list my family members right now.</strong> The MSWD admin will collect this
                    during the interview when I apply for assistance.
                </span>
            </Label>

            {!explicitlySkipped && (
                <>
                    {/* Current member list */}
                    {members.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-6 text-center text-sm text-slate-500">
                            No household members added yet. Use "Add a household member" below to begin.
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {members.map((m, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-900 capitalize">
                                            {[m.first_name, m.middle_name, m.last_name, m.suffix].filter(Boolean).join(' ').toLowerCase()}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500 capitalize">
                                            {m.relationship} · {m.occupation || 'No occupation'} · ₱{m.monthly_income || '0'}/mo
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeMember(idx)}
                                        className="h-8 w-8 shrink-0 p-0 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                                        aria-label="Remove member"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Soft warnings */}
                    {members.length >= STRONG_WARNING_THRESHOLD && members.length < HARD_CAP && (
                        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                            <p className="text-xs leading-relaxed text-amber-800">
                                You've added {members.length} members. This is an unusually large household — the MSWD admin
                                will pay extra attention to verifying this during review.
                            </p>
                        </div>
                    )}
                    {members.length >= SOFT_WARNING_THRESHOLD && members.length < STRONG_WARNING_THRESHOLD && (
                        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                            <p className="text-xs leading-relaxed text-slate-600">
                                You've added {members.length} household members. Most households have 4–7. Please make sure
                                each person actually lives at this address.
                            </p>
                        </div>
                    )}

                    {/* Add form OR add button */}
                    {showForm ? (
                        <HouseholdMemberForm
                            relationships={relationships}
                            civilStatus={civilStatus}
                            educationalAttainment={educationalAttainment}
                            religions={religions}
                            onSave={addMember}
                            onCancel={() => setShowForm(false)}
                        />
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowForm(true)}
                            disabled={isAtCap}
                            className="w-full border-2 border-dashed border-[#005088]/30 bg-white py-6 text-sm font-semibold text-[#005088] hover:bg-blue-50"
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            {isAtCap ? `Maximum of ${HARD_CAP} household members reached` : 'Add a household member'}
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}
