import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ShieldCheck } from 'lucide-react';

interface Props {
    checked: boolean;
    onCheckedChange: (value: boolean) => void;
    error?: string;
    municipalityName: string;
}

/**
 * Admin counterpart to the citizen's DataPrivacyConsent block.
 *
 * Same underlying field (`terms_consent`), different meaning: the citizen ticks
 * it for themselves online, but for a walk-in the ADMIN affirms — on behalf of
 * the applicant — that ID was verified, the registry was checked for an
 * existing record, and RA 10173 consent was obtained in person. The action
 * server-stamps the consent timestamp + version as evidence either way.
 */
export function AdminEncodeAffirmation({ checked, onCheckedChange, error, municipalityName }: Props) {
    return (
        <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-6">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-xs leading-relaxed text-amber-800">
                    <strong>Encoder affirmation:</strong> You are recording this person on behalf of MSWD {municipalityName}.
                    Confirm you verified their identity against a valid government-issued ID, searched the registry for an
                    existing record, and that they consented (RA 10173) to MSWD processing their information.
                </p>
            </div>

            <Label
                htmlFor="terms_consent"
                className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 transition-colors hover:border-slate-200"
            >
                <Checkbox
                    id="terms_consent"
                    checked={checked}
                    onCheckedChange={(value) => onCheckedChange(Boolean(value))}
                    className="mt-0.5"
                />
                <span className="text-sm font-semibold text-slate-700">
                    I verified the applicant&rsquo;s ID, checked the registry for an existing record, and confirm their RA 10173 consent.
                </span>
            </Label>

            {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        </div>
    );
}
