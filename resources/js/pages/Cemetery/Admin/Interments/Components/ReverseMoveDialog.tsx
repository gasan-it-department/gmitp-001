import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReverseMovedIntermentForm } from '@/Core/Types/Cemetery/cemetery';
import { useForm } from '@inertiajs/react';
import { Loader2, RotateCcw } from 'lucide-react';
import { FormEvent, useState } from 'react';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface Props {
    reverseUrl: string;
    municipalitySlug: string;
    label?: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    asDropdownItem?: boolean;
}

export function ReverseMoveDialog({
    reverseUrl,
    municipalitySlug,
    label = 'Reverse Move',
    size = 'default',
    className,
    asDropdownItem,
    open: externalOpen,
    onOpenChange: setExternalOpen,
}: Props & { open?: boolean; onOpenChange?: (open: boolean) => void }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = setExternalOpen ?? setInternalOpen;
    const form = useForm<ReverseMovedIntermentForm>({
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
        form.patch(reverseUrl, {
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
                        onSelect={(e) => {
                            e.preventDefault();
                            setOpen(true);
                        }}
                        className={className}
                    >
                        <RotateCcw size={14} className="mr-2" />
                        {label}
                    </DropdownMenuItem>
                ) : (
                    <Button type="button" variant="outline" size={size} className={className} onClick={() => setOpen(true)}>
                        <RotateCcw size={16} className="mr-2" />
                        {label}
                    </Button>
                )
            )}
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Reverse Mistaken Move?</DialogTitle>
                        <DialogDescription>
                            This voids the current transfer interment and restores the previous plot if it can still accept the remains.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-5 space-y-2">
                        <Label htmlFor="reverse-reason">Reason</Label>
                        <Textarea
                            id="reverse-reason"
                            value={form.data.reason}
                            onChange={(event) => form.setData('reason', event.target.value)}
                            placeholder="Explain why this move is being reversed."
                            className="min-h-28"
                        />
                        {form.errors.reason && <p className="text-sm text-red-600">{form.errors.reason}</p>}
                        {form.errors.interment && <p className="text-sm text-red-600">{form.errors.interment}</p>}
                    </div>
                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={close} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing || form.data.reason.trim().length === 0}>
                            {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reverse Move
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
