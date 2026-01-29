import PublicInformation from '@/actions/App/External/Api/Controllers/PublicInformation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProcurementFormData } from '@/Core/Types/PublicInformation/PublicInformationTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react'; // Icons make it look premium
import { Attachments } from './Components/Attachments';
import { AwardInformation } from './Components/AwardInformation';
import { BudgetAndSchedule } from './Components/BudgetAndSchedule';
import { ProjectDetails } from './Components/ProjectDetails';

const initialValues: ProcurementFormData = {
    reference_number: '',
    title: '',
    category: '',
    status: 'OPEN',
    approved_budget: 0,
    contract_amount: null,
    pre_bid_date: null,
    closing_date: null,
    award_date: null,
    winning_bidder: null,
    attachments: [],
};

export default function CreateProcurement() {
    // const { currentMunicipality } = useMunicipality();
    const { currentMunicipality } = usePage<any>().props;
    const { data, setData, post, processing, errors } = useForm<ProcurementFormData>(initialValues);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(PublicInformation.StoreProcurementsController.url(), {
            forceFormData: true,
            // 2. Inject the Header here
            headers: {
                'X-Municipality-Slug': currentMunicipality?.slug || '',
            },
            onSuccess: () => {
                console.log('Success!');
            },
        });
    };

    // Assuming you have a route to go back to the list
    const handleBack = () => {
        window.history.back(); // Simple browser back, or use Inertia visit()
    };

    return (
        <AppLayout>
            {/* Main Container - Adjusted padding for dashboard feel */}
            <div className="mx-auto min-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {/* 1. PAGE HEADER: Sits outside the white box */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2 h-8 w-8 p-0">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium">Back to Procurements</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create New Procurement</h1>
                        <p className="text-sm text-muted-foreground">Publish a new bidding opportunity to the transparency portal.</p>
                    </div>
                </div>

                {/* 2. THE FORM PANEL: Clean white background, no floating margins */}
                <form onSubmit={onSubmit} className="rounded-xl border bg-white shadow-sm">
                    {/* SECTION 1: PROJECT DETAILS */}
                    <div className="p-6 md:p-8">
                        <div className="mb-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Project Information</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Basic identification details for the project.</p>
                        </div>
                        <ProjectDetails data={data} setData={setData} errors={errors} processing={processing} />
                    </div>

                    <Separator />

                    {/* SECTION 2: BUDGET & SCHEDULE */}
                    <div className="p-6 md:p-8">
                        <div className="mb-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Financials & Timeline</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Budget allocation and key procurement dates.</p>
                        </div>
                        <BudgetAndSchedule data={data} setData={setData} errors={errors} processing={processing} />
                    </div>
                    <Separator />

                    {/* SECTION 3: AWARD INFO */}
                    {/* Optional: You could wrap this in {data.status === 'AWARDED' && (...)} to hide it automatically */}
                    <div className="bg-gray-50/50 p-6 md:p-8">
                        <div className="mb-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Award Details</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Fill this section only if the project has been awarded.</p>
                        </div>
                        <AwardInformation data={data} setData={setData} errors={errors} processing={processing} />
                    </div>

                    <div className="p-6 md:p-8">
                        <h3 className="mb-6 text-lg leading-6 font-medium text-gray-900">Documents</h3>
                        <Attachments
                            attachments={data.attachments}
                            onFilesChange={(newFiles) => setData((currentData) => ({ ...currentData, attachments: newFiles }))}
                            error={(errors as any)?.attachments}
                            disabled={processing}
                        />
                        {/* Handle specific file errors from Laravel (attachments.0, attachments.1) */}
                        {Object.keys(errors).map((key) => {
                            if (key.startsWith('attachments.')) {
                                // 👇 THE FIX: Cast 'errors' to 'any' just for this line
                                // This stops TypeScript from checking if 'attachments.0' exists in your Interface (it doesn't)
                                const errorMessage = (errors as any)[key];

                                return (
                                    <p key={key} className="mt-1 text-sm text-red-500">
                                        {errorMessage}
                                    </p>
                                );
                            }
                            return null;
                        })}
                    </div>

                    {/* FOOTER: Fixed action bar feeling */}
                    <div className="flex items-center justify-end gap-3 rounded-b-xl border-t bg-gray-50 px-6 py-4">
                        <Button type="button" variant="outline" onClick={handleBack} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Publishing...' : 'Publish Procurement'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
