import { FormInput } from '@/components/FormInputField';
import { BarangaySelect } from '@/components/Shared/BarangaySelect';
import type { SectionProps } from '../types';

/**
 * Section 3 of the profile setup wizard — the citizen's home address.
 *
 * Stores BOTH the barangay's display name AND its PSGC code on the
 * form data. The name powers human-readable address rendering; the
 * PSGC code anchors structured queries / reporting on ac_households.
 */

interface Props extends SectionProps {
    /** PSGC code of the current municipality — scopes the barangay list. */
    municipalityPsgcId: string;
}

export function HomeAddressSection({ data, setData, errors, municipalityPsgcId }: Props) {
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <BarangaySelect
                    municipalityId={municipalityPsgcId}
                    value={data.barangay_code}
                    onChange={({ name, psgc_code }) => {
                        setData('barangay', name);
                        setData('barangay_code', psgc_code);
                    }}
                />

                <FormInput
                    id="street"
                    label="Street / Purok / Sitio"
                    value={data.street}
                    onChange={(e) => setData('street', e.target.value)}
                    placeholder="e.g. Purok 3, Sitio Malaya"
                    error={errors.street}
                />
            </div>
        </div>
    );
}
