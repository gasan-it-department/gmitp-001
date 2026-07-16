import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CemeterySiteListItem, PlotProfile as PlotProfileType, UpdatePlotLeaseForm } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm } from '@inertiajs/react';
import { Edit3, Loader2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toNumberOrBlank } from '../Helpers';

export function PlotLeaseDialog({ municipality, site, plot }: { municipality: MunicipalityType; site: CemeterySiteListItem; plot: PlotProfileType }) {
    const [open, setOpen] = useState(false);
    const lease = plot.active_lease;
    const mode = lease ? 'edit' : 'create';
    const form = useForm<UpdatePlotLeaseForm>({
        leaseholder_name: lease?.leaseholder_name ?? '',
        leaseholder_contact: lease?.leaseholder_contact ?? '',
        leaseholder_address: lease?.leaseholder_address ?? '',
        leaseholder_relationship: lease?.leaseholder_relationship ?? '',
        lease_start: lease?.lease_start ?? '',
        lease_end: lease?.lease_end ?? '',
        amount_paid: toNumberOrBlank(lease?.amount_paid),
        or_number: lease?.or_number ?? '',
        notes: lease?.notes ?? '',
    });

    const close = () => {
        if (form.processing) return;
        setOpen(false);
        form.clearErrors();
        form.setData({
            leaseholder_name: lease?.leaseholder_name ?? '',
            leaseholder_contact: lease?.leaseholder_contact ?? '',
            leaseholder_address: lease?.leaseholder_address ?? '',
            leaseholder_relationship: lease?.leaseholder_relationship ?? '',
            lease_start: lease?.lease_start ?? '',
            lease_end: lease?.lease_end ?? '',
            amount_paid: toNumberOrBlank(lease?.amount_paid),
            or_number: lease?.or_number ?? '',
            notes: lease?.notes ?? '',
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const options = {
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        };

        if (mode === 'create') {
            form.post(`/api/cemetery-sites/${site.id}/plots/${plot.id}/lease`, options);

            return;
        }

        form.patch(`/api/cemetery-sites/${site.id}/plots/${plot.id}/lease`, options);
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : close())}>
            <Button type="button" variant="secondary" onClick={() => setOpen(true)} size="sm">
                <Edit3 size={14} className="mr-2" />
                {mode === 'create' ? 'Add Lease' : 'Edit Lease'}
            </Button>
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>{mode === 'create' ? 'Add Active Lease' : 'Edit Active Lease'}</DialogTitle>
                        <DialogDescription>
                            {mode === 'create'
                                ? 'Record the responsible person and manual payment details for this physical plot.'
                                : 'Update the responsible person and manual payment details for this physical plot.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="leaseholder-name">Leaseholder name</Label>
                            <Input
                                id="leaseholder-name"
                                value={form.data.leaseholder_name}
                                onChange={(event) => form.setData('leaseholder_name', event.target.value)}
                                placeholder="e.g. JUAN DELA CRUZ"
                            />
                            {form.errors.leaseholder_name && <p className="text-sm text-red-600">{form.errors.leaseholder_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="leaseholder-relationship">Relationship</Label>
                            <Input
                                id="leaseholder-relationship"
                                value={form.data.leaseholder_relationship}
                                onChange={(event) => form.setData('leaseholder_relationship', event.target.value)}
                                placeholder="e.g. SPOUSE, CHILD"
                            />
                            {form.errors.leaseholder_relationship && <p className="text-sm text-red-600">{form.errors.leaseholder_relationship}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="leaseholder-contact">Contact</Label>
                            <Input
                                id="leaseholder-contact"
                                value={form.data.leaseholder_contact}
                                onChange={(event) => form.setData('leaseholder_contact', event.target.value)}
                                placeholder="Optional"
                            />
                            {form.errors.leaseholder_contact && <p className="text-sm text-red-600">{form.errors.leaseholder_contact}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="leaseholder-address">Address</Label>
                            <Input
                                id="leaseholder-address"
                                value={form.data.leaseholder_address}
                                onChange={(event) => form.setData('leaseholder_address', event.target.value)}
                                placeholder="Optional"
                            />
                            {form.errors.leaseholder_address && <p className="text-sm text-red-600">{form.errors.leaseholder_address}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lease-start">Lease start</Label>
                            <Input
                                id="lease-start"
                                type="date"
                                value={form.data.lease_start}
                                onChange={(event) => form.setData('lease_start', event.target.value)}
                            />
                            {form.errors.lease_start && <p className="text-sm text-red-600">{form.errors.lease_start}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lease-end">Lease end</Label>
                            <Input
                                id="lease-end"
                                type="date"
                                value={form.data.lease_end}
                                onChange={(event) => form.setData('lease_end', event.target.value)}
                            />
                            {form.errors.lease_end && <p className="text-sm text-red-600">{form.errors.lease_end}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount-paid">Amount paid</Label>
                            <Input
                                id="amount-paid"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.data.amount_paid}
                                onChange={(event) => form.setData('amount_paid', event.target.value === '' ? '' : Number(event.target.value))}
                                placeholder="Optional"
                            />
                            {form.errors.amount_paid && <p className="text-sm text-red-600">{form.errors.amount_paid}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="or-number">OR number</Label>
                            <Input
                                id="or-number"
                                value={form.data.or_number}
                                onChange={(event) => form.setData('or_number', event.target.value)}
                                placeholder="Optional"
                            />
                            {form.errors.or_number && <p className="text-sm text-red-600">{form.errors.or_number}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="lease-notes">Notes</Label>
                            <Textarea
                                id="lease-notes"
                                value={form.data.notes}
                                onChange={(event) => form.setData('notes', event.target.value)}
                                placeholder="Optional lease or payment notes."
                                className="min-h-24"
                            />
                            {form.errors.notes && <p className="text-sm text-red-600">{form.errors.notes}</p>}
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={close} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === 'create' ? 'Add Lease' : 'Save Lease'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
