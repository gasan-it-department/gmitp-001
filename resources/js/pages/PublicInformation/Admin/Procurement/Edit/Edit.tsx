import SharedProcurementForm from '@/components/Procurement/SharedProcurementForm';
import { Category, FundingSource, ProcurementDetail, ProcurementFormData } from '@/Core/Types/Procurement/procurement';

interface EditProps {
    //  FIX 1: The data coming from Laravel is the full Detail view
    procurement: { data: ProcurementDetail };
    fundingSources: { data: FundingSource[] };
    categories: Category[];
    statuses: any;
}

export default function Edit({ procurement, fundingSources, categories, statuses }: EditProps) {
    const existingData = procurement.data;
    //  Explicitly cast this to ProcurementFormData so TypeScript checks our work
    const mappedInitialData: ProcurementFormData = {
        reference_number: existingData.reference_number || '',
        title: existingData.title || '',
        category: existingData.category.value || '',
        status: existingData.status || '',
        abc_amount: existingData.abc_amount || 0,
        contract_amount: existingData.contract_amount || null,

        pre_bid_date: existingData.pre_bid_date ? existingData.pre_bid_date.split('T')[0] : null,
        closing_date: existingData.closing_date ? existingData.closing_date.split('T')[0] : null,
        award_date: existingData.award_date ? existingData.award_date.split('T')[0] : null,

        winning_bidder: existingData.winning_bidder || null,
        documents: existingData.documents || [],

        //  FIX 3: Safely extract the ID from the nested relationship objects
        department_id: existingData.department?.id || '',
        funding_source_id: existingData.funding_source?.id || '',

        notes: existingData.notes || '',

        //  FIX 2: Added the missing required property
        is_historical: false,
    };
    console.log(mappedInitialData);
    return (
        <SharedProcurementForm
            initialData={mappedInitialData}
            mode="edit"
            procurementId={existingData.id} // This works now because existingData is a ProcurementDetail!
            fundingSources={fundingSources.data}
            categories={categories}
            statuses={statuses}
        />
    );
}
