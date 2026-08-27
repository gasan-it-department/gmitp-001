import CorrectMissingBurialDateOfDeathController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/CorrectMissingBurialDateOfDeathController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { CalendarPlus, Loader2 } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    requestId: string;
    transactionNumber: string;
    isOpen: boolean;
    onClose: () => void;
}

function todayDateInputValue(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * One-time repair dialog for legacy approved burial requests.
 *
 * This intentionally posts a dedicated action instead of reusing the normal
 * request editor. The backend will reject any request that is not approved and
 * unreleased, configured for a deceased subject, and still missing the date.
 */
export default function CorrectMissingBurialDateOfDeathDialog({ requestId, transactionNumber, isOpen, onClose }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        date_of_death: '',
        reason: '',
    });
    const fieldErrors = errors as Record<string, string | undefined>;

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();

        post(CorrectMissingBurialDateOfDeathController.url({ assistanceRequestId: requestId }), {
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleClose = () => {
        clearErrors();
        reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader className="flex flex-col gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 ring-4 ring-amber-50">
                        <CalendarPlus className="h-6 w-6 text-amber-700" />
                    </div>
                    <DialogTitle className="text-xl text-slate-900">Add Date of Death</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        This is a one-time correction for an approved, unreleased burial request that is still missing the deceased person&apos;s Date
                        of Death. It cannot replace an existing date or edit any other request information.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-2 sm:space-y-6 sm:pt-4">
                    <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3">
                        <p className="text-[10px] font-bold tracking-widest text-amber-800 uppercase">Legacy Burial Request</p>
                        <p className="mt-1 font-mono text-sm font-semibold break-all text-amber-950">{transactionNumber}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="correct_date_of_death" className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            Date of Death
                        </Label>
                        <Input
                            id="correct_date_of_death"
                            type="date"
                            max={todayDateInputValue()}
                            value={data.date_of_death}
                            onChange={(event) => setData('date_of_death', event.target.value)}
                        />
                        {fieldErrors.date_of_death && <p className="text-xs font-medium text-red-600">{fieldErrors.date_of_death}</p>}
                        <p className="text-[11px] leading-4 text-slate-500">
                            The date must be on or before the request submission date. It will be checked against the frozen assisted-person record.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="missing_date_correction_reason" className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            Correction Reason / Source Document
                        </Label>
                        <Textarea
                            id="missing_date_correction_reason"
                            value={data.reason}
                            onChange={(event) => setData('reason', event.target.value)}
                            placeholder="e.g. Verified from the Death Certificate submitted to MSWDO."
                            rows={4}
                            className="resize-none"
                        />
                        {fieldErrors.reason && <p className="text-xs font-medium text-red-600">{fieldErrors.reason}</p>}
                        <p className="text-[11px] leading-4 text-slate-500">
                            State where the date was verified. The source/reason, old blank value, new date, and your account will be recorded in
                            Audit Trails.
                        </p>
                    </div>

                    {fieldErrors.correct_missing_date_of_death && (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                            {fieldErrors.correct_missing_date_of_death}
                        </p>
                    )}

                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
                        Previously printed intake, eligibility, Obligation Request, or Disbursement Voucher documents may need to be regenerated after
                        this correction. The generated files are stateless and are not changed automatically.
                    </div>

                    <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="ghost" onClick={handleClose} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="w-full bg-amber-700 text-white hover:bg-amber-800 sm:w-auto">
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarPlus className="mr-2 h-4 w-4" />}
                            Add Date of Death
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
