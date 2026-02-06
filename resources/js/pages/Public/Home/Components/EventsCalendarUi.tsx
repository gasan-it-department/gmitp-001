import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EventsApi } from '@/Core/Api/BulletinBoard/EventsApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { EventData } from '@/Core/Types/BulletinBoard/Events';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import LoadingSpinner from '@/pages/Utility/LoadingSpinner';
import Utility from '@/pages/Utility/Utility';
import { events } from '@/routes';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { ViewEventDetails } from './ViewEventDetails';

export default function EventsCalendarUi() {
    const [dashboardList, setDashboardList] = useState<EventData[]>([]);
    const [isEventDetailDialogShowing, setIsEventDialogShowing] = useState(false);
    const [selectedEventData, setSelectedEventData] = useState<EventData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { currentMunicipality } = useMunicipality();

    const [classicDialg, setClassicDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
        isNegativeButtonHidden: false,
        action: '',
    });

    useEffect(() => {
        loadEvents();
    }, []);

    async function loadEvents() {
        try {
            setIsLoading(true);
            const response = await EventsApi.getPublished(currentMunicipality.slug);
            setIsLoading(false);
            if (response.success) {
                const sorted = [...response.data].sort((a, b) => {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });
                setDashboardList(sorted);
            } else {
                setClassicDialog((prev) => ({
                    ...prev,
                    isOpen: true,
                    title: 'An error occurred!',
                    message: 'Failed to load announcement. Please check your Internet connection and try again.',
                    positiveButtonText: 'Close',
                    isNegativeButtonHidden: true,
                }));
            }
        } catch (error: any) {
            setIsLoading(false);
            console.error('Error fetching announcements:', error);
            setClassicDialog((prev) => ({
                ...prev,
                isOpen: true,
                title: 'An error occurred!',
                message: error,
                positiveButtonText: 'Close',
                isNegativeButtonHidden: true,
            }));
        }
    }

    return (
        <div className="mx-auto w-full px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
            <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Upcoming Events</h2>
                    <p className="text-sm text-muted-foreground sm:text-base">Stay updated on upcoming municipal events and activities.</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 sm:gap-6">
                {isLoading ? (
                    <div className="flex w-full items-center justify-center py-4">
                        <LoadingSpinner />
                    </div>
                ) : dashboardList.length > 0 ? (
                    dashboardList.slice(0, 5).map((item, index) => {
                        return (
                            <motion.div
                                key={item.id}
                                className="cursor-pointer transition-transform duration-200 ease-in-out hover:scale-[1.01] active:scale-[0.99]"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{
                                    duration: 0.2,
                                    delay: index * 0.1,
                                    ease: [0.25, 0.1, 0.25, 1],
                                }}
                            >
                                <Card
                                    onClick={() => {
                                        setSelectedEventData(item);
                                        setIsEventDialogShowing(true);
                                    }}
                                    // Theme Update: 'bg-card' and 'border-border'
                                    className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md"
                                >
                                    {/* Days Remaining Badge: 'bg-secondary' with 'text-secondary-foreground' */}
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
                                            <span className="text-xs font-semibold text-muted-foreground sm:text-sm">
                                                {moment(item.event_date, 'YYYY-MM-DD HH:mm:ss').format('YYYY')}
                                            </span>
                                            <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">
                                                {item.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground sm:text-base">
                                        {item.description}
                                    </p>
                                </Card>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground sm:text-base">
                        No events yet
                    </div>
                )}
            </div>

            {dashboardList.length > 0 && (
                <div className="mt-6 flex w-full items-end justify-end">
                    <Button variant="outline" onClick={() => router.visit(events.url(currentMunicipality.slug))}>
                        View More
                    </Button>
                </div>
            )}

            <ViewEventDetails isOpen={isEventDetailDialogShowing} data={selectedEventData} onClose={() => setIsEventDialogShowing(false)} />

            <ClassicDialog
                title={classicDialg.title}
                message={classicDialg.message}
                positiveButtonText={classicDialg.positiveButtonText}
                negativeButtonText={classicDialg.negativeButtonText}
                hideNegativeButton={classicDialg.isNegativeButtonHidden}
                open={classicDialg.isOpen}
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
        </div>
    );
}