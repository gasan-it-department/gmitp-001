import LinkHouseholdMemberToBeneficiaryController from '@/actions/App/External/Api/Controllers/ActionCenter/Household/LinkHouseholdMemberToBeneficiaryController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { AlertCircle, Link2, Loader2, ShieldCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
    memberId: string;
    memberName: string;
}

/**
 * "Link, don't duplicate" — reconcile this roster row to an already-registered
 * beneficiary by their number (e.g. GAS-000123). The backend resolves + tenant-
 * guards the target and leaves that person's own household untouched.
 *
 * Tenant rides on the X-Municipality-Slug header (the API route has no
 * {municipality} segment) — same pattern as the link-account modal.
 */
export default function LinkMemberDialog({ open, onClose, memberId, memberName }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        beneficiary_number: '',
    });

    const serverError = (errors as Record<string, string | undefined>).member;

    const handleClose = () => {
        clearErrors();
        reset();
        onClose();
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(LinkHouseholdMemberToBeneficiaryController.url({ memberId }), {
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="flex flex-col gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 ring-4 ring-indigo-50">
                        <Link2 className="h-6 w-6 text-indigo-600" />
                    </div>
                    <DialogTitle className="text-xl text-slate-900">Link to an existing record</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        If <span className="font-medium text-slate-700 capitalize">{memberName}</span> is already a registered
                        beneficiary, link this roster entry to their record instead of creating a duplicate. Their own household is
                        not affected.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Confirm the record belongs to this same person against their government ID before linking.</span>
                </div>

                {serverError && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{serverError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 pt-1">
                    <div className="space-y-2">
                        <Label htmlFor="beneficiary_number" className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            Beneficiary number
                        </Label>
                        <Input
                            id="beneficiary_number"
                            autoFocus
                            placeholder="e.g. GAS-000123"
                            className="font-mono"
                            value={data.beneficiary_number}
                            onChange={(e) => setData('beneficiary_number', e.target.value)}
                        />
                        {errors.beneficiary_number && <p className="text-xs font-medium text-red-500">{errors.beneficiary_number}</p>}
                        <p className="text-[11px] text-slate-400">Find it on the other person’s profile or search result.</p>
                    </div>

                    <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="ghost" onClick={handleClose} className="text-slate-500 hover:bg-slate-100">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-indigo-600 text-white hover:bg-indigo-700">
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                            Link record
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
