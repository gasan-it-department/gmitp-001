import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Info, Users } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

export type RelationshipType = '' | 'spouse' | 'parent' | 'child' | 'sibling';

export interface OnBehalfOfData {
    first_name:    string;
    middle_name:   string;
    last_name:     string;
    suffix:        string;
    date_of_death: string; // only used when isBurial = true
    relationship:  RelationshipType;
}

interface Props {
    data:               OnBehalfOfData;
    onChange:           <K extends keyof OnBehalfOfData>(field: K, value: OnBehalfOfData[K]) => void;
    /** True when the assistance type is burial — reveals the Date of Death field
     *  and adjusts copy to say "Deceased" instead of "Family Member". */
    isBurial:           boolean;
    /** Used to enforce the "legal age" rule for child/sibling relationships. */
    applicantBirthDate: string | null;
    errors?:            Record<string, string | undefined>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calculateAge(birthDate: string | null): number {
    if (!birthDate) return 999; // unknown = no block
    return Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

const RELATIONSHIPS: { value: RelationshipType; label: string; ageNote?: string }[] = [
    { value: 'spouse',  label: 'Spouse' },
    { value: 'parent',  label: 'Parent' },
    { value: 'child',   label: 'Son / Daughter', ageNote: 'Must be 18+' },
    { value: 'sibling', label: 'Brother / Sister', ageNote: 'Must be 18+' },
];

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Collects information about the person the applicant is assisting.
 *
 * - For BURIAL:   shows "Deceased Person's Information" + Date of Death field.
 *                 The EO note about authorized representatives is displayed.
 * - For ALL OTHER programs: shows "Person Being Assisted" without the
 *                 Date of Death field. A general representative notice is shown.
 *
 * Enforces the EO's legal-age rule: Son/Daughter and Brother/Sister must be
 * 18+ to file on behalf of another person.
 */
export function OnBehalfOfSection({ data, onChange, isBurial, applicantBirthDate, errors = {} }: Props) {
    const age              = calculateAge(applicantBirthDate);
    const requiresLegalAge = data.relationship === 'child' || data.relationship === 'sibling';
    const isUnderAge       = requiresLegalAge && age < 18;

    const today = new Date().toISOString().split('T')[0];

    // ── Copy switches based on program type ──────────────────────────────────
    const heading     = isBurial ? "Deceased Person's Information" : 'Person Being Assisted';
    const subheading  = isBurial
        ? 'Burial assistance is filed by an authorized family representative, not the deceased.'
        : 'You are filing this request on behalf of a family member who needs assistance.';

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
                        Per the <strong>Gasan AICS Executive Order</strong>, only the <strong>spouse, parent, adult
                        child (18+), or adult sibling (18+)</strong> of the deceased may file this request.
                    </p>
                </div>
            ) : (
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                    <p className="text-xs leading-relaxed text-slate-700">
                        As an <strong>authorized representative</strong>, you may file on behalf of a
                        spouse, parent, child (18+), or sibling (18+). Your own verified identity will
                        be recorded as the filing party.
                    </p>
                </div>
            )}

            {/* ── Name fields ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                        First Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        value={data.first_name}
                        onChange={(e) => onChange('first_name', e.target.value)}
                        placeholder="e.g. Jose"
                        className="rounded-xl border-slate-200 text-sm focus-visible:ring-[#005088]/30"
                    />
                    {errors['on_behalf_first_name'] && (
                        <p className="text-xs text-rose-500">{errors['on_behalf_first_name']}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Middle Name</Label>
                    <Input
                        value={data.middle_name}
                        onChange={(e) => onChange('middle_name', e.target.value)}
                        placeholder="e.g. Santos"
                        className="rounded-xl border-slate-200 text-sm focus-visible:ring-[#005088]/30"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                        Last Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        value={data.last_name}
                        onChange={(e) => onChange('last_name', e.target.value)}
                        placeholder="e.g. Dela Cruz"
                        className="rounded-xl border-slate-200 text-sm focus-visible:ring-[#005088]/30"
                    />
                    {errors['on_behalf_last_name'] && (
                        <p className="text-xs text-rose-500">{errors['on_behalf_last_name']}</p>
                    )}
                </div>
            </div>

            <div className={`grid grid-cols-1 gap-4 ${isBurial ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
                {/* Date of Death — burial only */}
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
                        {errors['on_behalf_date_of_death'] && (
                            <p className="text-xs text-rose-500">{errors['on_behalf_date_of_death']}</p>
                        )}
                    </div>
                )}

                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Suffix</Label>
                    <Input
                        value={data.suffix}
                        onChange={(e) => onChange('suffix', e.target.value)}
                        placeholder="Jr., Sr., III — if applicable"
                        className="rounded-xl border-slate-200 text-sm focus-visible:ring-[#005088]/30"
                    />
                </div>
            </div>

            {/* ── Relationship selector ── */}
            <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                    Your Relationship to {isBurial ? 'the Deceased' : 'this Person'}{' '}
                    <span className="text-rose-500">*</span>
                </Label>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {RELATIONSHIPS.map((r) => {
                        const isSelected = data.relationship === r.value;
                        return (
                            <button
                                key={r.value}
                                type="button"
                                onClick={() => onChange('relationship', r.value)}
                                className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-3 py-3 text-center text-xs font-semibold transition-all
                                    ${isSelected
                                        ? 'border-[#005088] bg-[#005088]/5 text-[#005088] shadow-sm'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <span>{r.label}</span>
                                {r.ageNote && (
                                    <span className={`text-[10px] font-normal ${isSelected ? 'text-[#005088]/70' : 'text-slate-400'}`}>
                                        {r.ageNote}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {errors['relationship_to_beneficiary'] && (
                    <p className="text-xs text-rose-500">{errors['relationship_to_beneficiary']}</p>
                )}
            </div>

            {/* ── Under-age warning ── */}
            {isUnderAge && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <p className="text-xs leading-relaxed text-red-800">
                        Based on your profile, you appear to be <strong>under 18 years old</strong>. The Executive
                        Order requires that a son/daughter or brother/sister must be of{' '}
                        <strong>legal age (18+)</strong> to file on behalf of another person. Please ask a
                        qualified family member (spouse or parent) to file instead.
                    </p>
                </div>
            )}
        </div>
    );
}
