import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { ProcurementDetail } from '@/Core/Types/Procurement/procurement';
import procurementApi from '@/routes/procurement';
import { useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Lock } from 'lucide-react';
import { FormEvent } from 'react';

// 🌟 Import Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    isOpen: boolean; // 🌟 Fixed type from () => void to boolean
    onClose: () => void;
    procurement: ProcurementDetail;
}

export default function CloseBiddingDialog({ isOpen, onClose, procurement }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    const { data, setData, patch, processing, reset, errors } = useForm({
        remarks: '',
    });

    const isEarlyClose = new Date() < new Date(procurement.closing_date!);

    const submit = (e: FormEvent) => {
        e.preventDefault();

        // Ensure this route matches your actual route helper
        patch(procurementApi.evaluate.url(procurement.id), {
            preserveScroll: true,
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                {/* 🌟 Wrap the content in a form so the footer buttons work natively */}
                <form onSubmit={submit}>
                    {/* CUSTOM HEADER LAYOUT */}
                    <DialogHeader className="mb-4 flex flex-row items-center gap-4 space-y-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <Lock className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col text-left">
                            <DialogTitle className="text-lg font-bold text-slate-900">Close Bidding & Evaluate</DialogTitle>
                            <DialogDescription className="text-sm text-slate-500">Lock the project and begin BAC evaluation.</DialogDescription>
                        </div>
                    </DialogHeader>

                    {/* MAIN BODY */}
                    <div className="space-y-6 py-2">
                        {isEarlyClose && (
                            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                <p>
                                    <strong>Warning:</strong> The official closing date ({new Date(procurement.closing_date!).toLocaleDateString()})
                                    has not passed yet. The system may block this action unless overridden.
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="remarks" className="text-slate-700">
                                BAC Remarks / Minutes (Optional)
                            </Label>
                            <Textarea
                                id="remarks"
                                placeholder="Enter any notes regarding the bid opening..."
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                            {errors.remarks && <span className="text-sm font-medium text-destructive">{errors.remarks}</span>}
                        </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <DialogFooter className="mt-6 gap-2 sm:justify-end">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-amber-500 font-bold text-white hover:bg-amber-600">
                            {processing ? 'Locking...' : 'Confirm & Lock'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
