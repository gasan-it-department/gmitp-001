import { DatePicker } from '@/components/Shared/DatePicker';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProcurementFormData } from '@/Core/Types/Procurement/procurement';
import { AlertTriangle, Ban } from 'lucide-react';

interface Props {
    data: ProcurementFormData;
    setData: <K extends keyof ProcurementFormData>(field: K, value: ProcurementFormData[K]) => void;
    errors: Partial<Record<keyof ProcurementFormData, string>>;
    processing: boolean;
}

export function HistoricalOutcome({ data, setData, errors, processing }: Props) {
    if (data.status === 'failed') {
        return (
            <section className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
                <div className="flex items-center gap-4 border-b border-rose-100 bg-rose-50/70 px-6 py-5 sm:px-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white">
                        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Historical failure outcome</h3>
                        <p className="text-sm text-slate-600">This reason and date will appear in the citizen transparency record.</p>
                    </div>
                </div>
                <div className="grid gap-6 p-6 sm:grid-cols-[1fr_220px] sm:p-8">
                    <div>
                        <Label htmlFor="failure_reason">
                            Official reason for failed bidding <span className="text-rose-600">*</span>
                        </Label>
                        <Textarea
                            id="failure_reason"
                            value={data.failure_reason || ''}
                            onChange={(event) => setData('failure_reason', event.target.value)}
                            disabled={processing}
                            aria-invalid={Boolean(errors.failure_reason)}
                            placeholder="Explain why the bidding failed, using the BAC resolution where available."
                            className={`mt-1.5 min-h-28 resize-y ${errors.failure_reason ? 'border-destructive' : ''}`}
                            required
                        />
                        {errors.failure_reason && <p className="mt-1 text-sm text-destructive">{errors.failure_reason}</p>}
                    </div>
                    <DatePicker
                        label="Official failure date *"
                        value={data.failed_date}
                        onChange={(value) => setData('failed_date', value)}
                        error={errors.failed_date}
                        disableFuture
                    />
                </div>
            </section>
        );
    }

    if (data.status === 'cancelled') {
        return (
            <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
                <div className="flex items-center gap-4 border-b bg-slate-100 px-6 py-5 sm:px-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700 text-white">
                        <Ban className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Historical cancellation outcome</h3>
                        <p className="text-sm text-slate-600">
                            For historical cancellations, the remarks field becomes the public cancellation reason.
                        </p>
                    </div>
                </div>
                <div className="p-6 text-sm leading-6 text-slate-600 sm:p-8">
                    Enter the official cancellation reason in <span className="font-semibold text-slate-900">Public cancellation reason</span> before
                    saving. Avoid internal-only notes or personal bidder information.
                </div>
            </section>
        );
    }

    return null;
}
