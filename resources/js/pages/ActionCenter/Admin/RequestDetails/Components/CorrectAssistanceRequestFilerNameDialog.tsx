import CorrectAssistanceRequestFilerNameController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/CorrectAssistanceRequestFilerNameController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { Loader2, UserRoundCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    requestId: string;
    transactionNumber: string;
    frozenName: string;
    currentProfileName: string;
    isApproved: boolean;
    isOpen: boolean;
    onClose: () => void;
}

export default function CorrectAssistanceRequestFilerNameDialog({
    requestId,
    transactionNumber,
    frozenName,
    currentProfileName,
    isApproved,
    isOpen,
    onClose,
}: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({ reason: '' });
    const fieldErrors = errors as Record<string, string | undefined>;

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();

        post(CorrectAssistanceRequestFilerNameController.url({ assistanceRequestId: requestId }), {
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
                <DialogHeader className="space-y-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
                        <UserRoundCheck className="h-5 w-5 text-amber-700" />
                    </div>
                    <DialogTitle>Apply corrected filer name</DialogTitle>
                    <DialogDescription>
                        Replace only the frozen filer name using the current verified beneficiary profile. No other request or profile information
                        will change.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="font-mono text-xs font-semibold text-slate-600">{transactionNumber}</p>
                        <dl className="mt-3 space-y-3 text-sm">
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Frozen request name</dt>
                                <dd className="mt-0.5 font-semibold text-rose-700">{frozenName}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Verified profile name</dt>
                                <dd className="mt-0.5 font-semibold text-emerald-700">{currentProfileName}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="filer_name_correction_reason">Correction reason</Label>
                        <Textarea
                            id="filer_name_correction_reason"
                            value={data.reason}
                            onChange={(event) => setData('reason', event.target.value)}
                            placeholder="Example: Corrected spelling after verifying the beneficiary's valid ID."
                            rows={4}
                            className="resize-none"
                        />
                        {fieldErrors.reason && <p className="text-xs font-medium text-red-600">{fieldErrors.reason}</p>}
                    </div>

                    {fieldErrors.correct_filer_name && (
                        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{fieldErrors.correct_filer_name}</p>
                    )}

                    <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                        {isApproved
                            ? 'The approved amount will remain unchanged. Regenerate any previously printed case documents after applying this correction.'
                            : 'The request will keep its current status. Future case documents will use the corrected frozen name.'}
                    </p>

                    <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="ghost" onClick={handleClose} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserRoundCheck className="mr-2 h-4 w-4" />}
                            Apply corrected name
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
