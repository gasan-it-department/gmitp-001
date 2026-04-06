import { FormInput } from '@/components/FormInputField';
import { DatePicker } from '@/components/Shared/DatePicker';
import { ProcurementFormData } from '@/Core/Types/Procurement/procurement';

interface Props {
    data: ProcurementFormData;
    setData: (field: string, value: any) => void;
    errors: any;
    processing: boolean;
}

export function AwardInformation({ data, setData, errors, processing }: Props) {
    // Logic: If status is NOT 'AWARDED', maybe we visually dim this section?
    // For now, we just render the form.

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* ROW 1: Winning Bidder - Full Width */}
            <div className="md:col-span-2">
                <FormInput
                    label="Winning Bidder / Supplier"
                    id="winning_bidder"
                    isUppercase={true}
                    value={data.winning_bidder || ''}
                    onChange={(e) => setData('winning_bidder', e.target.value)}
                    error={errors.winning_bidder}
                    placeholder=""
                    disabled={processing}
                />
            </div>

            {/* ROW 2: Contract Details */}
            <div>
                <FormInput
                    label="Contract Amount"
                    id="contract_amount"
                    type="number"
                    // Handle null value safely
                    value={data.contract_amount?.toString() ?? ''}
                    onChange={(e) => setData('contract_amount', e.target.value)}
                    error={errors.contract_amount}
                    placeholder="0.00"
                    disabled={processing}
                />
            </div>

            <div>
                <DatePicker label="Date of Award" error={errors.award_date} value={data.award_date} onChange={(v) => setData('award_date', v)} />
            </div>
        </div>
    );
}
