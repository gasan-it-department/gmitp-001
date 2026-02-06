import { Card } from '@/components/ui/card';
import { EventsApi } from '@/Core/Api/BulletinBoard/EventsApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { EventData } from '@/Core/Types/BulletinBoard/Events';
import LoadingSpinner from '@/pages/Utility/LoadingSpinner';
import PaginationView from '@/pages/Utility/PaginationView';
import Utility from '@/pages/Utility/Utility';
import { home } from '@/routes';
import { router } from '@inertiajs/react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { ViewEventDetails } from '../../Home/Components/ViewEventDetails';

export default function AllEvenntsTable() {
    const [eventList, setEventList] = useState<EventData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { currentMunicipality } = useMunicipality();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedEventData, setSelectedEventData] = useState<EventData | null>(null);
    const [isEventDetailDialogShowing, setIsEventDialogShowing] = useState(false);

    // Pagination State
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        loadEvents(currentPage);
    }, [currentPage]);

    const loadEvents = async (currentPage: number = 1) => {
        try {
            setIsLoading(true);
            const response = await EventsApi.getPublished(currentMunicipality.slug, currentPage);
            if (response.success) {
                console.log('Response data: ', response);
                setEventList(response.data);
            }

            setLastPage(response.last_page);
            setPerPage(response.per_page);
            setTotalItems(response.total);

            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        } catch (error: any) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10 lg:flex-row lg:px-10">
            <div className="flex flex-1 flex-col">
                {/* Back Button - Theme Updated */}
                <button
                    onClick={() => router.visit(home.url({ municipality: currentMunicipality.slug }))}
                    className="mb-3 inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 sm:text-sm"
                >
                    ← Back
                </button>

                {/* Header - Theme Updated */}
                <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Upcoming Events</h2>
                        <p className="text-sm text-muted-foreground sm:text-base">
                            Stay updated on upcoming municipal events and activities.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 sm:gap-6">
                    {isLoading ? (
                        <div className="flex w-full items-center justify-center py-4">
                            <LoadingSpinner />
                        </div>
                    ) : eventList.length > 0 ? (
                        eventList.map((item, index) => {
                            return (
                                <Card
                                    key={index}
                                    onClick={() => {
                                        setSelectedEventData(item);
                                        setIsEventDialogShowing(true);
                                    }}
                                    // Theme Update: 'bg-card', 'border-border'
                                    className="relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-lg sm:p-5"
                                >
                                    {/* Days Remaining Badge: 'bg-secondary', 'text-secondary-foreground' */}
                                    <div className="absolute top-2 right-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground uppercase shadow-sm">
                                        {Utility().calculateArrivingDays(item.event_date)}
                                    </div>

                                    <div className="flex items-center gap-3 sm:gap-4">
                                        {/* Date Box: Primary theme color */}
                                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg border border-primary/20 bg-primary text-primary-foreground font-semibold shadow-sm sm:h-14 sm:w-14">
                                            <span className="text-xs leading-none uppercase opacity-80 sm:text-sm">
                                                {moment(item.event_date, 'YYYY-MM-DD HH:mm:ss').format('MMM')}
                                            </span>
                                            <span className="text-lg leading-none font-bold sm:text-xl">
                                                {moment(item.event_date, 'YYYY-MM-DD HH:mm:ss').format('DD')}
                                            </span>
                                        </div>

                                        <div className="flex min-w-0 flex-grow flex-col">
                                            {/* Year: 'text-muted-foreground' */}
                                            <span className="text-xs font-semibold text-muted-foreground sm:text-sm">
                                                {moment(item.event_date, 'YYYY-MM-DD HH:mm:ss').format('YYYY')}
                                            </span>
                                            {/* Title: 'text-foreground' */}
                                            <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">
                                                {item.title}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Description: 'text-muted-foreground' */}
                                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground sm:text-base">
                                        {item.description}
                                    </p>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground sm:text-base">
                            No events yet
                        </div>
                    )}
                </div>

                {/* PAGINATION */}
                <div className="mt-4">
                    <PaginationView
                        currentPage={currentPage}
                        totalPages={lastPage}
                        totalItems={totalItems}
                        itemsPerPage={perPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            <ViewEventDetails isOpen={isEventDetailDialogShowing} data={selectedEventData} onClose={() => setIsEventDialogShowing(false)} />
        </div>
    );
}