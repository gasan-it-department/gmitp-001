import ApplyAssistanceRequestProfileCorrectionsController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/ApplyAssistanceRequestProfileCorrectionsController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

export interface ProfileCorrectionDifference {
    key: string;
    label: string;
    request_value: string | null;
    profile_value: string | null;
}

interface Props {
    requestId: string;
    transactionNumber: string;
    differences: ProfileCorrectionDifference[];
    reopensVerification: boolean;
    isApproved: boolean;
    isOpen: boolean;
    onClose: () => void;
}

export default function ApplyAssistanceRequestProfileCorrectionsDialog({
    requestId,
    transactionNumber,
    differences,
    reopensVerification,
    isApproved,
    isOpen,
    onClose,
}: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{ fields: string[]; reason: string }>({
        fields: [],
        reason: '',
    });
    const fieldErrors = errors as Record<string, string | undefined>;

    useEffect(() => {
        if (isOpen) {
            setData(
                'fields',
                differences.map((difference) => difference.key),
            );
        }
    }, [differences, isOpen, setData]);

    const toggleField = (key: string, checked: boolean) => {
        setData('fields', checked ? [...data.fields, key] : data.fields.filter((field) => field !== key));
    };

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();

        post(ApplyAssistanceRequestProfileCorrectionsController.url({ assistanceRequestId: requestId }), {
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
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader className="space-y-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
                        <RefreshCw className="h-5 w-5 text-amber-700" />
                    </div>
                    <DialogTitle>Apply profile corrections</DialogTitle>
                    <DialogDescription>
                        Select verified beneficiary-profile changes that should correct this request&apos;s frozen claimant snapshot.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="font-mono text-xs font-semibold text-slate-600">{transactionNumber}</p>
                        <div className="mt-3 space-y-2">
                            {differences.map((difference) => (
                                <label
                                    key={difference.key}
                                    className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-white p-3"
                                >
                                    <Checkbox
                                        className="mt-0.5"
                                        checked={data.fields.includes(difference.key)}
                                        onCheckedChange={(value) => toggleField(difference.key, value === true)}
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-xs font-semibold text-slate-700">{difference.label}</span>
                                        <span className="mt-1 flex min-w-0 items-center gap-2 text-xs">
                                            <span className="min-w-0 break-words text-rose-700">{difference.request_value ?? 'Not recorded'}</span>
                                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                            <span className="min-w-0 font-semibold break-words text-emerald-700">
                                                {difference.profile_value ?? 'Not recorded'}
                                            </span>
                                        </span>
                                    </span>
                                </label>
                            ))}
                        </div>
                        {(fieldErrors.fields || fieldErrors['fields.0']) && (
                            <p className="mt-2 text-xs font-medium text-red-600">{fieldErrors.fields ?? fieldErrors['fields.0']}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profile_correction_reason">Correction reason</Label>
                        <Textarea
                            id="profile_correction_reason"
                            value={data.reason}
                            onChange={(event) => setData('reason', event.target.value)}
                            placeholder="Example: Corrected the birth date after checking the beneficiary's valid ID."
                            rows={4}
                            className="resize-none"
                        />
                        {fieldErrors.reason && <p className="text-xs font-medium text-red-600">{fieldErrors.reason}</p>}
                    </div>

                    {fieldErrors.profile_correction && (
                        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{fieldErrors.profile_correction}</p>
                    )}

                    <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                        {reopensVerification
                            ? 'Completed MSWD verification will return to Under Review. Confirm the corrected identity and complete verification again before generating final documents or release.'
                            : isApproved
                              ? 'The approved amount and request status will remain unchanged. Regenerate affected documents after this correction.'
                              : 'The request will keep its current status. Newly generated documents will use the selected corrections.'}
                    </p>

                    <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="ghost" onClick={handleClose} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || data.fields.length === 0} className="w-full sm:w-auto">
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Apply selected corrections
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
