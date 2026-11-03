import ReopenCancelledAssistanceRequestController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/ReopenCancelledAssistanceRequestController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';

export default function ReopenCancelledRequestDialog({
    id,
    slug,
    token,
    blocker,
    amount,
    cancelledAt,
    open,
    onClose,
}: {
    id: string;
    slug: string;
    token: string;
    blocker: string | null;
    amount: number | null;
    cancelledAt: string | null;
    open: boolean;
    onClose: () => void;
}) {
    const form = useForm({
        reason: '',
        context_token: token,
        operation_key: crypto.randomUUID(),
        confirm_not_released: false as boolean,
        confirm_papers_invalid: false as boolean,
    });
    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!value && !form.processing) onClose();
            }}
        >
            <DialogContent
                className="max-h-[90dvh] overflow-y-auto"
                onEscapeKeyDown={(e) => {
                    if (form.processing) e.preventDefault();
                }}
                onInteractOutside={(e) => {
                    if (form.processing) e.preventDefault();
                }}
            >
                <DialogHeader>
                    <DialogTitle>Reopen for Review</DialogTitle>
                </DialogHeader>
                <p className="text-sm">
                    The request returns to Pending. A fresh amount and approval are required; old claim notices and financial papers remain invalid.
                </p>
                <p className="text-sm">Previous amount: PHP {Number(amount ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                {cancelledAt && <p className="text-xs text-muted-foreground">Cancelled {new Date(cancelledAt).toLocaleString()}</p>}
                {blocker && (
                    <p role="alert" className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        {blocker}
                    </p>
                )}
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(ReopenCancelledAssistanceRequestController.url({ assistanceRequestId: id }), {
                            headers: { 'X-Municipality-Slug': slug },
                            preserveScroll: true,
                            onSuccess: onClose,
                        });
                    }}
                >
                    {Object.values(form.errors).map((error, index) => (
                        <p key={index} role="alert" className="text-sm text-red-700">
                            {error}
                        </p>
                    ))}
                    <Label htmlFor="reopen-reason">Recovery reason</Label>
                    <Textarea
                        id="reopen-reason"
                        required
                        minLength={10}
                        maxLength={1000}
                        value={form.data.reason}
                        onChange={(e) => form.setData('reason', e.target.value)}
                    />
                    <label className="flex items-start gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.data.confirm_not_released}
                            onChange={(e) => form.setData('confirm_not_released', e.target.checked)}
                        />
                        No assistance was paid or physically released.
                    </label>
                    <label className="flex items-start gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.data.confirm_papers_invalid}
                            onChange={(e) => form.setData('confirm_papers_invalid', e.target.checked)}
                        />
                        Previously cancelled financial papers and claim notices remain invalid.
                    </label>
                    <DialogFooter>
                        <Button type="button" variant="outline" disabled={form.processing} onClick={onClose}>
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                !!blocker ||
                                form.processing ||
                                form.data.reason.trim().length < 10 ||
                                !form.data.confirm_not_released ||
                                !form.data.confirm_papers_invalid
                            }
                        >
                            Reopen for Review
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
