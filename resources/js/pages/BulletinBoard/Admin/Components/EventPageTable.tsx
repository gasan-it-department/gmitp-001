import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EventsApi } from '@/Core/Api/BulletinBoard/EventsApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import type { EventFormData } from '@/Core/Types/BulletinBoard/Events';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import PaginationView from "@/pages/Utility/PaginationView";
import { CheckCircle2, Clock, Pencil, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddEditEventsDialog from './AddEditEventsDialog';
import EventPageHeader from './EventPageHeader';
import FilterDialog from './FilterDialog';

interface EventDataList {
    id: string;
    title: string;
    description: string;
    event_date: string;
    created_at: string;
}

export default function EventPageTable() {
    const [isLoading, setIsLoading] = useState(false);
    const [eventList, setEventList] = useState<EventDataList[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]); // Track selected IDs
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const { currentMunicipality } = useMunicipality();
    const [currentFilter, setCurrentFilter] = useState<string | null>(null);
    const [isFilterOpened, setIsFilterOpened] = useState(false);
    const [addEventDialog, setAddEventDialog] = useState({
        isOpen: false,
        editData: null as EventFormData | null,
    });

    const [classicDialog, setClassicDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        positiveButtonText: string;
        negativeButtonText: string;
        isNegativeButtonHidden: boolean;
        action: string;
        selectedItemId: string[] | null;
    }>({
        isOpen: false,
        title: "",
        message: "",
        positiveButtonText: "",
        negativeButtonText: "",
        isNegativeButtonHidden: false,
        action: "",
        selectedItemId: [],
    });


    useEffect(() => {
        loadEvents(currentPage);
    }, [currentPage]);

    const loadEvents = async (page: number = 1) => {
        try {
            setIsLoading(true);
            const response = await EventsApi.getPublished(currentMunicipality.slug, page);
            const data = response.data;
            const sorted = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setEventList(sorted);
            setCurrentPage(response.current_page);
            setLastPage(response.last_page);
            setPerPage(response.per_page);
            setTotalItems(response.total);
        } catch (error) {
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const getEventStatus = (eventDate: string): string => {
        const today = new Date();
        const event = new Date(eventDate);
        const todayStr = today.toISOString().split("T")[0];
        const eventStr = event.toISOString().split("T")[0];
        if (eventStr === todayStr) return "Ongoing";
        if (event > today) return "Upcoming";
        return "Completed";
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Upcoming":
                return (
                    <span className="flex items-center gap-1 text-sm font-medium text-blue-600">
                        <Clock size={14} /> Upcoming
                    </span>
                );
            case "Ongoing":
                return (
                    <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                        <CheckCircle2 size={14} /> Ongoing
                    </span>
                );
            case "Completed":
                return (
                    <span className="flex items-center gap-1 text-sm font-medium text-gray-500">
                        <XCircle size={14} /> Completed
                    </span>
                );
        }
    };

    const handleDeleteEvent = async (idList: string[] | null) => {
        try {
            if (idList == null) return;
            setIsLoading(true);
            if (idList.length === 1) {
                // SINGLE DELETE
                const response = await EventsApi.deleteEvent(idList[0], currentMunicipality.slug);
                setIsLoading(false);
                if (response.success) {
                    console.log("Response: ", response);
                } else {
                    console.log("Delete failed:", response);
                }
            } else {
                // MULTIPLE DELETE

            }
        } catch (error) {
            setIsLoading(false);
            console.error("Delete error:", error);
        }
    };

    const handleSuccess = (data: EventFormData, isEdit: boolean) => {
        setAddEventDialog({ isOpen: false, editData: null });

        if (isEdit) {
            setEventList(prev =>
                prev.map(item => item.id === data.id ? { ...item, ...data } : item)
            );
        } else {
            const newEvent: EventDataList = {
                ...data,
                created_at: new Date().toISOString(),
            };
            setEventList(prev => [newEvent, ...prev]);
            setTotalItems(prev => prev + 1);
            if (eventList.length >= perPage) {
                setEventList(prev => prev.slice(0, perPage));
            }
        }
    };

    const handlePageChange = (page: number) => {
        console.log("Changing to page: ", page);
        if (page >= 1 && page <= lastPage) {
            setCurrentPage(page);
        }
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === eventList.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(eventList.map(item => item.id));
        }
    };

    const toggleSelectItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSort = (currentSelectedSort: string | null) => {
        //SEND FILTER TO BACKEND
        console.log("Event selected filter: ", currentSelectedSort);
    }

    return (
        <div>
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Event List</h1>
                <EventPageHeader
                onFilterButtonClicked={() => {
                    setIsFilterOpened(true);
                }}
                    onAddNewButtonClicked={() => setAddEventDialog({ isOpen: true, editData: null })}
                />
            </div>

            <div className="flex items-center justify-between mb-2">
                <div>
                    <Button
                        size="sm"
                        disabled={selectedItems.length <= 0}
                        className="bg-red-600 hover:bg-red-700 text-white border-none"
                        onClick={() =>
                            setClassicDialog((prev) => ({
                                ...prev,
                                isOpen: true,
                                title: "Confirm",
                                message: `Are you sure you want to delete ${selectedItems.length} selected announcement(s)?`,
                                positiveButtonText: "Delete",
                                negativeButtonText: "Cancel",
                                payload: selectedItems,
                            }))
                        }
                    >
                        Delete ({selectedItems.length}) items
                    </Button>
                </div>
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200">
                <Table className="w-full table-auto">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="w-12">
                                <div className="flex items-center justify-center p-2">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 cursor-pointer"
                                        checked={selectedItems.length === eventList.length && eventList.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </div>
                            </TableHead>
                            <TableHead className="w-16 text-center">No.</TableHead>
                            <TableHead>Event Title</TableHead>
                            <TableHead className="w-[350px]">Description</TableHead>
                            <TableHead>Event Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {eventList.length === 0 ? (
                            <AdminEmptyListItem
                                colSpan={6}
                                title="No Events yet."
                                message="Events you created will appear here." />
                        ) : (
                            eventList.map((item, index) => {
                                const status = getEventStatus(item.event_date);
                                return (
                                    <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center justify-center p-2">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 cursor-pointer"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => toggleSelectItem(item.id)}
                                                />
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            {index + 1 + (currentPage - 1) * perPage}
                                        </TableCell>
                                        <TableCell>{item.title}</TableCell>
                                        <TableCell className="max-w-[350px]">
                                            <div
                                                className="overflow-hidden"
                                                style={{
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: "vertical",
                                                }}
                                            >
                                                {item.description}
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatDate(item.event_date)}</TableCell>
                                        <TableCell>{getStatusBadge(status)}</TableCell>
                                        <TableCell className="flex justify-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setAddEventDialog({ isOpen: true, editData: item })
                                                }
                                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                            >
                                                <Pencil size={14} />
                                            </Button>

                                            {/* <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setClassicDialog({
                                                        isOpen: true,
                                                        title: "Confirm",
                                                        message: "Delete this event?",
                                                        positiveButtonText: "Delete",
                                                        negativeButtonText: "Cancel",
                                                        isNegativeButtonHidden: false,
                                                        action: "delete",
                                                        selectedItemId: selectedItems,
                                                    })
                                                }
                                                className="border-red-200 text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 size={14} />
                                            </Button> */}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            <div className="mt-3">
                <PaginationView
                    currentPage={currentPage}
                    totalPages={lastPage}
                    totalItems={totalItems}
                    itemsPerPage={perPage}
                    onPageChange={(page) => handlePageChange(page)}
                />
            </div>

            <FilterDialog
                isOpen={isFilterOpened}
                onClose={function (): void {
                    setIsFilterOpened(false);
                }}
                filters={["Event title", "Description", "Evet date", "Status"]}
                selectedFilter={currentFilter}
                currentFilter={currentFilter}
                onApply={(selectedFilter) => {
                    setCurrentFilter(selectedFilter);
                    handleSort(selectedFilter);
                }} />

            {/* Add/Edit */}
            <AddEditEventsDialog
                isOpen={addEventDialog.isOpen}
                editData={addEventDialog.editData}
                onSuccess={handleSuccess}
                onClose={() => setAddEventDialog({ isOpen: false, editData: null })}
            />

            {/* Dialog */}
            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                hideNegativeButton={classicDialog.isNegativeButtonHidden}
                open={classicDialog.isOpen}
                positiveButtonText={classicDialog.positiveButtonText}
                negativeButtonText={classicDialog.negativeButtonText}
                onPositiveClick={() => {
                    setClassicDialog((p) => ({ ...p, isOpen: false }));
                    if (classicDialog.action === "delete") {
                        handleDeleteEvent(classicDialog.selectedItemId);
                    }
                }}
                onNegativeClick={() =>
                    setClassicDialog((p) => ({ ...p, isOpen: false }))
                }
            />

            <LoadingDialog isOpen={isLoading} />
        </div>
    );
}
