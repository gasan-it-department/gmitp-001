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
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <FileText className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Why are you requesting assistance?</h2>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold text-slate-500 uppercase">
                    Briefly explain your situation
                </Label>
                <Textarea
                    id="description"
                    className="min-h-[160px] resize-none rounded-2xl border-slate-200 bg-slate-50 p-4"
                    placeholder="Halimbawa: Ang aking ina ay nasa ospital at kailangan ng tulong para sa kanyang gamot at bayarin sa ospital..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <p className="text-[11px] text-slate-400">
                    The social worker will use this when contacting you. The exact assistance amount will be decided after the interview.
                </p>
                {error && <p className="text-xs font-medium text-red-500">{error}</p>}
            </div>
        </div>
    );
}
