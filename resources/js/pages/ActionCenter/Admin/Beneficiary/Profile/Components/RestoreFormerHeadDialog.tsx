import SetHouseholdMemberActiveController from '@/actions/App/External/Api/Controllers/ActionCenter/Household/SetHouseholdMemberActiveController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';
import { ShadcnSelectField } from '../../../../Client/Apply/Beneficiary/Components/ShadcnSelectField';
import type { HouseholdMemberRow } from './HouseholdMembersTable';
import type { RelationshipOption } from './MemberFormDialog';

interface Props {
    open: boolean;
    onClose: () => void;
    member: HouseholdMemberRow;
    relationships: RelationshipOption[];
}

export default function RestoreFormerHeadDialog({ open, onClose, member, relationships }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        is_active: true,
        relationship: '',
    });

    useEffect(() => {
        if (open) {
            reset();
            clearErrors();
        }
    }, [clearErrors, open, reset]);

    const handleClose = () => {
        clearErrors();
        reset();
        onClose();
    };

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();
        post(SetHouseholdMemberActiveController.url({ memberId: member.id }), {
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            preserveScroll: true,
            onSuccess: handleClose,
        });
    };

    const serverError = (errors as Record<string, string | undefined>).member;
    const options = relationships.filter((relationship) => relationship.value !== 'head');

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Move former head back in</DialogTitle>
                    <DialogDescription>
                        {member.first_name} {member.last_name} was previously the household head. Choose their relationship to the current head before
                        restoring them as an active member.
                    </DialogDescription>
                </DialogHeader>

                {serverError && (
                    <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{serverError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <ShadcnSelectField
                        id="restore-former-head-relationship"
                        label="Relationship to current head"
                        value={data.relationship}
                        onValueChange={(value) => setData('relationship', value)}
                        options={options}
                        placeholder="Choose relationship"
                        error={errors.relationship}
                        required
                        contentClassName="max-h-64"
                    />

                    <p className="text-xs text-slate-500">
                        The beneficiary profile will become active again. The restored household relationship will require dependent verification.
                    </p>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || data.relationship === ''}>
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                            Move back in
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
