import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';

interface Props {
    checked: boolean;
    onChange: (next: boolean) => void;
    error?: string;
}

/**
 * Data Privacy Act consent. Must be explicitly accepted before submit is allowed.
 */
export function PrivacyConsent({ checked, onChange, error }: Props) {
    return (
        <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-6">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-xs leading-relaxed text-amber-800">
                    <strong>Data Privacy Notice:</strong> Ang lahat ng impormasyong iyong ibibigay ay gagamitin lamang para sa pagproseso
                    ng iyong assistance request alinsunod sa <strong>Data Privacy Act of 2012</strong>.
                </p>
            </div>

            <Label
                htmlFor="privacy_consent"
                className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 transition-colors hover:border-slate-200"
            >
                <Checkbox
                    id="privacy_consent"
                    checked={checked}
                    onCheckedChange={(value) => onChange(Boolean(value))}
                    className="mt-0.5"
                />
                <span className="text-sm font-semibold text-slate-700">
                    Sumasang-ayon ako sa Data Privacy notice at kinukumpirma ko na totoo ang lahat ng impormasyong aking ibinigay.
                </span>
            </Label>

            {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        </div>
    );
}
