import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CemeterySiteListItem, ChangePlotStatusForm, PlotProfile as PlotProfileType, PlotStatusOption } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm } from '@inertiajs/react';
import { Loader2, Settings2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

export function ChangeStatusDialog({
    municipality,
    site,
    plot,
    statusOptions,
}: {
    municipality: MunicipalityType;
    site: CemeterySiteListItem;
    plot: PlotProfileType;
    statusOptions: PlotStatusOption[];
}) {
    const [open, setOpen] = useState(false);
    const form = useForm<ChangePlotStatusForm>({
        status: plot.status === 'maintenance' ? 'maintenance' : 'available',
        reason: '',
    });

    const close = () => {
        if (form.processing) return;
        setOpen(false);
        form.clearErrors();
        form.setData({
            status: plot.status === 'maintenance' ? 'maintenance' : 'available',
            reason: '',
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(`/api/cemetery-sites/${site.id}/plots/${plot.id}/status`, {
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : close())}>
            <Button type="button" variant="outline" onClick={() => setOpen(true)} className="w-full justify-start text-left font-normal">
                <Settings2 size={16} className="mr-2" />
                Change Status
            </Button>
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Change Plot Status</DialogTitle>
                        <DialogDescription>Only empty plots can be manually marked available or under maintenance.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-5 grid gap-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={form.data.status} onValueChange={(value) => form.setData('status', value as 'available' | 'maintenance')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.status && <p className="text-sm text-red-600">{form.errors.status}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status-reason">Reason</Label>
                            <Textarea
                                id="status-reason"
                                value={form.data.reason}
                                onChange={(event) => form.setData('reason', event.target.value)}
                                placeholder="Explain why the plot status is being changed."
                                className="min-h-24"
                            />
                            {form.errors.reason && <p className="text-sm text-red-600">{form.errors.reason}</p>}
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={close} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Status
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
