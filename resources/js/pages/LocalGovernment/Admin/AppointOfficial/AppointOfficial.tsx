import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { useState } from 'react';
import { CreateOfficialDialog } from './Components/CreateOfficialDialog';
import { SearchOfficial } from './Components/SearchOfficial';

interface Props {
    municipality: MunicipalityType;
    term: { data: Term }; // Adjusted based on your previous messages
    positions: Position[];
}

export default function AppointOfficial({ municipality, term, positions }: Props) {
    // 1. STATE: Who did we pick?
    const [selectedOfficial, setSelectedOfficial] = useState<Official | null>(null);

    // 2. STATE: Is the "Create" modal open?
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // 3. STATE: Logic to handle selection
    const handleOfficialSelected = (official: Official) => {
        console.log('Form updated with:', official);
        setSelectedOfficial(official);
        // Here you would also update your useForm setData('official_id', official.id)
    };

    // 4. STATE: Logic when a NEW person is created via Dialog
    const handleOfficialCreated = (newOfficial: Official) => {
        console.log('New official created & selected:', newOfficial);
        setSelectedOfficial(newOfficial); // Automatically select them!
        // setData('official_id', newOfficial.id);
    };

    return (
        <AppLayout>
            <div className="mx-auto max-w-7xl space-y-6 py-10">
                {/* Header Context */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Appoint Official</h1>
                    <p className="text-gray-500">
                        {term.data.name} • {municipality.name}
                    </p>
                </div>

                <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
                    {/* THE SEARCH COMPONENT */}
                    {/* If we already selected someone, show a "Selected Card" instead (future step) */}
                    {!selectedOfficial ? (
                        <SearchOfficial
                            onSelect={handleOfficialSelected}
                            onCreate={(name) => {
                                // Optional: You could pass 'name' to the dialog to pre-fill it
                                setIsCreateDialogOpen(true);
                            }}
                        />
                    ) : (
                        <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-4">
                            <div>
                                <p className="font-bold text-blue-900">{selectedOfficial.full_name}</p>
                                <p className="text-sm text-blue-700">ID: {selectedOfficial.id}</p>
                            </div>
                            <button onClick={() => setSelectedOfficial(null)} className="text-sm text-blue-600 hover:underline">
                                Change
                            </button>
                        </div>
                    )}

                    {/* Other form fields (Position, Date, etc.) would go here... */}
                </div>

                {/* THE DIALOG (Hidden by default) */}
                <CreateOfficialDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} onSuccess={handleOfficialCreated} />
            </div>
        </AppLayout>
    );
}
