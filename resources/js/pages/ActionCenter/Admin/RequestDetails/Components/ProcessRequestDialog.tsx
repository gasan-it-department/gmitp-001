import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ActionCenterApi } from '@/Core/Api/ActionCenter/AssistanceRequestApi';
// Import your Context
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import { router } from '@inertiajs/react';
// Import Inertia router if you want page refreshes, OR your API Class if you want Axios
import { Loader2 } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';

interface Props {
    request: AssistanceRequest;
    isOpen: boolean;
    onClose: () => void;
}

interface ProcessRequestFormValues {
    amount: string | number;
    remarks: string;
}

export default function ProcessRequestDialog({ request, isOpen, onClose }: Props) {
    // ✅ CALL HOOK HERE
    const { currentMunicipality } = useMunicipality();

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProcessRequestFormValues>({
        defaultValues: {
            amount: request.amount || '',
            remarks: '',
        },
    });

    const onSubmit: SubmitHandler<ProcessRequestFormValues> = async (data) => {
        try {
            await ActionCenterApi.setAmount(currentMunicipality.slug, request.id, data);

            reset();
            onClose();
            router.reload();
        } catch (error) {
            console.error('Failed to set amount:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Process Request</DialogTitle>
                    <DialogDescription>
                        Approve this request for <strong>{currentMunicipality.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Allocated Amount (PHP)</Label>
                        <Input id="amount" type="number" placeholder="0.00" step="0.01" {...register('amount', { required: 'Amount is required' })} />
                        {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Approve & Allocate
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
