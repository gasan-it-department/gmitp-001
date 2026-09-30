import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { HouseholdMemberOption, RelationshipOption } from '@/Core/Types/ActionCenter/assistance';

type Member = Pick<HouseholdMemberOption, 'id' | 'first_name' | 'middle_name' | 'last_name' | 'suffix' | 'relationship' | 'beneficiary_id'>;

export function FilerRelationshipFields({
    filerName,
    filerBeneficiaryId,
    members,
    relationships,
    answers,
    onChange,
    errors,
}: {
    filerName: string;
    filerBeneficiaryId: string;
    members: Member[];
    relationships: RelationshipOption[];
    answers: Record<string, string>;
    onChange: (answers: Record<string, string>) => void;
    errors?: Record<string, string | undefined>;
}) {
    const filer = members.find((member) => member.beneficiary_id === filerBeneficiaryId);
    const others = members.filter((member) => member.id !== filer?.id);
    const isHead = filer?.relationship === 'head';

    return (
        <section className="space-y-3 rounded-md border border-slate-200 bg-white p-4 sm:p-5">
            <div>
                <h3 className="text-sm font-semibold text-slate-900">Household relationships for this request</h3>
                <p className="mt-1 text-xs text-slate-600">The household head and permanent roster stay unchanged.</p>
            </div>
            {!filer && <p className="text-sm text-red-700">The filer has no linked active household row. Correct the household before filing.</p>}
            {isHead && <p className="text-sm text-slate-600">The filer is the household head; relationships come from the saved roster.</p>}
            {isHead &&
                others.map((member) => {
                    const name = [member.first_name, member.middle_name, member.last_name, member.suffix].filter(Boolean).join(' ');
                    return (
                        <div key={member.id} className="grid gap-1 text-sm sm:grid-cols-2">
                            <span className="text-slate-600">
                                Relationship of {name} to {filerName}
                            </span>
                            <span className="font-medium text-slate-800">
                                {relationships.find((option) => option.value === member.relationship)?.label ?? 'Not recorded'}
                            </span>
                        </div>
                    );
                })}
            {filer &&
                !isHead &&
                others.map((member) => {
                    const name = [member.first_name, member.middle_name, member.last_name, member.suffix].filter(Boolean).join(' ');
                    return (
                        <div key={member.id} className="space-y-1.5">
                            <Label className="text-xs font-medium">
                                Relationship of {name} to {filerName}
                            </Label>
                            <Select value={answers[member.id] ?? ''} onValueChange={(value) => onChange({ ...answers, [member.id]: value })}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select relationship to filer" />
                                </SelectTrigger>
                                <SelectContent className="max-h-64 overflow-y-auto">
                                    {relationships.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors?.[`filer_relationships.${member.id}`] && (
                                <p className="text-xs text-red-600">{errors[`filer_relationships.${member.id}`]}</p>
                            )}
                        </div>
                    );
                })}
            {errors?.filer_relationships && <p className="text-xs text-red-600">{errors.filer_relationships}</p>}
            {errors?.request && <p className="text-xs text-red-600">{errors.request}</p>}
        </section>
    );
}
