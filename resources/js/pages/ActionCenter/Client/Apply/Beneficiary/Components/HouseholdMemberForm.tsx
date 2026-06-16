import { FormInput } from '@/components/FormInputField';
import { DatePicker } from '@/components/Shared/DatePicker';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useState } from 'react';
import type { EnumOption, HouseholdMemberDraft, ReligionOption } from '../types';
import { ShadcnSelectField } from './ShadcnSelectField';

/**
 * Inline mini-form for adding a single household member to the profile
 * setup wizard's family roster.
 *
 * Maintains LOCAL state during entry; commits a complete draft up to
 * the parent section via `onSave` only when the citizen clicks "Add to
 * household." The parent owns the array of drafts on the wizard's
 * useForm state.
 *
 * Fields mirror the paper-form requirements: name + relationship + age
 * (birth_date) + educational attainment + occupation + monthly income.
 * Sex, civil status, and religion are optional (digital-system bonuses
 * not on the paper form — admin can backfill during interview).
 */

const SEX_OPTIONS = ['male', 'female'] as const;
const SUFFIX_OPTIONS = ['Jr.', 'Sr.', 'II', 'III', 'IV'];

interface Props {
    relationships: EnumOption[];
    civilStatus: EnumOption[];
    educationalAttainment: EnumOption[];
    religions: ReligionOption[];
    onSave: (member: HouseholdMemberDraft) => void;
    onCancel: () => void;
}

const EMPTY_DRAFT: HouseholdMemberDraft = {
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    relationship: '',
    birth_date: '',
    sex: '',
    civil_status: '',
    educational_attainment: '',
    occupation: '',
    monthly_income: '',
    religion_id: '',
};

export function HouseholdMemberForm({ relationships, civilStatus, educationalAttainment, religions, onSave, onCancel }: Props) {
    const [draft, setDraft] = useState<HouseholdMemberDraft>(EMPTY_DRAFT);

    const updateField = <K extends keyof HouseholdMemberDraft>(key: K, value: HouseholdMemberDraft[K]) => {
        setDraft((prev) => ({ ...prev, [key]: value }));
    };

    // Mirror of paper-form's required-field set. Sex / civil_status / religion
    // are NOT required here even though they're on the citizen's own profile
    // form — household members are listed under a lighter burden.
    const canSave =
        draft.first_name.trim().length > 0 &&
        draft.last_name.trim().length > 0 &&
        draft.relationship.length > 0;

    return (
        <div className="rounded-2xl border-2 border-dashed border-[#005088]/30 bg-blue-50/30 p-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-wide text-[#005088] uppercase">Add Household Member</h3>
                <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-4">
                {/* Name row */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <FormInput
                        id="hm_first_name"
                        label="First Name"
                        required
                        value={draft.first_name}
                        onChange={(e) => updateField('first_name', e.target.value)}
                        placeholder="e.g. Maria"
                    />
                    <FormInput
                        id="hm_middle_name"
                        label="Middle Name"
                        value={draft.middle_name}
                        onChange={(e) => updateField('middle_name', e.target.value)}
                        placeholder="e.g. Santos"
                    />
                    <FormInput
                        id="hm_last_name"
                        label="Last Name"
                        required
                        value={draft.last_name}
                        onChange={(e) => updateField('last_name', e.target.value)}
                        placeholder="e.g. Dela Cruz"
                    />
                </div>

                {/* Suffix / Relationship / Sex */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <ShadcnSelectField
                        id="hm_suffix"
                        label="Suffix"
                        placeholder="None"
                        value={draft.suffix}
                        onValueChange={(value) => updateField('suffix', value)}
                        options={SUFFIX_OPTIONS.map((s) => ({ value: s, label: s }))}
                    />
                    <ShadcnSelectField
                        id="hm_relationship"
                        label="Relationship"
                        required
                        placeholder="Select…"
                        value={draft.relationship}
                        onValueChange={(value) => updateField('relationship', value)}
                        options={relationships}
                    />
                    <ShadcnSelectField
                        id="hm_sex"
                        label="Sex"
                        placeholder="Select…"
                        value={draft.sex}
                        onValueChange={(value) => updateField('sex', value)}
                        options={SEX_OPTIONS.map((s) => ({ value: s, label: s }))}
                    />
                </div>

                {/* Date of birth / Civil status */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DatePicker
                        label="Date of Birth"
                        value={draft.birth_date}
                        onChange={(dateValue) => updateField('birth_date', dateValue)}
                    />
                    <ShadcnSelectField
                        id="hm_civil_status"
                        label="Civil Status"
                        placeholder="Select…"
                        value={draft.civil_status}
                        onValueChange={(value) => updateField('civil_status', value)}
                        options={civilStatus}
                    />
                </div>

                {/* Educational attainment / Religion */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ShadcnSelectField
                        id="hm_educational_attainment"
                        label="Educational Attainment"
                        placeholder="Select…"
                        value={draft.educational_attainment}
                        onValueChange={(value) => updateField('educational_attainment', value)}
                        options={educationalAttainment}
                    />
                    <ShadcnSelectField
                        id="hm_religion_id"
                        label="Religion"
                        placeholder="Prefer not to say"
                        value={draft.religion_id}
                        onValueChange={(value) => updateField('religion_id', value)}
                        options={religions.map((r) => ({ value: r.id, label: r.name }))}
                    />
                </div>

                {/* Occupation / Monthly income */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormInput
                        id="hm_occupation"
                        label="Occupation"
                        value={draft.occupation}
                        onChange={(e) => updateField('occupation', e.target.value)}
                        placeholder='e.g. Farmer, "None"'
                    />
                    <FormInput
                        id="hm_monthly_income"
                        label="Monthly Income (₱)"
                        type="number"
                        min={0}
                        step={0.01}
                        value={draft.monthly_income}
                        onChange={(e) => updateField('monthly_income', e.target.value)}
                        placeholder="0.00"
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            onSave(draft);
                            setDraft(EMPTY_DRAFT);
                        }}
                        disabled={!canSave}
                        className="bg-[#005088] text-white hover:bg-[#003d66]"
                    >
                        Add to Household
                    </Button>
                </div>
            </div>
        </div>
    );
}
