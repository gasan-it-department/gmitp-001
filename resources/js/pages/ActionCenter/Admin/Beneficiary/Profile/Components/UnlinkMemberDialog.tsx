import UnlinkHouseholdMemberBeneficiaryController from '@/actions/App/External/Api/Controllers/ActionCenter/Household/UnlinkHouseholdMemberBeneficiaryController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { AlertCircle, Loader2, Unlink } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
    memberId: string;
    memberName: string;
}

export default function UnlinkMemberDialog({ open, onClose, memberId, memberName }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({ reason: '' });
    const serverError = (errors as Record<string, string | undefined>).member;

    const handleClose = () => {
        clearErrors();
        reset();
        onClose();
    };

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();
        post(UnlinkHouseholdMemberBeneficiaryController.url({ memberId }), {
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            preserveScroll: true,
            onSuccess: handleClose,
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Unlink beneficiary profile</DialogTitle>
                    <DialogDescription>
                        Remove the beneficiary-profile link from <span className="font-medium text-slate-700 capitalize">{memberName}</span>. The
                        household member and beneficiary records will remain active.
                    </DialogDescription>
                </DialogHeader>

                {serverError && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{serverError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="unlink-reason">Reason</Label>
                        <Textarea
                            id="unlink-reason"
                            value={data.reason}
                            onChange={(event) => setData('reason', event.target.value)}
                            placeholder="Explain how the incorrect link was confirmed."
                            rows={4}
                            autoFocus
                        />
                        {errors.reason && <p className="text-xs font-medium text-red-500">{errors.reason}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="destructive" disabled={processing}>
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlink className="mr-2 h-4 w-4" />}
                            Unlink profile
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
