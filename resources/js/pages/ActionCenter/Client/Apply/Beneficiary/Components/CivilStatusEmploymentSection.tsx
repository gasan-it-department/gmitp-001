import { FormInput } from '@/components/FormInputField';
import type { EnumOption, SectionProps } from '../types';
import { ShadcnSelectField } from './ShadcnSelectField';

/**
 * Section 2 of the profile setup wizard — citizen's civil status,
 * occupation, and declared monthly income. These three are the primary
 * inputs for indigency assessment when the request goes for review.
 *
 * The income disclaimer paragraph is intentional UX — it tells the
 * citizen "Enter 0 if you have no income" so the form isn't bypassed
 * by people who incorrectly leave it blank.
 */

interface Props extends SectionProps {
    civilStatus: EnumOption[];
}

export function CivilStatusEmploymentSection({ data, setData, errors, civilStatus }: Props) {
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ShadcnSelectField
                    id="civil_status"
                    label="Civil Status"
                    required
                    placeholder="Select…"
                    value={data.civil_status}
                    onValueChange={(value) => setData('civil_status', value)}
                    error={errors.civil_status}
                    options={civilStatus}
                />

                <FormInput
                    id="occupation"
                    label="Occupation"
                    value={data.occupation}
                    onChange={(e) => setData('occupation', e.target.value)}
                    placeholder='e.g. Farmer, Driver, "None"'
                    error={errors.occupation}
                    required
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput
                    id="monthly_income"
                    label="Monthly Income (₱)"
                    type="number"
                    min={0}
                    step={0.01}
                    value={data.monthly_income}
                    onChange={(e) => setData('monthly_income', e.target.value)}
                    placeholder="0.00"
                    error={errors.monthly_income}
                    required
                />
            </div>

            <p className="text-xs leading-relaxed text-slate-500">
                Enter <strong>0</strong> if you currently have no income, or write <strong>"None"</strong> as your occupation if you are unemployed.
                This information is used to evaluate your eligibility for MSWD assistance programs.
            </p>
        </div>
    );
}
