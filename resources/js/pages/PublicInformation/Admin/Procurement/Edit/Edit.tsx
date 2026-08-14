import SharedProcurementForm from '@/components/Procurement/SharedProcurementForm';
import { FlashHandler } from '@/components/Shared/FlashHandler';
import { Button } from '@/components/ui/button';
import { Department } from '@/Core/Types/Department/department';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { Category, FundingSource, ProcurementDetail, ProcurementFormData, ProcurementSelectOption } from '@/Core/Types/Procurement/procurement';
import AppLayout from '@/layouts/App/AppLayout';
import ToastProvider from '@/pages/Utility/ToastShower';
import procurementRoute from '@/routes/procurement';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, LockKeyhole } from 'lucide-react';

interface EditProps {
    //  FIX 1: The data coming from Laravel is the full Detail view
    procurement: { data: ProcurementDetail };
    fundingSources: { data: FundingSource[] };
    categories: Category[];
    statuses: ProcurementSelectOption[];
    departments: Department[];
}

export default function Edit({ procurement, fundingSources, categories, statuses, departments }: EditProps) {
    const existingData = procurement.data;
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    //  Explicitly cast this to ProcurementFormData so TypeScript checks our work
    const mappedInitialData: ProcurementFormData = {
        reference_number: existingData.reference_number || '',
        title: existingData.title || '',
        description: existingData.description || '',
        category: existingData.category.value || '',
        status: existingData.status || '',
        abc_amount: existingData.abc_amount || 0,
        contract_amount: existingData.contract_amount || null,

        pre_bid_date: existingData.pre_bid_date ? existingData.pre_bid_date.split('T')[0] : null,
        closing_date: existingData.closing_date ? existingData.closing_date.split('T')[0] : null,
        awarded_date: existingData.awarded_date ? existingData.awarded_date.split('T')[0] : null,

        winning_bidder: existingData.winning_bidder || null,
        failure_reason: existingData.failure_reason || null,
        failed_date: existingData.failed_date ? existingData.failed_date.split('T')[0] : null,
        documents: existingData.media || [],

        //  FIX 3: Safely extract the ID from the nested relationship objects
        department_id: existingData.department?.id || '',
        funding_source_id: existingData.funding_source?.id || '',
        custom_funding_source: existingData.custom_funding_source || null,

        notes: existingData.status === 'cancelled' ? existingData.notes || '' : null,

        //  FIX 2: Added the missing required property
        is_historical: existingData.status !== 'draft',
        published_at: existingData.published_at || null,
    };
    if (existingData.published_at) {
        return (
            <AppLayout>
                <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-6 py-12">
                    <section className="w-full rounded-3xl border border-sky-200 bg-white p-8 text-center shadow-sm sm:p-10">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-800">
                            <LockKeyhole className="h-7 w-7" aria-hidden="true" />
                        </div>
                        <h1 className="mt-5 text-2xl font-bold text-slate-950">Published public record</h1>
                        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
                            Ordinary edits are disabled after publication to preserve what citizens saw. Add permitted supporting documents from the
                            record page, or use the formal correction workflow when it becomes available.
                        </p>
                        <Button asChild className="mt-7 gap-2 bg-sky-700 text-white hover:bg-sky-800">
                            <Link href={procurementRoute.admin.show.url({ municipality: currentMunicipality.slug, id: existingData.id })}>
                                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Return to record
                            </Link>
                        </Button>
                    </section>
                </div>
            </AppLayout>
        );
    }

    return (
        <>
            <SharedProcurementForm
                initialData={mappedInitialData}
                mode="edit"
                procurementId={existingData.id} // This works now because existingData is a ProcurementDetail!
                fundingSources={fundingSources.data}
                categories={categories}
                statuses={statuses}
                departments={departments}
            />
            <FlashHandler />
            <ToastProvider position="top-right" />
        </>
    );
}
