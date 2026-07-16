import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';

interface Props {
    value: string;
    onChange: (next: string) => void;
    error?: string;
}

/**
 * Single free-text field where the citizen explains their situation.
 * Intentionally no amount field — amount is set only at approval time.
 */
export function RequestReasonSection({ value, onChange, error }: Props) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                    <FileText className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Bakit ka humihingi ng tulong?</h2>
                    <p className="text-sm text-slate-500">Ibigay ang mga detalye tungkol sa iyong sitwasyon.</p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="sr-only">
                    Ibahagi nang maikli ang iyong sitwasyon
                </Label>
                <Textarea
                    id="description"
                    className="min-h-[160px] resize-none rounded-2xl border-slate-200 bg-slate-50 p-4"
                    placeholder="Halimbawa: Ang aking ina ay nasa ospital at kailangan ng tulong para sa kanyang gamot at bayarin sa ospital..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <p className="text-[11px] text-slate-400">
                    Gagamitin ito ng social worker kapag nakipag-ugnayan sa iyo. Ang eksaktong halaga ng tulong ay pagpapasyahan pagkatapos ng interview.
                </p>
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        </div>
    );
}
