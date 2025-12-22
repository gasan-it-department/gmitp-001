import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EventsApi } from '@/Core/Api/BulletinBoard/EventsApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import type { EventFormData } from '@/Core/Types/BulletinBoard/Events';
import { FilterDialogData } from '@/Core/Types/Utility/FilterDialogTypes';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import PaginationView from '@/pages/Utility/PaginationView';
import { CheckCircle2, Clock, Pencil, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddEditEventsDialog from './AddEditEventsDialog';
import EventPageHeader from './EventPageHeader';
import FilterDialog from './FilterDialog';

// 1. Defined types based on your JSON structure
interface EventDataList {
    id: string;
    title: string;
    description: string;
    event_date: string;
    created_at: string;
}

interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface Apiresponse {
    data: EventDataList[];
    meta: PaginationMeta;
    links: any;
    success: boolean;
}

export default function EventPageTable() {
    const [isLoading, setIsLoading] = useState(false);
    const [eventList, setEventList] = useState<EventDataList[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(30);
    const [totalItems, setTotalItems] = useState(0);

    const { currentMunicipality } = useMunicipality();
    const [currentFilter, setCurrentFilter] = useState<FilterDialogData | null>(null);
    const [isFilterOpened, setIsFilterOpened] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

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
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
        isNegativeButtonHidden: false,
        action: '',
        selectedItemId: [],
    });

    useEffect(() => {
        loadEvents(currentPage);
    }, [currentPage]);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 200);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // 2. FIXED: Logic to handle the API Resource Structure
    const loadEvents = async (page: number = 1) => {
        try {
            setIsLoading(true);
            const response = await EventsApi.fetch(currentMunicipality.slug, page);
            const apiData: Apiresponse = response;
            console.log('Fetched Events:', apiData);
            setEventList(apiData.data);
            setCurrentPage(apiData.meta.current_page);
            setLastPage(apiData.meta.last_page);
            setPerPage(apiData.meta.per_page);
            setTotalItems(apiData.meta.total);
        } catch (error: any) {
            console.error('Error fetching events:', error);

            // Better error handling for Axios or fetch
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Failed to load events.';

            setEventList([]);

            setClassicDialog((prev) => ({
                ...prev,
                isOpen: true,
                title: 'An error occurred!',
                message: `Request failed with status code ${error.response?.status || 'unknown'}: ${errorMessage}`,
                positiveButtonText: 'Close',
                isNegativeButtonHidden: true,
                payload: null,
                action: 'none',
                selectedItemId: null,
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const getEventStatus = (eventDate: string): string => {
        const today = new Date();
        const event = new Date(eventDate);
        const todayStr = today.toISOString().split('T')[0];
        const eventStr = event.toISOString().split('T')[0];
        if (eventStr === todayStr) return 'Ongoing';
        if (event > today) return 'Upcoming';
        return 'Completed';
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Upcoming':
                return (
                    <span className="flex items-center gap-1 text-sm font-medium text-blue-600">
                        <Clock size={14} /> Upcoming
                    </span>
                );
            case 'Ongoing':
                return (
                    <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                        <CheckCircle2 size={14} /> Ongoing
                    </span>
                );
            case 'Completed':
                return (
                    <span className="flex items-center gap-1 text-sm font-medium text-gray-500">
                        <XCircle size={14} /> Completed
                    </span>
                );
        }
    };

    const handleDeleteEvent = async (ids: string[] | null) => {
        try {
            if (!ids || ids.length === 0) return;
            setIsLoading(true);
            console.log("List of Ids: ", ids);

            // Call delete API
            const response = await EventsApi.deleteEvent(ids, currentMunicipality.slug);

            setIsLoading(false);

            if (response.success) {
                setSelectedItems([]);

                // After deletion, check if current page would be empty
                // If yes and not page 1, go back one page
                const remainingItemsOnPage = eventList.length - ids.length;
                const newTotalItems = totalItems - ids.length;
                const newLastPage = Math.ceil(newTotalItems / perPage);

                if (remainingItemsOnPage <= 0 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    // Reload current page
                    loadEvents(currentPage);
                }

                // Update total items and last page
                setTotalItems(newTotalItems);
                setLastPage(newLastPage);
            } else {
                console.log('Delete failed:', response);
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Delete error:', error);
        }
    };

    const handleSuccess = (data: EventFormData, isEdit: boolean) => {
        setAddEventDialog({ isOpen: false, editData: null });

        if (isEdit) {
            // Update existing item
            setEventList((prevList) =>
                prevList.map((item) =>
                    item.id === data.id ? { ...item, ...data } : item
                )
            );
        } else {
            // Add new item at the beginning with created_at
            const newItem: EventDataList = {
                ...data,
                created_at: new Date().toISOString(),
            };

            setEventList((prevList) => {
                const newList = [newItem, ...prevList];
                return newList.slice(0, perPage);
            });

            // Update total items
            setTotalItems((prev) => prev + 1);

            // Recalculate last page
            setLastPage(Math.ceil((totalItems + 1) / perPage));

            // If not on page 1, go back to page 1
            if (currentPage !== 1) {
                setCurrentPage(1);
            }
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= lastPage) {
            setCurrentPage(page);
            // useEffect will trigger loadEvents
        }
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === eventList.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(eventList.map((item) => item.id));
        }
    };

    const toggleSelectItem = (id: string) => {
        setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const handleSort = (currentSelectedSort: string | null) => {
        console.log('Event selected filter: ', currentSelectedSort);
        // Implement server-side filtering here in the future
    };

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

            <div className="mb-2 flex items-center justify-between">
                <div>
                    <Button
                        size="sm"
                        disabled={selectedItems.length <= 0}
                        className="border-none bg-red-600 text-white hover:bg-red-700"
                        onClick={() =>
                            setClassicDialog((prev) => ({
                                ...prev,
                                isOpen: true,
                                title: 'Confirm',
                                message: `Are you sure you want to delete ${selectedItems.length} selected announcement(s)?`,
                                positiveButtonText: 'Delete',
                                negativeButtonText: 'Cancel',
                                payload: selectedItems,
                                action: 'delete', // Ensure action is set
                                selectedItemId: selectedItems, // Ensure IDs are passed
                            }))
                        }
                    >
                        Delete ({selectedItems.length}) items
                    </Button>
                </div>
            </div>

            {/* TABLE */}
            <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-200">
                <Table className="w-full table-auto">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="w-12">
                                <div className="flex items-center justify-center p-2">
                                    <input
                                        disabled={eventList.length === 0}
                                        type="checkbox"
                                        className="h-4 w-4 cursor-pointer"
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
                            <AdminEmptyListItem colSpan={7} title="No Events yet." message="Events you created will appear here." />
                        ) : (
                            eventList.map((item, index) => {
                                const status = getEventStatus(item.event_date);
                                // Calculate correct row number across pages
                                const rowNumber = (currentPage - 1) * perPage + (index + 1);

                                return (
                                    <TableRow key={item.id} className="transition-colors hover:bg-gray-50">
                                        <TableCell>
                                            <div className="flex items-center justify-center p-2">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 cursor-pointer"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => toggleSelectItem(item.id)}
                                                />
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center">{rowNumber}</TableCell>
                                        <TableCell>{item.title}</TableCell>
                                        <TableCell className="max-w-[350px]">
                                            <div
                                                className="overflow-hidden"
                                                style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {item.description}
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatDate(item.event_date)}</TableCell>
                                        <TableCell>{getStatusBadge(status)}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setAddEventDialog({ isOpen: true, editData: item })}
                                                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Pencil size={14} />
                                                </Button>
                                                {/* Uncommented and fixed Trash button for single delete */}
                                                {/* <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setClassicDialog({
                                                            isOpen: true,
                                                            title: 'Confirm',
                                                            message: 'Delete this event?',
                                                            positiveButtonText: 'Delete',
                                                            negativeButtonText: 'Cancel',
                                                            isNegativeButtonHidden: false,
                                                            action: 'delete',
                                                            selectedItemId: [item.id], // Pass ID as array
                                                        })
                                                    }
                                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 size={14} />
                                                </Button> */}
                                            </div>
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
                    totalPages={lastPage} // mapped from meta.last_page
                    totalItems={totalItems} // mapped from meta.total
                    itemsPerPage={perPage} // mapped from meta.per_page
                    onPageChange={(page) => handlePageChange(page)}
                />
            </div>

            <FilterDialog
                isOpen={isFilterOpened}
                onClose={function (): void {
                    setIsFilterOpened(false);
                }}
                filters={[
                    { title: 'Title', sub: 'title' },
                    { title: 'Description', sub: 'description' },
                    { title: 'Event Date', sub: 'event_date' },
                    { title: 'Date Created', sub: 'created_at' },
                ]}
                currentFilter={currentFilter}
                onApply={(selectedFilter) => {
                    setCurrentFilter(selectedFilter);

                    if (selectedFilter) {
                        handleSort(selectedFilter?.sub);
                    }
                }}
            />

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
                    if (classicDialog.action === 'delete') {
                        handleDeleteEvent(classicDialog.selectedItemId);
                    }
                }}
                onNegativeClick={() => setClassicDialog((p) => ({ ...p, isOpen: false }))}
            />

            <LoadingDialog isOpen={isLoading} />

            {showScrollTop && (
                <Button
                    size="icon"
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-50 h-9 w-9 rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800"
                    aria-label="Scroll to top"
                >
                    ↑
                </Button>
            )}
        </div>
    );
}
