import { FormInput } from '@/components/FormInputField';
import { DatePicker } from '@/components/Shared/DatePicker';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { ProcurementDetail } from '@/Core/Types/Procurement/procurement';
import procurementApi from '@/routes/procurement';
import { useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { FormEvent } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    procurement: ProcurementDetail;
}

export default function OpenBiddingDialog({ isOpen, onClose, procurement }: Props) {
    const { currentMunicipality } = useMunicipality();
    // 1. Initialize form only with the data that might be missing
    const { data, setData, put, processing, errors, reset } = useForm({
        abc_amount: procurement.abc_amount || '',
        pre_bid_date: procurement.pre_bid_date ? procurement.pre_bid_date.split('T')[0] : '',
        closing_date: procurement.closing_date ? procurement.closing_date.split('T')[0] : '',
        reference_number: procurement.reference_number || '',
    });

    // 2. Hard Requirements Check (Must have documents to open bidding)
    const hasDocuments = procurement.documents && procurement.documents.length > 0;

    const submit = (e: FormEvent) => {
        e.preventDefault();

        // Use the PUT route you defined in web.php
        put(procurementApi.status.open.url(procurement.id), {
            preserveScroll: true,
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    if (!isOpen) return null;

    // Helper to format currency for the read-only view
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Open for Bidding</h2>
                        <p className="text-sm text-slate-500">Pre-flight checklist for R.A. 9184 compliance</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-6">
                    <div className="space-y-5">
                        {/* 1. Bidding Documents Check (Hard Blocker) */}
                        <div className="rounded-lg border p-4">
                            <h3 className="mb-2 text-sm font-semibold text-slate-700">1. Bidding Documents</h3>
                            {hasDocuments ? (
                                <div className="flex items-center gap-2 text-sm text-green-700">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span>{procurement.documents!.length} document(s) attached and ready.</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-red-600">
                                    <AlertCircle className="h-5 w-5" />
                                    <span>Missing! You must attach Bidding Documents before opening.</span>
                                </div>
                            )}
                        </div>

                        {/* 2. ABC Amount (Smart Checklist) */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700">2. Approved Budget (ABC)</label>{' '}
                            {procurement.abc_amount ? (
                                <div className="mt-1 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="font-bold">{formatCurrency(procurement.abc_amount)}</span>
                                </div>
                            ) : (
                                <div className="mt-1">
                                    <FormInput
                                        id="abc_amount"
                                        label=""
                                        placeholder="Approved Budget (ABC)"
                                        value={data.abc_amount.toString()}
                                        onChange={(e) => setData('abc_amount', e.target.value)}
                                        error={errors.abc_amount}
                                    />
                                </div>
                            )}
                        </div>

                        {/* 3. Procurement Timeline (Smart Checklist) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700">Pre-Bid Date</label>
                                {procurement.pre_bid_date ? (
                                    <div className="mt-1 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                                        <span className="truncate">{new Date(procurement.pre_bid_date).toLocaleDateString()}</span>
                                    </div>
                                ) : (
                                    <div className="mt-1">
                                        <DatePicker
                                            label=""
                                            value={data.pre_bid_date}
                                            onChange={(val) => setData('pre_bid_date', val)}
                                            error={errors.pre_bid_date}
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700">Closing Date</label>
                                {procurement.closing_date ? (
                                    <div className="mt-1 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                                        <span className="truncate">{new Date(procurement.closing_date).toLocaleDateString()}</span>
                                    </div>
                                ) : (
                                    <div className="mt-1">
                                        <DatePicker
                                            label=""
                                            error={errors.closing_date}
                                            value={data.closing_date}
                                            onChange={(val) => setData('closing_date', val)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 4. PhilGEPS Reference (Always Editable unless already published) */}
                        <div>
                            <FormInput
                                id="reference_number"
                                label="Enter Reference number"
                                placeholder="PhilGEPS Reference Number"
                                value={data.reference_number}
                                onChange={(e) => setData('reference_number', e.target.value)}
                                error={errors.reference_number}
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !hasDocuments}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                            Confirm & Open Bidding
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
