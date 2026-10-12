import UpdateHouseholdAddressController from '@/actions/App/External/Api/Controllers/ActionCenter/Household/UpdateHouseholdAddressController';
import { BarangaySelect } from '@/components/Shared/BarangaySelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import type { FormEvent } from 'react';

interface Props {
    household: {
        id: string;
        barangay: string | null;
        barangay_psgc_code: string | null;
        street: string | null;
        address_fingerprint: string;
    };
    onClose: () => void;
}

export default function EditHouseholdAddressDialog({ household, onClose }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, put, processing, errors } = useForm({
        barangay_code: household.barangay_psgc_code ?? '',
        street: household.street ?? '',
        reason: '',
        expected_fingerprint: household.address_fingerprint,
    });
    const addressError = (errors as Record<string, string | undefined>).household_address;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        put(UpdateHouseholdAddressController.url({ householdId: household.id }), {
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <Dialog open onOpenChange={(open) => !open && !processing && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit household address</DialogTitle>
                    <DialogDescription>
                        This address is shared by all members of this household. Addresses already saved on requests remain unchanged.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-5">
                    <p className="text-sm break-words text-slate-600">
                        <span className="font-medium">Current address: </span>
                        {[household.street, household.barangay].filter(Boolean).join(', ') || 'Not recorded'}
                    </p>
                    <BarangaySelect
                        municipalityId={currentMunicipality.psgc_municipal_id}
                        value={data.barangay_code}
                        onChange={({ psgc_code }) => setData('barangay_code', psgc_code)}
                        disabled={processing}
                        error={errors.barangay_code}
                        required
                    />
                    <div className="space-y-2">
                        <Label htmlFor="household-address-street">Street / Purok / Sitio</Label>
                        <Input
                            id="household-address-street"
                            value={data.street}
                            onChange={(event) => setData('street', event.target.value)}
                            maxLength={255}
                            disabled={processing}
                        />
                        {errors.street && <p className="text-sm text-red-600">{errors.street}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="household-address-reason">Correction reason</Label>
                        <Textarea
                            id="household-address-reason"
                            value={data.reason}
                            onChange={(event) => setData('reason', event.target.value)}
                            minLength={5}
                            maxLength={500}
                            required
                            disabled={processing}
                        />
                        {errors.reason && <p className="text-sm text-red-600">{errors.reason}</p>}
                    </div>
                    {(addressError || errors.expected_fingerprint) && (
                        <p role="alert" className="text-sm text-red-600">
                            {addressError || errors.expected_fingerprint}
                        </p>
                    )}
                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || !data.barangay_code || data.reason.trim().length < 5}>
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save address
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
