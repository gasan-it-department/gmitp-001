import { FormInput } from '@/components/FormInputField';
import { DatePicker } from '@/components/Shared/DatePicker';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { ProcurementDetail } from '@/Core/Types/Procurement/procurement';
import procurementApi from '@/routes/procurement';
import { useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Trophy } from 'lucide-react';
import { FormEvent } from 'react';

// Adjust this import to match your actual routing helper

interface Props {
    isOpen: boolean;
    onClose: () => void;
    procurement: ProcurementDetail;
}

// Format Helper for the UI hints
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};

export const AwardBiddingDialog = ({ isOpen, onClose, procurement }: Props) => {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    // 📦 Initialize Inertia Form matching your DTO!
    const { data, setData, put, processing, reset, errors, clearErrors } = useForm({
        winning_bidder_name: '',
        contract_amount: '',
        awarded_date: '',
    });

    // 🛡️ Client-Side UX Warnings (Prevents unnecessary backend hits)
    const isOverBudget = Number(data.contract_amount) > procurement.abc_amount;
    const isTimeTravel = data.awarded_date && new Date(data.awarded_date) < new Date(procurement.closing_date!);

    const handleClose = () => {
        clearErrors();
        reset();
        onClose();
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        // Ensure this route matches your actual AwardProcurementController route
        put(procurementApi.award.url(procurement.id), {
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            preserveScroll: true,
            onSuccess: () => handleClose(),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={submit}>
                    {/* HEADER: Trophy Theme for Awarding */}
                    <DialogHeader className="mb-4 flex flex-row items-center gap-4 space-y-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <Trophy className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col text-left">
                            <DialogTitle className="text-lg font-bold text-slate-900">Award Project</DialogTitle>
                            <DialogDescription className="text-sm text-slate-500">
                                Officially declare the winning bidder and contract amount.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    {/* MAIN FORM BODY */}
                    <div className="space-y-5 py-2">
                        {/* 1. Winning Bidder Name */}
                        <div className="space-y-2">
                            <FormInput
                                id="winning_bidder_name"
                                label="WINNING BIDDER"
                                placeholder="Winning Bidder"
                                value={data.winning_bidder_name}
                                onChange={(e) => setData('winning_bidder_name', e.target.value)}
                                error={errors.winning_bidder_name}
                                isUppercase
                            />
                        </div>

                        {/* 2. Contract Amount */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="contract_amount" className="text-slate-700">
                                    Contract Amount (₱) <span className="text-red-500">*</span>
                                </Label>
                                {/* 🌟 UX Magic: Show the encoder the max budget so they don't guess! */}
                                <span className="text-xs font-medium text-slate-500">Max ABC: {formatCurrency(procurement.abc_amount)}</span>
                            </div>

                            <FormInput
                                id="contract_amount"
                                label=""
                                placeholder="Contract Amount"
                                value={data.contract_amount.toString()}
                                onChange={(e) => setData('contract_amount', e.target.value)}
                                error={errors.contract_amount}
                                type="number"
                            />
                            {isOverBudget && (
                                <span className="mt-1 block flex items-center gap-1 text-xs font-medium text-destructive">
                                    <AlertCircle className="h-3 w-3" /> Amount exceeds the Approved Budget!
                                </span>
                            )}
                        </div>

                        {/* 3. Date of Award */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="awarded_date" className="text-slate-700">
                                    Date of Award <span className="text-red-500">*</span>
                                </Label>
                                {/* 🌟 UX Magic: Show them the earliest possible date! */}
                                <span className="text-xs font-medium text-slate-500">
                                    Bidding closed on: {new Date(procurement.closing_date!).toLocaleDateString()}
                                </span>
                            </div>
                            <DatePicker
                                label=""
                                value={data.awarded_date}
                                onChange={(val) => setData('awarded_date', val)}
                                error={errors.awarded_date}
                            />
                            {errors.awarded_date && <span className="block text-xs font-medium text-destructive">{errors.awarded_date}</span>}
                            {isTimeTravel && (
                                <span className="mt-1 block flex items-center gap-1 text-xs font-medium text-destructive">
                                    <AlertCircle className="h-3 w-3" /> Cannot award before the bidding closed!
                                </span>
                            )}
                        </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <DialogFooter className="mt-6 gap-2 sm:justify-end">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || isOverBudget || isTimeTravel}
                            className="flex items-center gap-2 bg-green-600 font-bold text-white hover:bg-green-700"
                        >
                            {processing ? (
                                'Awarding...'
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4" /> Confirm Award
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
