import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // ✅ Import Textarea
import { ActionCenterApi } from '@/Core/Api/ActionCenter/AssistanceRequestApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import { router } from '@inertiajs/react';
import { Flame, Loader2 } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface Props {
    request: AssistanceRequest;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (amount: number | string, remarks: string) => void;
}

interface ProcessRequestFormValues {
    amount: string | number;
    remarks: string;
}

export default function ProcessRequestDialog({ request, isOpen, onClose, onSuccess }: Props) {
    const { currentMunicipality } = useMunicipality();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProcessRequestFormValues>({
        defaultValues: {
            amount: request.amount || '',
            remarks: request.remarks || '',
        },
    });

    const onSubmit: SubmitHandler<ProcessRequestFormValues> = async (data) => {
        try {
            await ActionCenterApi.setAmount(currentMunicipality.slug, request.id, data);
            toast.success("Request processed successfully");
            onClose();
            reset();

            router.reload({
                only: ['data', 'requests'],
            });

            // ✅ Pass back both values
            if (onSuccess) onSuccess(data.amount, data.remarks);

        } catch (error) {
            console.error('Failed to set amount:', error);
            toast.error("Failed to update request");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md border-orange-100 shadow-xl">
                <DialogHeader className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 ring-4 ring-orange-50">
                        <Flame className="h-6 w-6 text-orange-600" />
                    </div>

                    <DialogTitle className="text-xl text-gray-900">Process Request</DialogTitle>
                    <DialogDescription className="text-center text-gray-500">
                        Approve this request for <span className="font-semibold text-orange-600">{currentMunicipality.name}</span>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
                    {/* Amount Input */}
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Allocated Amount (PHP)
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400 font-semibold">₱</span>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                className="pl-7 border-gray-200 focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/20 transition-all duration-200"
                                {...register('amount', { required: 'Amount is required' })}
                            />
                        </div>
                        {errors.amount && <p className="text-xs font-medium text-red-500 animate-pulse">{errors.amount.message}</p>}
                    </div>

                    {/* ✅ Remarks Input */}
                    <div className="space-y-2">
                        <Label htmlFor="remarks" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Remarks / Notes
                        </Label>
                        <Textarea
                            id="remarks"
                            placeholder="Add optional notes about this approval..."
                            className="resize-none border-gray-200 focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/20 transition-all duration-200"
                            rows={3}
                            {...register('remarks')}
                        />
                    </div>

                    {/* ✅ Fixed Button Spacing (sm:gap-2) */}
                    <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white shadow-md shadow-orange-200 transition-all duration-300 transform active:scale-95 border-0"
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Approve & Allocate"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}