import { FormInput } from '@/components/FormInputField';
import { DatePicker } from '@/components/Shared/DatePicker';
import { ProcurementFormData } from '@/Core/Types/Procurement/procurement';

interface Props {
    data: ProcurementFormData;
    setData: (field: string, value: any) => void;
    errors: any;
    processing: boolean;
}

export const BudgetAndSchedule = ({ data, setData, errors, processing }: Props) => {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* ROW 1: MONEY */}
            <div>
                <FormInput
                    label="Approved Budget (ABC)"
                    id="approved_budget"
                    type="number"
                    // Handle the 0 vs empty string issue for UX
                    value={data.abc_amount === 0 ? '' : data.abc_amount.toString()}
                    onChange={(e) => setData('abc_amount', e.target.value)}
                    error={errors.abc_amount}
                    placeholder="0.00"
                    disabled={processing}
                />
                <p className="mt-1 text-[0.8rem] text-muted-foreground">PHP (Philippine Peso)</p>
            </div>

            {/* ROW 2: TIMELINE (3 Columns for dates) */}
            <div>
                <DatePicker
                    label="Pre-procurement / Pre-bid"
                    value={data.pre_bid_date}
                    onChange={(val) => setData('pre_bid_date', val)}
                    error={errors.pre_bid_date}
                />
            </div>

            <div>
                <DatePicker
                    label="Closing Date / Deadline"
                    error={errors.closing_date}
                    value={data.closing_date}
                    onChange={(val) => setData('closing_date', val)}
                />
            </div>
        </div>
    );
};
