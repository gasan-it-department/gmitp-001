import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CloseIntermentForm } from '@/Core/Types/Cemetery/cemetery';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, Archive, Loader2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Props {
    closeUrl: string;
    municipalitySlug: string;
    label?: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    asDropdownItem?: boolean;
}

const today = () => new Date().toISOString().slice(0, 10);

export function CloseIntermentDialog({
    closeUrl,
    municipalitySlug,
    label = 'Close Interment',
    size = 'default',
    className,
    asDropdownItem,
    open: externalOpen,
    onOpenChange: setExternalOpen,
}: Props & { open?: boolean; onOpenChange?: (open: boolean) => void }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = setExternalOpen ?? setInternalOpen;
    const form = useForm<CloseIntermentForm>({
        end_type: 'exhumed',
        ended_date: today(),
        reason: '',
        notes: '',
        permit_reference: '',
        transfer_destination: '',
    });

    const close = () => {
        if (form.processing) return;
        setOpen(false);
        form.clearErrors();
        form.setData({
            end_type: 'exhumed',
            ended_date: today(),
            reason: '',
            notes: '',
            permit_reference: '',
            transfer_destination: '',
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(closeUrl, {
            headers: { 'X-Municipality-Slug': municipalitySlug },
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : close())}>
            {externalOpen === undefined && (
                asDropdownItem ? (
                    <DropdownMenuItem
                        onSelect={(event) => {
                            event.preventDefault();
                            setOpen(true);
                        }}
                        className={className}
                    >
                        <Archive size={14} className="mr-2" />
                        {label}
                    </DropdownMenuItem>
                ) : (
                    <Button type="button" variant="outline" size={size} className={className} onClick={() => setOpen(true)}>
                        <Archive size={16} className="mr-2" />
                        {label}
                    </Button>
                )
            )}

            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Exhume or Transfer Out?</DialogTitle>
                        <DialogDescription>
                            This ends the active interment without assigning a new plot. The Decedent history and Plot history will keep the record.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-5 grid gap-4">
                        <div className="space-y-2">
                            <Label>Outcome</Label>
                            <Select
                                value={form.data.end_type}
                                onValueChange={(value) => form.setData('end_type', value as CloseIntermentForm['end_type'])}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="exhumed">Exhumed</SelectItem>
                                    <SelectItem value="transferred_out">Transferred Out</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.errors.end_type && <p className="text-sm text-red-600">{form.errors.end_type}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ended-date">Date</Label>
                            <Input
                                id="ended-date"
                                type="date"
                                value={form.data.ended_date}
                                onChange={(event) => form.setData('ended_date', event.target.value)}
                            />
                            {form.errors.ended_date && <p className="text-sm text-red-600">{form.errors.ended_date}</p>}
                        </div>

                        {form.data.end_type === 'transferred_out' && (
                            <div className="space-y-2">
                                <Label htmlFor="transfer-destination">Transfer destination</Label>
                                <Input
                                    id="transfer-destination"
                                    value={form.data.transfer_destination}
                                    onChange={(event) => form.setData('transfer_destination', event.target.value)}
                                    placeholder="e.g. BOAC MUNICIPAL CEMETERY or MANILA NORTH CEMETERY"
                                />
                                {form.errors.transfer_destination && <p className="text-sm text-red-600">{form.errors.transfer_destination}</p>}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="permit-reference">Permit / reference number</Label>
                            <Input
                                id="permit-reference"
                                value={form.data.permit_reference}
                                onChange={(event) => form.setData('permit_reference', event.target.value)}
                                placeholder="Optional permit or document reference"
                            />
                            {form.errors.permit_reference && <p className="text-sm text-red-600">{form.errors.permit_reference}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="close-reason">Reason</Label>
                            <Textarea
                                id="close-reason"
                                value={form.data.reason}
                                onChange={(event) => form.setData('reason', event.target.value)}
                                placeholder="Explain why this interment is being closed."
                                className="min-h-24"
                            />
                            {form.errors.reason && <p className="text-sm text-red-600">{form.errors.reason}</p>}
                            {form.errors.interment && <p className="text-sm text-red-600">{form.errors.interment}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="close-notes">Notes</Label>
                            <Textarea
                                id="close-notes"
                                value={form.data.notes}
                                onChange={(event) => form.setData('notes', event.target.value)}
                                placeholder="Optional operational notes."
                                className="min-h-20"
                            />
                            {form.errors.notes && <p className="text-sm text-red-600">{form.errors.notes}</p>}
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={close} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="destructive" disabled={form.processing || form.data.reason.trim().length === 0}>
                            {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Close Interment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
