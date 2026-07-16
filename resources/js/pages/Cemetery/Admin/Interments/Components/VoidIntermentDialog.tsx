import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VoidIntermentForm } from '@/Core/Types/Cemetery/cemetery';
import { useForm } from '@inertiajs/react';
import { Loader2, XCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Props {
    voidUrl: string;
    municipalitySlug: string;
    label?: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    asDropdownItem?: boolean;
}

export function VoidIntermentDialog({
    voidUrl,
    municipalitySlug,
    label = 'Void Interment',
    size = 'default',
    className,
    asDropdownItem,
    open: externalOpen,
    onOpenChange: setExternalOpen,
}: Props & { open?: boolean; onOpenChange?: (open: boolean) => void }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = setExternalOpen ?? setInternalOpen;
    const form = useForm<VoidIntermentForm>({
        reason: '',
    });

    const close = () => {
        if (form.processing) return;
        setOpen(false);
        form.clearErrors();
        form.setData('reason', '');
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(voidUrl, {
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
                        <XCircle size={14} className="mr-2" />
                        {label}
                    </DropdownMenuItem>
                ) : (
                    <Button type="button" variant="outline" size={size} className={className} onClick={() => setOpen(true)}>
                        <XCircle size={16} className="mr-2" />
                        {label}
                    </Button>
                )
            )}

            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Void Wrong Interment?</DialogTitle>
                        <DialogDescription>
                            Use this only when the interment was an encoding mistake, such as selecting the wrong Decedent. This keeps the
                            history, frees the plot if applicable, and lets staff create the correct interment through the normal flow.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-5 space-y-2">
                        <Label htmlFor="void-reason">Reason</Label>
                        <Textarea
                            id="void-reason"
                            value={form.data.reason}
                            onChange={(event) => form.setData('reason', event.target.value)}
                            placeholder="Example: Wrong Decedent was selected during interment encoding."
                            className="min-h-28"
                        />
                        {form.errors.reason && <p className="text-sm text-red-600">{form.errors.reason}</p>}
                        {form.errors.interment && <p className="text-sm text-red-600">{form.errors.interment}</p>}
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={close} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="destructive" disabled={form.processing || form.data.reason.trim().length === 0}>
                            {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Void Interment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
