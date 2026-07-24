import { FormInput } from '@/components/FormInputField';
import { DatePicker } from '@/components/Shared/DatePicker';
import type { EnumOption, ReligionOption, SectionProps } from '../types';
import { ShadcnSelectField } from './ShadcnSelectField';

/**
 * Section 1 of the profile setup wizard — the citizen's identity:
 * name, sex, date of birth, religion, educational attainment.
 *
 * The header (icon + "Personal Information" title) is rendered by the
 * parent wizard so this component focuses purely on the form fields.
 */

const SEX_OPTIONS = ['male', 'female'] as const;
const SUFFIX_OPTIONS = ['Jr.', 'Sr.', 'II', 'III', 'IV'];

interface Props extends SectionProps {
    religions: ReligionOption[];
    educationalAttainment: EnumOption[];
}

export function PersonalInformationSection({ data, setData, errors, religions, educationalAttainment }: Props) {
    return (
        <div className="space-y-5">
            {/* Name row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormInput
                    id="first_name"
                    label="First Name"
                    required
                    value={data.first_name}
                    onChange={(e) => setData('first_name', e.target.value)}
                    placeholder="hal. Maria"
                    error={errors.first_name}
                />

                <FormInput
                    id="middle_name"
                    label="Middle Name"
                    value={data.middle_name}
                    onChange={(e) => setData('middle_name', e.target.value)}
                    placeholder="hal. Santos"
                    error={errors.middle_name}
                />

                <FormInput
                    id="last_name"
                    label="Last Name"
                    required
                    value={data.last_name}
                    onChange={(e) => setData('last_name', e.target.value)}
                    placeholder="hal. Dela Cruz"
                    error={errors.last_name}
                />
            </div>

            {/* Suffix + Sex + Birth date */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ShadcnSelectField
                    id="suffix"
                    label="Suffix"
                    placeholder="Wala (None)"
                    value={data.suffix}
                    onValueChange={(value) => setData('suffix', value === 'none' ? '' : value)}
                    error={errors.suffix}
                    options={[{ value: 'none', label: 'Wala (None)' }, ...SUFFIX_OPTIONS.map((s) => ({ value: s, label: s }))]}
                />

                <ShadcnSelectField
                    id="sex"
                    label="Kasarian"
                    required
                    placeholder="Pumili…"
                    value={data.sex}
                    onValueChange={(value) => setData('sex', value)}
                    error={errors.sex}
                    options={SEX_OPTIONS.map((s) => ({ value: s, label: s === 'male' ? 'Lalaki' : 'Babae' }))}
                />

                <DatePicker
                    label="Araw ng Kapanganakan"
                    value={data.birth_date}
                    onChange={(dateValue) => setData('birth_date', dateValue)}
                />
            </div>

            {/* Religion + Educational attainment */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ShadcnSelectField
                    id="religion_id"
                    label="Relihiyon"
                    placeholder="Mas piniling hindi sabihin"
                    value={data.religion_id}
                    onValueChange={(value) => setData('religion_id', value)}
                    error={errors.religion_id}
                    options={religions.map((r) => ({ value: r.id, label: r.name }))}
                />

                <ShadcnSelectField
                    id="educational_attainment"
                    label="Educational Attainment"
                    placeholder="Select…"
                    value={data.educational_attainment}
                    onValueChange={(value) => setData('educational_attainment', value)}
                    error={errors.educational_attainment}
                    options={educationalAttainment}
                />
            </div>
        </div>
    );
}
