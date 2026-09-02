import { Button } from '@/components/ui/button';
import { AssistanceGeneratedDocumentOption, AssistanceTypeFormData } from '@/Core/Types/ActionCenter/assistance';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import actionCenter from '@/routes/actionCenter';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AssistanceTypeForm from './Components/AssistanceTypeForm';
// ... other layout imports like AppLayout, FlashHandler, ToastProvider

interface Props {
    documentTypes: { id: string; name: string }[];
    generatedDocumentOptions: AssistanceGeneratedDocumentOption[];
}

export default function CreateAssistanceType({ documentTypes, generatedDocumentOptions }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    const emptyInitialData: AssistanceTypeFormData = {
        name: '',
        description: '',
        max_amount: null,
        min_amount: null,
        cooldown_months: 0,
        is_active: true,
        enabled_generated_documents: ['request_intake_sheet'],
        documents: [],
    };
    const handleCancel = () => {
        // Navigates back to your list view
        router.visit(actionCenter.admin.list.assistance.types.url({ municipality: currentMunicipality.slug }));
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24">
            {/* ... Your FlashHandler, Toasts, and Header go here ... */}
            <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleCancel} className="text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Assistance Type</h1>
                    </div>
                </div>
            </header>
            <main className="mx-auto mt-8 max-w-6xl px-6">
                {/* 🎯 Drop in the shared form! */}
                <AssistanceTypeForm
                    mode="create"
                    municipalitySlug={currentMunicipality.slug}
                    initialData={emptyInitialData}
                    documentTypes={documentTypes}
                    generatedDocumentOptions={generatedDocumentOptions}
                    onCancel={handleCancel}
                />
            </main>

            {/* Note: The sticky action bar should be moved INSIDE the Shared Form 
                so the submit button is connected to the form context properly! */}
        </div>
    );
}
