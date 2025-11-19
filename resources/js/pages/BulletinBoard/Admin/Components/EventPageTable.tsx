import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EventsApi } from '@/Core/Api/BulletinBoard/EventsApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import type { EventFormData } from '@/Core/Types/BulletinBoard/Events';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import { CheckCircle2, Clock, Pencil, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddEditEventsDialog from './AddEditEventsDialog';
import BulletinHeader from './BulletinHeader';

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
    const [addEventDialog, setAddEventDialog] = useState<{
        isOpen: boolean;
        editData: EventFormData | null;
    }>({
        isOpen: false,
        editData: null,
    });
    const getEventStatus = (eventDate: string): 'Upcoming' | 'Ongoing' | 'Completed' => {
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
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
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
            default:
                return null;
        }
    };

    const handleDelete = (id: string) => {
        setClassicDialog((prev) => ({
            ...prev,
            isOpen: true,
            title: 'Confirm',
            message: 'Are you sure you want to delete this event?',
            positiveButtonText: 'Delete',
            negativeButtonText: 'Cancel',
            isNegativeButtonHidden: false,
        }));
    };

    const [classicDialog, setClassicDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
        isNegativeButtonHidden: false,
    });

    const { currentMunicipality } = useMunicipality();

    useEffect(() => {
        loadEvents();
    }, []);

    async function loadEvents() {
        try {
            setIsLoading(true);
            const response = await EventsApi.fetch(currentMunicipality.slug);

            setIsLoading(false);
            if (response.success) {
                const sorted = [...response.data].sort((a, b) => {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });
                setEventList(sorted);
            } else {
                // setClassicDialog((prev) => ({
                //     ...prev,
                //     isOpen: true,
                //     title: "An error occurred!",
                //     message: "Failed to load announcement. Please check your Internet connection and try again.",
                //     positiveButtonText: "Close",
                //     isNegativeButtonHidden: true,
                // }));
            }
        } catch (error: any) {
            setIsLoading(false);
            // console.error('Error fetching announcements:', error);
            // setClassicDialog((prev) => ({
            //     ...prev,
            //     isOpen: true,
            //     title: "An error occurred!",
            //     message: error,
            //     positiveButtonText: "Close",
            //     isNegativeButtonHidden: true,
            // }));
        }
    }

    return (
        <div>
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Event List</h1>
                <BulletinHeader
                    onSearch={() => {}}
                    onFilterButtonClicked={() => {}}
                    onExportButtonClicked={() => {}}
                    onAddNewButtonClicked={() => setAddEventDialog({ isOpen: true, editData: null })}
                />
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="text-[12px] font-bold">Event Title</TableHead>
                            <TableHead className="text-[12px] font-bold">Description</TableHead>
                            <TableHead className="text-[12px] font-bold">Event Date</TableHead>
                            <TableHead className="text-[12px] font-bold">Status</TableHead>
                            <TableHead className="text-center text-[12px] font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {eventList.length === 0 ? (
                            <AdminEmptyListItem title="No Events yet." message="Events you created will appear here." />
                        ) : (
                            eventList.map((item) => {
                                const status = getEventStatus(item.created_at);
                                return (
                                    <TableRow key={item.id} className="transition-colors hover:bg-gray-50">
                                        <TableCell className="text-[13px] font-medium">{item.title}</TableCell>

                                        <TableCell className="max-w-[300px] text-[12px]">
                                            <span
                                                className="block overflow-hidden text-ellipsis"
                                                style={{
                                                    display: '-webkit-box',
                                                    WebkitBoxOrient: 'vertical',
                                                    WebkitLineClamp: 3,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'normal',
                                                    lineHeight: '1.4em',
                                                    maxHeight: '4.2em',
                                                }}
                                            >
                                                {item.description}
                                            </span>
                                        </TableCell>

                                        <TableCell>{formatDate(item.event_date)}</TableCell>

                                        <TableCell className="text-[12px]">{getStatusBadge(status)}</TableCell>

                                        <TableCell className="flex justify-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={
                                                    () => {}
                                                    // setAddEventDialog({
                                                    //     isOpen: true,
                                                    //     editData: item,
                                                    // })
                                                }
                                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                            >
                                                <Pencil size={14} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDelete(item.id)}
                                                className="border-red-200 text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ADD/EDIT DIALOG */}
            <AddEditEventsDialog
                isOpen={addEventDialog.isOpen}
                editData={addEventDialog.editData}
                onClose={() => setAddEventDialog({ isOpen: false, editData: null })}
            />

            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                hideNegativeButton={classicDialog.isNegativeButtonHidden}
                open={classicDialog.isOpen}
                positiveButtonText={classicDialog.positiveButtonText}
                negativeButtonText={classicDialog.negativeButtonText}
                onPositiveClick={() => {
                    setClassicDialog((prev) => ({
                        ...prev,
                        isOpen: false,
                    }));
                }}
                onNegativeClick={() => {
                    setClassicDialog((prev) => ({
                        ...prev,
                        isOpen: false,
                    }));
                }}
            />

            <LoadingDialog isOpen={isLoading} />
        </div>
    );
}
