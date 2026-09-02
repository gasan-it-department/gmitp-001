import { FlashHandler } from '@/components/Shared/FlashHandler';
import { Button } from '@/components/ui/button';
import { AssistanceGeneratedDocumentOption, AssistanceTypeFormData } from '@/Core/Types/ActionCenter/assistance';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import ToastProvider from '@/pages/Utility/ToastShower';
import actionCenter from '@/routes/actionCenter';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AssistanceTypeForm from './Components/AssistanceTypeForm';

// --- Types & Interfaces ---

interface Props {
    // 🎯 SENIOR DETAIL: We extend the form data to include the ID,
    // because the Edit mode needs the ID to build the update URL!
    existingAssistance: { data: AssistanceTypeFormData & { id: string } };
    documentTypes: { id: string; name: string }[];
    generatedDocumentOptions: AssistanceGeneratedDocumentOption[];
}

export default function EditAssistanceType({ existingAssistance, documentTypes, generatedDocumentOptions }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    // --- Navigation Handlers ---
    const handleCancel = () => {
        // Adjust this route to match your actual named route for the list view
        // router.visit(route('admin.assistance-types.index', { municipality: currentMunicipality.slug }));
        router.visit(actionCenter.admin.list.assistance.types.url({ municipality: currentMunicipality.slug }));
    };
    return (
        <div className="min-h-screen bg-gray-50/50 pb-24">
            <FlashHandler />
            <ToastProvider position="top-right" />

            {/* --- PAGE HEADER --- */}
            <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleCancel} className="text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Assistance Type</h1>
                        <p className="text-sm text-gray-500">Modify the rules and requirements for {existingAssistance.data.name}.</p>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT LAYOUT --- */}
            <main className="mx-auto mt-8 max-w-6xl px-6">
                {/* 🎯 Drop in the shared engine! */}
                <AssistanceTypeForm
                    mode="edit"
                    municipalitySlug={currentMunicipality.slug}
                    assistanceTypeId={existingAssistance.data.id} // Required for the PUT request
                    initialData={existingAssistance.data} // 🎯 This instantly fills the form!
                    documentTypes={documentTypes}
                    generatedDocumentOptions={generatedDocumentOptions}
                    onCancel={handleCancel} // Tells the cancel button where to go
                />
            </main>
        </div>
    );
}
