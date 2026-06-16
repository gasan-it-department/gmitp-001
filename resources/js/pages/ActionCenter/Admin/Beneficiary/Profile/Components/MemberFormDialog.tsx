import StoreAdminHouseholdMemberController from '@/actions/App/External/Api/Controllers/ActionCenter/Household/StoreAdminHouseholdMemberController';
import UpdateHouseholdMemberController from '@/actions/App/External/Api/Controllers/ActionCenter/Household/UpdateHouseholdMemberController';
import { FormInput } from '@/components/FormInputField';
import { DatePicker } from '@/components/Shared/DatePicker';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';
import { ShadcnSelectField } from '../../../../Client/Apply/Beneficiary/Components/ShadcnSelectField';
import type { EnumOption, ReligionOption } from '../../../../Client/Apply/Beneficiary/types';
import type { HouseholdMemberRow } from './HouseholdMembersTable';

const SEX_OPTIONS = ['male', 'female'] as const;
const SUFFIX_OPTIONS = ['Jr.', 'Sr.', 'II', 'III', 'IV'];

/** Relationship option as returned by Relationship::toOptions(). */
export interface RelationshipOption {
    value: string;
    label: string;
    requires_legal_age: boolean;
}

type MemberFormData = {
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    relationship: string;
    birth_date: string;
    sex: string;
    civil_status: string;
    educational_attainment: string;
    occupation: string;
    monthly_income: string;
    religion_id: string;
    is_verified_dependent: boolean;
};

/** Build a fresh form-data object from a member (or empty defaults for "add"). */
function memberToFormData(member?: HouseholdMemberRow): MemberFormData {
    return {
        first_name: member?.first_name ?? '',
        middle_name: member?.middle_name ?? '',
        last_name: member?.last_name ?? '',
        suffix: member?.suffix ?? '',
        relationship: member && member.relationship !== 'head' ? member.relationship : '',
        birth_date: member?.birth_date ?? '',
        sex: member?.sex ?? '',
        civil_status: member?.civil_status ?? '',
        educational_attainment: member?.educational_attainment ?? '',
        occupation: member?.occupation ?? '',
        monthly_income: member && member.monthly_income > 0 ? String(member.monthly_income) : '',
        religion_id: member?.religion_id ?? '',
        is_verified_dependent: member?.is_verified_dependent ?? false,
    };
}

interface Props {
    open: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    beneficiaryId: string;
    /** Required in edit mode — the row being corrected. */
    member?: HouseholdMemberRow;
    religions: ReligionOption[];
    civilStatus: EnumOption[];
    educationalAttainment: EnumOption[];
    relationships: RelationshipOption[];
}

/**
 * Admin add / edit dialog for ONE non-head household member.
 *
 * Add  → POST StoreAdminHouseholdMemberController (admin-specific create action).
 * Edit → PUT  UpdateHouseholdMemberController (head rows are rejected server-side).
 *
 * Tenant rides on the X-Municipality-Slug header — the API routes have no
 * {municipality} segment (same pattern as the link-account modal).
 */
export default function MemberFormDialog({
    open,
    onClose,
    mode,
    beneficiaryId,
    member,
    religions,
    civilStatus,
    educationalAttainment,
    relationships,
}: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm<MemberFormData>(
        memberToFormData(member),
    );

    // Re-seed form state when the dialog opens (or the target member changes).
    // useForm only captures initial values on mount — the dialog stays mounted
    // and is toggled via `open`, so without this the edit fields stay empty.
    useEffect(() => {
        if (open) {
            setData(memberToFormData(member));
            clearErrors();
        }
    }, [open, member?.id]);

    const serverError = (errors as Record<string, string | undefined>).member;

    const handleClose = () => {
        clearErrors();
        reset();
        onClose();
    };

    const submitWithVerification = (verified: boolean) => {
        transform((current) => ({ ...current, is_verified_dependent: verified }));
        const options = {
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        } as const;

        if (mode === 'add') {
            post(StoreAdminHouseholdMemberController.url({ beneficiaryId }), options);
        } else if (member) {
            put(UpdateHouseholdMemberController.url({ memberId: member.id }), options);
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        submitWithVerification(false);
    };

    const canSubmit = data.first_name.trim().length > 0 && data.last_name.trim().length > 0 && data.relationship.length > 0 && !processing;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent 
                className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-xl text-slate-900">{mode === 'add' ? 'Add household member' : 'Edit household member'}</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        {mode === 'add'
                            ? 'Add another person who lives in this household. The change is logged.'
                            : 'Correct this household member’s details. The change is logged.'}
                    </DialogDescription>
                </DialogHeader>

                {serverError && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{serverError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 pt-1">
                    {/* Name row */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <FormInput
                            id="m_first_name"
                            label="First Name"
                            required
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            error={errors.first_name}
                        />
                        <FormInput
                            id="m_middle_name"
                            label="Middle Name"
                            value={data.middle_name}
                            onChange={(e) => setData('middle_name', e.target.value)}
                            error={errors.middle_name}
                        />
                        <FormInput
                            id="m_last_name"
                            label="Last Name"
                            required
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            error={errors.last_name}
                        />
                    </div>

                    {/* Suffix + Relationship + Sex */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <ShadcnSelectField
                            id="m_suffix"
                            label="Suffix"
                            placeholder="None"
                            value={data.suffix}
                            onValueChange={(value) => setData('suffix', value)}
                            error={errors.suffix}
                            options={SUFFIX_OPTIONS.map((s) => ({ value: s, label: s }))}
                        />
                        <ShadcnSelectField
                            id="m_relationship"
                            label="Relationship"
                            required
                            placeholder="Select…"
                            value={data.relationship}
                            onValueChange={(value) => setData('relationship', value)}
                            error={errors.relationship}
                            options={relationships.map((r) => ({ value: r.value, label: r.label }))}
                        />
                        <ShadcnSelectField
                            id="m_sex"
                            label="Sex"
                            placeholder="Select…"
                            value={data.sex}
                            onValueChange={(value) => setData('sex', value)}
                            error={errors.sex}
                            options={SEX_OPTIONS.map((s) => ({ value: s, label: s }))}
                        />
                    </div>

                    {/* Birth date + Civil status */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <DatePicker label="Date of Birth" value={data.birth_date} onChange={(v) => setData('birth_date', v)} />
                        <ShadcnSelectField
                            id="m_civil_status"
                            label="Civil Status"
                            placeholder="Select…"
                            value={data.civil_status}
                            onValueChange={(value) => setData('civil_status', value)}
                            error={errors.civil_status}
                            options={civilStatus}
                        />
                    </div>

                    {/* Educational attainment + Religion */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <ShadcnSelectField
                            id="m_educational_attainment"
                            label="Educational Attainment"
                            placeholder="Select…"
                            value={data.educational_attainment}
                            onValueChange={(value) => setData('educational_attainment', value)}
                            error={errors.educational_attainment}
                            options={educationalAttainment}
                        />
                        <ShadcnSelectField
                            id="m_religion_id"
                            label="Religion"
                            placeholder="Prefer not to say"
                            value={data.religion_id}
                            onValueChange={(value) => setData('religion_id', value)}
                            error={errors.religion_id}
                            options={religions.map((r) => ({ value: r.id, label: r.name }))}
                        />
                    </div>

                    {/* Occupation + Income */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormInput
                            id="m_occupation"
                            label="Occupation"
                            value={data.occupation}
                            onChange={(e) => setData('occupation', e.target.value)}
                            placeholder='e.g. Farmer, "None"'
                            error={errors.occupation}
                        />
                        <FormInput
                            id="m_monthly_income"
                            label="Monthly Income (₱)"
                            type="number"
                            min={0}
                            step={0.01}
                            value={data.monthly_income}
                            onChange={(e) => setData('monthly_income', e.target.value)}
                            placeholder="0.00"
                            error={errors.monthly_income}
                        />
                    </div>

                    <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="ghost" onClick={handleClose} className="text-slate-500 hover:bg-slate-100">
                            Cancel
                        </Button>
                        <Button type="submit" variant="outline" disabled={!canSubmit}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save pending
                        </Button>
                        <Button
                            type="button"
                            onClick={() => submitWithVerification(true)}
                            disabled={!canSubmit}
                            className="bg-emerald-700 text-white hover:bg-emerald-800"
                        >
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save verified
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
