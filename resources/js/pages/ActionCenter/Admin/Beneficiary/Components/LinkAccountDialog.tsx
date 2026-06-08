import LinkBeneficiaryAccountController from '@/actions/App/External/Api/Controllers/ActionCenter/Beneficiary/LinkBeneficiaryAccountController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { AlertCircle, Link2, Loader2, ShieldCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    beneficiaryId: string;
    beneficiaryName: string;
    /** The currently-linked account email, or null for a walk-in. Drives link-vs-change mode. */
    currentEmail: string | null;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Admin "link / change a beneficiary's portal account" modal.
 *
 * Posts to the same endpoint in both modes; the backend decides link vs. change
 * from the row's current user_id and enforces every rule (account resolved by
 * email within the tenant, one-account-one-beneficiary, reason-required-on-
 * change, full audit). The tenant is carried by the X-Municipality-Slug header
 * because the API route has no {municipality} segment — same pattern as Approve.
 *
 * Domain errors (no such account, already linked to another record, etc.) come
 * back under the `account` key and are surfaced in a banner; field-level
 * validation errors render under their inputs.
 */
export default function LinkAccountDialog({ beneficiaryId, beneficiaryName, currentEmail, isOpen, onClose }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const isChange = Boolean(currentEmail);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        account_email: '',
        reason: '',
    });

    // `account` is not a form field — it's the domain-error key from the
    // controller's withErrors(['account' => ...]). Read it loosely.
    const serverError = (errors as Record<string, string | undefined>).account;

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(LinkBeneficiaryAccountController.url({ beneficiaryId }), {
            headers: {
                'x-Municipality-Slug': currentMunicipality.slug,
            },
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
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="flex flex-col gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 ring-4 ring-blue-50">
                        <Link2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <DialogTitle className="text-xl text-slate-900">
                        {isChange ? 'Change linked account' : 'Link a portal account'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">
                        {isChange
                            ? `Re-point ${beneficiaryName}'s record to a different portal account. This change is logged.`
                            : `Connect ${beneficiaryName} to the online account they registered with — keeps one lifelong record instead of a duplicate.`}
                    </DialogDescription>
                </DialogHeader>

                {/* Current link (change mode only) */}
                {isChange && (
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                        <span className="text-slate-400">Currently linked to </span>
                        <span className="font-medium break-all text-slate-700">{currentEmail}</span>
                    </div>
                )}

                {/* ID-verification reminder — the human control this whole feature leans on */}
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Confirm this account belongs to the person in front of you against their uploaded government ID before linking.</span>
                </div>

                {/* Domain error banner (no such account / duplicate conflict / reason required) */}
                {serverError && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{serverError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 pt-1">
                    <div className="space-y-2">
                        <Label htmlFor="account_email" className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            Account email
                        </Label>
                        <Input
                            id="account_email"
                            type="email"
                            autoFocus
                            placeholder="name@example.com"
                            value={data.account_email}
                            onChange={(e) => setData('account_email', e.target.value)}
                        />
                        {errors.account_email && <p className="text-xs font-medium text-red-500">{errors.account_email}</p>}
                        <p className="text-[11px] text-slate-400">The email the applicant used to register their portal account.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            Reason {isChange ? <span className="text-red-500">*</span> : <span className="text-slate-400">(optional)</span>}
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder={
                                isChange
                                    ? 'Why is this record being moved to a different account? (required)'
                                    : 'Optional note for the record…'
                            }
                            className="resize-none"
                            rows={3}
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                        />
                        {errors.reason && <p className="text-xs font-medium text-red-500">{errors.reason}</p>}
                    </div>

                    <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            className="text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 text-white hover:bg-blue-700">
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                            {isChange ? 'Change account' : 'Link account'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
