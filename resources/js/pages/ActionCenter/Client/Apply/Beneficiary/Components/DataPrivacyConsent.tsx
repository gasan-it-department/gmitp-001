import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import type { SectionProps } from '../types';

/**
 * Data Privacy Act (RA 10173) notice + the citizen's required consent
 * checkbox at the end of the profile setup wizard.
 *
 * The Tagalog notice is the legally-binding text; English translations
 * are intentionally NOT shown here because the registration UX is
 * targeted at the Tagalog-speaking citizen base. The municipality name
 * is interpolated so the notice is locally relevant.
 *
 * Activity log + privacy_consented_at column capture this attestation
 * server-side at submit time; this UI is the citizen-facing evidence.
 */

interface Props extends SectionProps {
    municipalityName: string;
}

export function DataPrivacyConsent({ data, setData, errors, municipalityName }: Props) {
    return (
        <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-6">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-xs leading-relaxed text-amber-800">
                    <strong>Data Privacy Notice:</strong> Ang impormasyong iyong ibibigay ay gagamitin lamang ng{' '}
                    <strong>MSWD {municipalityName}</strong> para sa pagproseso ng iyong profile at pagsusuri ng iyong pagiging
                    karapat-dapat sa mga programa ng tulong, alinsunod sa <strong>Data Privacy Act of 2012 (RA 10173)</strong>. Hindi
                    ibabahagi ang iyong impormasyon sa iba pang ahensya nang walang iyong pahintulot.
                </p>
            </div>

            <Label
                htmlFor="terms_consent"
                className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 transition-colors hover:border-slate-200"
            >
                <Checkbox
                    id="terms_consent"
                    checked={data.terms_consent}
                    onCheckedChange={(value) => setData('terms_consent', Boolean(value))}
                    className="mt-0.5"
                />
                <span className="text-sm font-semibold text-slate-700">
                    Sumasang-ayon ako sa Data Privacy notice at kinukumpirma ko na totoo ang lahat ng impormasyong aking ibinigay.
                </span>
            </Label>

            {errors.terms_consent && <p className="text-xs font-medium text-red-500">{errors.terms_consent}</p>}
        </div>
    );
}
