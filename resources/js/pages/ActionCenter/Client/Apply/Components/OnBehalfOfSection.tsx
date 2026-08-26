import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HouseholdMemberOption, RelationshipOption } from '@/Core/Types/ActionCenter/assistance';
import api from '@/lib/axios';
import axios from 'axios';
import { AlertTriangle, Info, Plus, UserPlus, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

/**
 * The string value sent in the request body. Empty string represents "not yet
 * selected." Concrete values come from the backend Relationship enum (driven
 * via `Relationship::toOptions()`), so the union stays loose intentionally —
 * the backend is the source of truth for the allowed set.
 */
export type RelationshipType = string;

export interface OnBehalfOfData {
    /** FK to ac_household_members; '' means no member is selected yet. */
    household_member_id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    date_of_death: string; // only used when isBurial = true
    relationship: RelationshipType;
}

interface Props {
    data: OnBehalfOfData;
    onChange: <K extends keyof OnBehalfOfData>(field: K, value: OnBehalfOfData[K]) => void;
    /** Options to render in the selector. Comes from
     *  `Relationship::toOptions()` on the backend so this UI never duplicates
     *  the enum copy. The `requires_legal_age` flag drives the "Must be 18+"
     *  pill rendered under the option. */
    relationships: RelationshipOption[];
    /** True when the assistance type is burial — reveals the Date of Death field
     *  and adjusts copy to say "Deceased" instead of "Family Member". */
    isBurial: boolean;
    /** Used to enforce the "legal age" rule for child/sibling relationships. */
    applicantBirthDate: string | null;
    /** Existing household roster the filer can pick from. */
    householdMembers: HouseholdMemberOption[];
    /** API endpoint that creates a new ac_household_members row inline. */
    storeHouseholdMemberUrl: string;
    /** Required by the tenant context middleware for routes without a municipality path segment. */
    municipalitySlug: string;
    /** Notified after a new member is persisted so the parent can append it
     *  to the roster and auto-select it. */
    onMemberCreated: (member: HouseholdMemberOption) => void;
    audience?: 'citizen' | 'admin';
    errors?: Record<string, string | undefined>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calculateAge(birthDate: string | null): number {
    if (!birthDate) return 999; // unknown = no block
    return Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function formatMemberName(member: HouseholdMemberOption): string {
    const parts = [member.first_name, member.middle_name, member.last_name, member.suffix].filter(Boolean);
    return parts.join(' ');
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Collects information about the person the applicant is assisting.
 *
 * The citizen either picks an existing household member from a dropdown or
 * adds a new one inline (e.g. a parent who lives elsewhere, or a deceased
 * relative not yet on the roster). Names and relationship are sourced from
 * the picked member; the citizen never retypes them. Date of death stays
 * user-editable for burial.
 *
 * Enforces the EO's legal-age rule: Son/Daughter and Brother/Sister must be
 * 18+ to file on behalf of another person.
 */
export function OnBehalfOfSection({
    data,
    onChange,
    relationships,
    isBurial,
    applicantBirthDate,
    householdMembers,
    storeHouseholdMemberUrl,
    municipalitySlug,
    onMemberCreated,
    audience = 'citizen',
    errors = {},
}: Props) {
    const age = calculateAge(applicantBirthDate);
    const selectedOption = relationships.find((r) => r.value === data.relationship);
    const requiresLegalAge = selectedOption?.requires_legal_age ?? false;
    const isUnderAge = requiresLegalAge && age < 18;

    const today = new Date().toISOString().split('T')[0];

    const heading = isBurial ? "Deceased Person's Information" : 'Person Being Assisted';
    const subheading = isBurial
        ? 'Burial assistance is filed by an authorized family representative, not the deceased.'
        : audience === 'admin'
          ? 'Record the household member receiving assistance and keep the selected beneficiary as the filer.'
          : 'You are filing this request on behalf of a family member who needs assistance.';

    const selectedMember = useMemo(
        () => householdMembers.find((m) => m.id === data.household_member_id) ?? null,
        [householdMembers, data.household_member_id],
    );

    const [isAdding, setIsAdding] = useState(false);

    const handlePickMember = (memberId: string) => {
        const member = householdMembers.find((m) => m.id === memberId);
        if (!member) return;

        onChange('household_member_id', member.id);
        onChange('first_name', member.first_name);
        onChange('middle_name', member.middle_name ?? '');
        onChange('last_name', member.last_name);
        onChange('suffix', member.suffix ?? '');
        if (member.relationship) {
            onChange('relationship', member.relationship);
        }
    };

    const handleClearSelection = () => {
        onChange('household_member_id', '');
        onChange('first_name', '');
        onChange('middle_name', '');
        onChange('last_name', '');
        onChange('suffix', '');
        onChange('relationship', '');
    };

    return (
        <div className={`space-y-6 rounded-2xl border bg-white p-6 shadow-sm ${isBurial ? 'border-rose-100' : 'border-blue-100'}`}>
            {/* ── Header ── */}
            <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isBurial ? 'bg-rose-50' : 'bg-blue-50'}`}>
                    <Users className={`h-5 w-5 ${isBurial ? 'text-rose-600' : 'text-blue-600'}`} />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-900">{heading}</h3>
                    <p className="text-xs text-slate-500">{subheading}</p>
                </div>
            </div>

            {/* ── Notice ── */}
            {isBurial ? (
                <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <p className="text-xs leading-relaxed text-blue-800">
                        Select the deceased household member and provide the relationship recorded in the household roster. The filing representative
                        must be an eligible family relative; adult-child and adult-sibling filing requirements still apply where applicable.
                    </p>
                </div>
            ) : (
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                    <p className="text-xs leading-relaxed text-slate-700">
                        {audience === 'admin' ? (
                            <>
                                The selected beneficiary remains the <strong>filing representative</strong>. The household member selected below is
                                recorded as the person receiving assistance.
                            </>
                        ) : (
                            <>
                                As an <strong>authorized representative</strong>, you may file on behalf of any recognized family relative in your
                                household. Your own verified identity will be recorded as the filing party.
                            </>
                        )}
                    </p>
                </div>
            )}

            {/* ── Selected member card OR picker ── */}
            {selectedMember ? (
                <SelectedMemberCard member={selectedMember} relationships={relationships} onClear={handleClearSelection} />
            ) : (
                <FamilyMemberPicker
                    members={householdMembers}
                    isBurial={isBurial}
                    onPick={handlePickMember}
                    onStartAdding={() => setIsAdding(true)}
                    error={errors['on_behalf_household_member_id'] ?? errors['on_behalf_first_name']}
                />
            )}

            {/* ── Inline "Add new family member" form ── */}
            {isAdding && (
                <InlineAddMemberForm
                    relationships={relationships}
                    storeHouseholdMemberUrl={storeHouseholdMemberUrl}
                    municipalitySlug={municipalitySlug}
                    onCancel={() => setIsAdding(false)}
                    onCreated={(member) => {
                        onMemberCreated(member);
                        setIsAdding(false);
                    }}
                />
            )}

            {/* ── Date of Death (burial only) ── */}
            {isBurial && (
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                        Date of Death <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        type="date"
                        value={data.date_of_death}
                        onChange={(e) => onChange('date_of_death', e.target.value)}
                        max={today}
                        className="rounded-xl border-slate-200 text-sm focus-visible:ring-[#005088]/30"
                    />
                    {errors['on_behalf_date_of_death'] && <p className="text-xs text-rose-500">{errors['on_behalf_date_of_death']}</p>}
                </div>
            )}

            {/* ── Under-age warning ── */}
            {isUnderAge && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <p className="text-xs leading-relaxed text-red-800">
                        Based on your profile, you appear to be <strong>under 18 years old</strong>. The Executive Order requires that a son/daughter
                        or brother/sister must be of <strong>legal age (18+)</strong> to file on behalf of another person. Please ask a qualified
                        family member (spouse or parent) to file instead.
                    </p>
                </div>
            )}
        </div>
    );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SelectedMemberCard({
    member,
    relationships,
    onClear,
}: {
    member: HouseholdMemberOption;
    relationships: RelationshipOption[];
    onClear: () => void;
}) {
    const relationshipLabel = relationships.find((r) => r.value === member.relationship)?.label ?? null;

    return (
        <div className="flex items-start gap-3 rounded-xl border border-[#005088]/30 bg-[#005088]/5 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#005088]/10 text-[#005088]">
                <UserPlus className="h-5 w-5" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{formatMemberName(member)}</p>
                {relationshipLabel ? (
                    <p className="text-xs text-slate-600">{relationshipLabel}</p>
                ) : (
                    <p className="text-xs text-amber-600">Relationship not yet set — please add this person again with the relationship filled in.</p>
                )}
                {!member.is_verified_dependent && member.relationship !== 'head' && (
                    <p className="mt-1 text-xs font-medium text-amber-700">Pending MSWD household verification</p>
                )}
            </div>
            <button
                type="button"
                onClick={onClear}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                aria-label="Change selection"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

function FamilyMemberPicker({
    members,
    isBurial,
    onPick,
    onStartAdding,
    error,
}: {
    members: HouseholdMemberOption[];
    isBurial: boolean;
    onPick: (memberId: string) => void;
    onStartAdding: () => void;
    error?: string;
}) {
    return (
        <div className="space-y-3">
            <Label className="text-xs font-semibold text-slate-700">
                {isBurial ? 'Pick the deceased' : 'Pick a family member'} <span className="text-rose-500">*</span>
            </Label>

            {members.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {members.map((member) => (
                        <button
                            key={member.id}
                            type="button"
                            onClick={() => onPick(member.id)}
                            className="flex flex-col items-start gap-0.5 rounded-xl border-2 border-slate-200 px-4 py-3 text-left transition-all hover:border-[#005088]/40 hover:bg-slate-50"
                        >
                            <span className="text-sm font-semibold text-slate-800">{formatMemberName(member)}</span>
                            {member.relationship && (
                                <span className="text-[11px] font-normal text-slate-500">{member.relationship_label || member.relationship}</span>
                            )}
                        </button>
                    ))}
                </div>
            ) : (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
                    Your household roster is empty. Add a family member below to continue.
                </p>
            )}

            <button
                type="button"
                onClick={onStartAdding}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-all hover:border-[#005088] hover:text-[#005088]"
            >
                <Plus className="h-4 w-4" />
                Add a new family member
            </button>

            {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
    );
}

function InlineAddMemberForm({
    relationships,
    storeHouseholdMemberUrl,
    municipalitySlug,
    onCancel,
    onCreated,
}: {
    relationships: RelationshipOption[];
    storeHouseholdMemberUrl: string;
    municipalitySlug: string;
    onCancel: () => void;
    onCreated: (member: HouseholdMemberOption) => void;
}) {
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [suffix, setSuffix] = useState('');
    const [relationship, setRelationship] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [sex, setSex] = useState<'' | 'male' | 'female'>('');
    const [saving, setSaving] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const today = new Date().toISOString().split('T')[0];

    const canSave = firstName.trim().length > 0 && lastName.trim().length > 0 && relationship !== '' && !saving;

    const handleSave = async () => {
        setServerError(null);
        setSaving(true);
        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
            const response = await api.post(
                storeHouseholdMemberUrl,
                {
                    first_name: firstName,
                    middle_name: middleName || null,
                    last_name: lastName,
                    suffix: suffix || null,
                    relationship,
                    birth_date: birthDate || null,
                    sex: sex || null,
                },
                {
                    headers: {
                        'X-Municipality-Slug': municipalitySlug,
                        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                    },
                },
            );
            onCreated(response.data.data as HouseholdMemberOption);
        } catch (err) {
            // The shared axios interceptor already raises a toast; we surface
            // the validation message inline too so the user sees it next to
            // the inputs.
            setServerError(getHouseholdMemberError(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4 rounded-xl border-2 border-dashed border-[#005088]/40 bg-blue-50/40 p-5">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800">New family member</h4>
                <button type="button" onClick={onCancel} className="text-xs font-medium text-slate-500 hover:text-slate-800">
                    Cancel
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                        First Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Jose"
                        className="rounded-xl border-slate-200 text-sm focus-visible:ring-[#005088]/30"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Middle Name</Label>
                    <Input
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        placeholder="e.g. Santos"
                        className="rounded-xl border-slate-200 text-sm focus-visible:ring-[#005088]/30"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                        Last Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Dela Cruz"
                        className="rounded-xl border-slate-200 text-sm focus-visible:ring-[#005088]/30"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Suffix</Label>
                    <Input
                        value={suffix}
                        onChange={(e) => setSuffix(e.target.value)}
                        placeholder="Jr., Sr., III — if applicable"
                        className="rounded-xl border-slate-200 text-sm focus-visible:ring-[#005088]/30"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Date of Birth</Label>
                    <Input
                        type="date"
                        value={birthDate}
                        max={today}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="rounded-xl border-slate-200 text-sm focus-visible:ring-[#005088]/30"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Sex</Label>
                    <select
                        value={sex}
                        onChange={(e) => setSex(e.target.value as '' | 'male' | 'female')}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005088]/30"
                    >
                        <option value="">—</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                    Relationship to you <span className="text-rose-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {relationships
                        .filter((option) => option.value !== 'head')
                        .map((r) => {
                            const isSelected = relationship === r.value;
                            return (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => setRelationship(r.value)}
                                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-3 py-3 text-center text-xs font-semibold transition-all ${
                                        isSelected
                                            ? 'border-[#005088] bg-[#005088]/5 text-[#005088] shadow-sm'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <span>{r.label}</span>
                                    {r.requires_legal_age && (
                                        <span className={`text-[10px] font-normal ${isSelected ? 'text-[#005088]/70' : 'text-slate-400'}`}>
                                            Must be 18+
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                </div>
            </div>

            {serverError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{serverError}</p>}

            <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#005088] px-5 text-xs font-bold tracking-wider text-white uppercase transition-all hover:bg-[#003d66] active:scale-[0.98] disabled:opacity-50"
            >
                {saving ? 'Saving…' : 'Save Family Member'}
            </button>
        </div>
    );
}

function getHouseholdMemberError(error: unknown): string {
    if (!axios.isAxiosError(error)) {
        return 'Could not save the family member. Please try again.';
    }

    if (!error.response) {
        return 'Could not connect to the server. Please check your connection and try again.';
    }

    const data = error.response.data as
        | {
              message?: string;
              errors?: Record<string, string[]>;
          }
        | string
        | undefined;

    if (typeof data === 'object' && data !== null) {
        if (data.message) {
            return data.message;
        }

        const firstValidationMessage = Object.values(data.errors ?? {}).flat()[0];
        if (firstValidationMessage) {
            return firstValidationMessage;
        }
    }

    if (error.response.status === 419) {
        return 'Your session expired. Refresh the page and try again.';
    }

    if (error.response.status === 401) {
        return 'Please sign in again before adding a household member.';
    }

    return 'Could not save the family member. Please try again.';
}
