import { FormInput } from '@/components/FormInputField';
import type { SectionProps } from '../types';

interface Props extends SectionProps {
    phoneRequired?: boolean;
}

export function CommunicationSection({ data, setData, errors, phoneRequired = false }: Props) {
    return (
        <div className="space-y-5">
            <FormInput
                id="contact_phone"
                label="Contact Phone"
                required={phoneRequired}
                value={data.contact_phone}
                onChange={(e) => setData('contact_phone', e.target.value)}
                placeholder="09XXXXXXXXX"
                error={errors.contact_phone}
            />

            <p className="text-xs leading-relaxed text-slate-500">
                This is the contact MSWD will use for interviews, missing requirements, and profile review. It can be different from the portal
                account login.
            </p>
        </div>
    );
}
