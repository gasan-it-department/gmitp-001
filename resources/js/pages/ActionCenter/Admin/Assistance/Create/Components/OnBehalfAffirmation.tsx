import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ShieldCheck } from 'lucide-react';

interface Props {
    checked: boolean;
    onCheckedChange: (value: boolean) => void;
    error?: string;
    beneficiaryName: string;
}

/**
 * Admin affirmation for an ON-BEHALF assistance request — the counterpart to the
 * citizen's DataPrivacyConsent on the online apply form.
 *
 * Bound to the same `privacy_consent` field the server validates as `accepted`,
 * but here the ADMIN affirms — on behalf of the applicant — that the person
 * consented (RA 10173) to MSWD processing this request. The action server-stamps
 * the consent timestamp + notice version as the evidence of record.
 */
export function OnBehalfAffirmation({ checked, onCheckedChange, error, beneficiaryName }: Props) {
    return (
        <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-6">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-xs leading-relaxed text-amber-800">
                    <strong>On-behalf affirmation:</strong> You are filing this request for{' '}
                    <span className="font-semibold capitalize">{beneficiaryName.toLowerCase()}</span>. Confirm you verified their
                    identity, that the details below reflect their actual request, and that they consented (RA 10173) to MSWD
                    processing this application.
                </p>
            </div>

            <Label
                htmlFor="privacy_consent"
                className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 transition-colors hover:border-slate-200"
            >
                <Checkbox
                    id="privacy_consent"
                    checked={checked}
                    onCheckedChange={(value) => onCheckedChange(Boolean(value))}
                    className="mt-0.5"
                />
                <span className="text-sm font-semibold text-slate-700">
                    I verified the applicant&rsquo;s identity and confirm their RA 10173 consent to file this request.
                </span>
            </Label>

            {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        </div>
    );
}
