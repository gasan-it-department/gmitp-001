import SaveAssistanceDisbursementController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/SaveAssistanceDisbursementController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AssistanceClaimLocation, AssistanceDisbursement } from '@/Core/Types/ActionCenter/assistance';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { Banknote, Loader2 } from 'lucide-react';
import { FormEvent, useEffect } from 'react';

interface Props {
    requestId: string;
    amount: number;
    claimantName: string;
    existing: AssistanceDisbursement | null;
    locations: AssistanceClaimLocation[];
    open: boolean;
    onClose: () => void;
}

const localToday = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60_000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

export default function PrepareDisbursementDialog({ requestId, amount, claimantName, existing, locations, open, onClose }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        method: existing?.method ?? 'check',
        instrument_reference_number: existing?.instrument_reference_number ?? '',
        instrument_date: existing?.instrument_date ?? localToday(),
        claim_location_key: existing?.claim_location_key ?? locations[0]?.key ?? '',
        notes: existing?.preparation_notes ?? '',
    });

    useEffect(() => {
        if (!open) return;
        setData({
            method: existing?.method ?? 'check',
            instrument_reference_number: existing?.instrument_reference_number ?? '',
            instrument_date: existing?.instrument_date ?? localToday(),
            claim_location_key: existing?.claim_location_key ?? locations[0]?.key ?? '',
            notes: existing?.preparation_notes ?? '',
        });
        clearErrors();
    }, [open, existing, locations, setData, clearErrors]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(SaveAssistanceDisbursementController.url({ assistanceRequestId: requestId }), {
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const referenceLabel = data.method === 'check' ? 'Check number' : 'Cash voucher reference';
    const dateLabel = data.method === 'check' ? 'Check date' : 'Voucher date';
    const disbursementError = (errors as Record<string, string | undefined>).disbursement;

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{existing ? 'Edit disbursement draft' : 'Prepare disbursement'}</DialogTitle>
                    <DialogDescription>
                        Record the financial instrument. This does not release the assistance or start its cooldown.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Payee</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{claimantName}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Approved amount</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Payment method</Label>
                        <Select value={data.method} onValueChange={(value: 'check' | 'cash') => setData('method', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="check">Check</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.method && <p className="text-xs text-red-600">{errors.method}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="instrument_reference_number">{referenceLabel}</Label>
                            <Input
                                id="instrument_reference_number"
                                value={data.instrument_reference_number}
                                onChange={(event) => setData('instrument_reference_number', event.target.value)}
                                maxLength={100}
                            />
                            {errors.instrument_reference_number && <p className="text-xs text-red-600">{errors.instrument_reference_number}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="instrument_date">{dateLabel}</Label>
                            <Input
                                id="instrument_date"
                                type="date"
                                value={data.instrument_date}
                                onChange={(event) => setData('instrument_date', event.target.value)}
                            />
                            {errors.instrument_date && <p className="text-xs text-red-600">{errors.instrument_date}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Claim location</Label>
                        <Select value={data.claim_location_key} onValueChange={(value) => setData('claim_location_key', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a configured location" />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((location) => (
                                    <SelectItem key={location.key} value={location.key}>
                                        {location.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.claim_location_key && <p className="text-xs text-red-600">{errors.claim_location_key}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="disbursement_notes">Preparation notes</Label>
                        <Textarea
                            id="disbursement_notes"
                            value={data.notes}
                            onChange={(event) => setData('notes', event.target.value)}
                            maxLength={1000}
                            rows={3}
                        />
                        {errors.notes && <p className="text-xs text-red-600">{errors.notes}</p>}
                    </div>

                    {disbursementError && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{disbursementError}</p>}

                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || locations.length === 0} className="w-full sm:w-auto">
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Banknote className="mr-2 h-4 w-4" />}
                            Save draft
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
