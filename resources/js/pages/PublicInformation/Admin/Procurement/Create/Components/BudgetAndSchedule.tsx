import { FormInput } from '@/components/FormInputField';
import { ProcurementFormData } from '@/Core/Types/PublicInformation/PublicInformationTypes';

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
                    value={data.approved_budget === 0 ? '' : data.approved_budget.toString()}
                    onChange={(e) => setData('approved_budget', e.target.value)}
                    error={errors.approved_budget}
                    placeholder="0.00"
                    disabled={processing}
                />
                <p className="mt-1 text-[0.8rem] text-muted-foreground">PHP (Philippine Peso)</p>
            </div>

            {/* ROW 2: TIMELINE (3 Columns for dates) */}
            <div>
                <FormInput
                    label="Pre-procurement / Pre-bid"
                    id="pre_bid_date"
                    type="date"
                    value={data.pre_bid_date || ''}
                    onChange={(e) => setData('pre_bid_date', e.target.value)}
                    error={errors.pre_bid_date}
                    disabled={processing}
                />
            </div>

            <div>
                <FormInput
                    label="Closing Date / Deadline"
                    id="closing_date"
                    type="date"
                    value={data.closing_date || ''}
                    onChange={(e) => setData('closing_date', e.target.value)}
                    error={errors.closing_date}
                    disabled={processing}
                />
            </div>
        </div>
    );
};
