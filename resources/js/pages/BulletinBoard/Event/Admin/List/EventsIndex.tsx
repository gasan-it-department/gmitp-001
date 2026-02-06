import { destroy } from '@/actions/App/External/Api/Controllers/BulletinBoard/EventController';
import { FlashMessage } from '@/components/Shared/FlashMessage';
import { Pagination } from '@/components/Shared/Pagination';
import { EventData, EventFormData } from '@/Core/Types/BulletinBoard/Events';
import BaseLayout from '@/layouts/App/AppLayout';
import ClassicDialog from '@/pages/Utility/ClassicDialog'; // Ensure you have this component
import { router } from '@inertiajs/react';
import { useState } from 'react';
import AddEditEventsDialog from './Components/AddEditEventsDialog';
import { EventsListHeader } from './Components/EventsListHeader';
import { EventsTable } from './Components/EventsTable';
import { Button } from '@/components/ui/button';

interface Props {
    events: {
        data: EventData[];
        links: any;
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            total: number;
            links: any[];
            per_page: number; // Added per_page for calculations
        };
    };
    filters: any;
    municipality: any;
}

export default function EventsIndex({ events, filters, municipality }: Props) {
    // --- State Management ---
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    // Add/Edit Dialog State
    const [addEventDialog, setAddEventDialog] = useState<{ isOpen: boolean; editData: EventFormData | null }>({
        isOpen: false,
        editData: null,
    });

    // Confirmation Dialog State (for Deleting)
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        action: () => { },
    });

    // --- Handlers ---

    // 1. Handle Selection (Lifted up from Table so Header can see it)
    const handleToggleSelect = (id: string) => {
        setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const handleSelectAll = () => {
        if (selectedItems.length === events.data.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(events.data.map((item) => item.id));
        }
    };

    // 2. Handle Add/Edit Success
    const handleSuccess = () => {
        // Since we are using Inertia, we refresh the page to get the latest data from the server
        // router.reload({ only: ['events'] });
        setAddEventDialog({ isOpen: false, editData: null });
    };

    // 3. Handle Deletion
    const initiateDelete = (ids: string[]) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Confirm Deletion',
            message: `Are you sure you want to delete ${ids.length} selected event(s)?`,
            action: () => {
                router.delete(destroy.url(), {
                    data: { ids },
                    preserveScroll: true,
                    headers: {
                        'X-Municipality-Slug': municipality.slug,
                    },
                    onSuccess: () => {
                        setSelectedItems([]); // Clear checkboxes
                        setConfirmDialog((prev) => ({ ...prev, isOpen: false })); // Close modal
                        // Optional: toast("Events deleted successfully")
                    },
                    onError: (errors) => {
                        console.error('Failed to delete', errors);
                        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                    },
                });
            },
        });
    };

    return (
        <BaseLayout>
            <div className="m-5 mt-0 grid grid-cols-1 bg-white">
                <div className="my-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <header className="text-3xl font-bold tracking-tight text-balance">Events</header>

                    {/* Header Component controls Search and Add Button */}
                    <EventsListHeader
                        onSearch={(term) => router.get(route(route().current()!), { search: term }, { preserveState: true, replace: true })}
                        onAdd={() => setAddEventDialog({ isOpen: true, editData: null })}
                        selectedCount={selectedItems.length}
                    />
                </div>

                {/* BULK DELETE */}
                <div className="mb-2">
                    <Button
                        size="sm"
                        disabled={selectedItems.length === 0}
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={() =>
                            initiateDelete(selectedItems)
                        }
                    >
                        Delete ({selectedItems.length}) items
                    </Button>
                </div>

                <div>
                    {/* Table Component */}
                    <EventsTable
                        data={events.data}
                        from={events.meta.from}
                        selectedItems={selectedItems}
                        onToggleSelect={handleToggleSelect}
                        onSelectAll={handleSelectAll}
                        onEdit={(item) => setAddEventDialog({ isOpen: true, editData: item })}
                        onDelete={(id) => initiateDelete([id])}
                    />

                    {/* Pagination */}
                    <div className="mt-4">
                        <Pagination links={events.meta.links} />
                    </div>
                </div>
            </div>

            {/* Add/Edit Dialog */}
            <AddEditEventsDialog
                isOpen={addEventDialog.isOpen}
                editData={addEventDialog.editData}
                onClose={() => setAddEventDialog({ isOpen: false, editData: null })}
                onSuccess={handleSuccess}
            />

            {/* Confirmation Dialog (Reusing ClassicDialog pattern) */}
            <ClassicDialog
                open={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                positiveButtonText="Yes, Delete"
                negativeButtonText="Cancel"
                onPositiveClick={confirmDialog.action}
                onNegativeClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
            />
            {/* for displaying flash messages */}
            <FlashMessage />
        </BaseLayout>
    );
}
