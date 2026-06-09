import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import Utility from '@/pages/Utility/Utility';
import event from '@/routes/event';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useState } from 'react';
import { ViewEventDetails } from './ViewEventDetails';

interface Event {
    id: string;
    title: string;
    description: string;
    type: {
        value: string;
        label: string;
    };
    start_datetime: string;
    end_datetime: string;
    location_name: string;
    banner_url: string | null;
    created_at: string;
}

interface Props {
    events: PaginatedResponse<Event>;
}

export default function EventsCalendarUi({ events }: Props) {
    const [isEventDetailDialogShowing, setIsEventDialogShowing] = useState(false);
    const [selectedEventData, setSelectedEventData] = useState<any | null>(null);
    const { currentMunicipality } = useMunicipality();

    const dashboardList = events.data;

    return (
        <div className="mx-auto w-full px-4 py-5 sm:px-5 lg:px-6">
            <div className="mb-5 flex flex-col items-start justify-between gap-3 border-b border-primary/10 pb-4 sm:flex-row sm:items-center">
                <div>
                    <span className="text-xs font-bold tracking-widest text-primary uppercase">Event Space</span>
                    <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">Upcoming Events</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Municipal activities, programs, and community gatherings.</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
                {dashboardList.length > 0 ? (
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
                                    className="relative overflow-hidden rounded-lg border border-border/70 bg-background p-4 shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-md hover:shadow-primary/10"
                                >
                                    {/* Days Remaining Badge */}
                                    <div className="absolute top-2 right-2 rounded-full border border-primary/10 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase shadow-sm">
                                        {Utility().calculateArrivingDays(item.start_datetime)}
                                    </div>

                                    <div className="flex items-center gap-3 sm:gap-4">
                                        {/* Date Box */}
                                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg border border-primary/20 bg-primary font-semibold text-primary-foreground shadow-sm shadow-primary/20 sm:h-14 sm:w-14">
                                            <span className="text-xs leading-none uppercase opacity-80 sm:text-sm">
                                                {moment(item.start_datetime, 'MMM DD, YYYY g:i A').format('MMM')}
                                            </span>
                                            <span className="text-lg leading-none font-bold sm:text-xl">
                                                {moment(item.start_datetime, 'MMM DD, YYYY g:i A').format('DD')}
                                            </span>
                                        </div>

                                        <div className="flex min-w-0 flex-grow flex-col">
                                            <span className="text-xs font-semibold text-muted-foreground sm:text-sm">
                                                {moment(item.start_datetime, 'MMM DD, YYYY g:i A').format('YYYY')}
                                            </span>
                                            <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">{item.title}</h3>
                                        </div>
                                    </div>

                                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground sm:text-base">{item.description}</p>
                                </Card>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="rounded-lg border border-dashed border-primary/20 bg-background/70 p-8 text-center text-sm text-muted-foreground sm:text-base">
                        No events yet
                    </div>
                )}
            </div>

            {dashboardList.length > 0 && (
                <div className="mt-5 flex w-full items-end justify-end">
                    <Button className="rounded-lg" variant="outline" onClick={() => router.visit(event.index.url(currentMunicipality.slug))}>
                        View More
                    </Button>
                </div>
            )}

            <ViewEventDetails isOpen={isEventDetailDialogShowing} data={selectedEventData} onClose={() => setIsEventDialogShowing(false)} />
        </div>
    );
}
