import { Card } from "@/components/ui/card";
import { EventsApi } from "@/Core/Api/BulletinBoard/EventsApi";
import { useMunicipality } from "@/Core/Context/MunicipalityContext";
import { EventData } from "@/Core/Types/BulletinBoard/Events";
import LoadingSpinner from "@/pages/Utility/LoadingSpinner";
import Utility from "@/pages/Utility/Utility";
import { home } from "@/routes";
import { router } from "@inertiajs/react";
import moment from "moment";
import { useState, useEffect } from "react";
import { ViewEventDetails } from "../../Home/Components/ViewEventDetails";

export default function AllEvenntsTable() {
    const [eventList, setEventList] = useState<EventData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [seasonalTheme, setSeasonalTheme] = useState(true);
    const { currentMunicipality } = useMunicipality();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedEventData, setSelectedEventData] = useState<EventData | null>(null);
    const [isEventDetailDialogShowing, setIsEventDialogShowing] = useState(false);

    useEffect(() => {
        loadEvents(currentPage);
    }, [])

    const loadEvents = async (currentPage: number = 1) => {
        try {
            setIsLoading(true);
            // TEST API FOR VIEWING DATA
            const response = await EventsApi.getPublished(currentMunicipality.slug);
            if (response.success) {
                console.log("Response data: ", response);
                setEventList(response.data)
            }

        } catch (error: any) {

        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10 lg:flex-row lg:px-10">
            <div className="flex flex-1 flex-col">
                <button
                    onClick={() => router.visit(home.url({ municipality: currentMunicipality.slug }))}
                    className="mb-3 inline-flex w-fit items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:opacity-90 sm:text-sm"
                >
                    ← Back
                </button>

                <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-gray-100">Upcoming Events</h2>
                        <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">Stay updated on upcoming municipal events and activities.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 sm:gap-6">
                    {isLoading ? (
                        <div className="flex w-full items-center justify-center py-4">
                            <LoadingSpinner />
                        </div>
                    ) : eventList.length > 0 ? (
                        eventList.map((item, index) => {
                            const month = moment(item.event_date).format("MM");
                            const isDecember = month === "12" && seasonalTheme;
                            const isNovember = month === "11" && seasonalTheme;
                            return (
                                <Card
                                    onClick={() => {
                                        setSelectedEventData(item);
                                        setIsEventDialogShowing(true);
                                    }}
                                    className={`cursor-pointer relative overflow-hidden rounded-xl p-5 shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-xl sm:p-5 ${isDecember
                                        ? 'bg-gradient-to-br from-green-700 via-green-600 to-green-500'
                                        : isNovember
                                            ? 'bg-gradient-to-br from-[#2e0233] via-[#3c063d] to-[#5e1a00]'
                                            : 'bg-gradient-to-br from-red-50 via-orange-50 to-amber-100 dark:from-red-950 dark:via-orange-950 dark:to-amber-900'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase shadow-sm ${isDecember
                                            ? 'bg-red-600 text-white'
                                            : isNovember
                                                ? 'bg-orange-600 text-black'
                                                : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                                            }`}
                                    >
                                        {Utility().calculateArrivingDays(item.event_date)}
                                    </div>

                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div
                                            className={`flex h-12 w-12 flex-col items-center justify-center rounded-lg border font-semibold shadow-md sm:h-14 sm:w-14 ${isDecember
                                                ? 'border-green-900 bg-green-800 text-white'
                                                : isNovember
                                                    ? 'border-orange-800 bg-gradient-to-br from-orange-700 to-black text-orange-200'
                                                    : 'border-red-300 bg-gradient-to-br from-red-400 to-orange-400 text-white dark:border-orange-800'
                                                }`}
                                        >
                                            <span className="text-xs leading-none uppercase sm:text-sm">
                                                {moment(item.event_date, 'YYYY-MM-DD HH:mm:ss').format('MMM')}
                                            </span>
                                            <span className="text-lg leading-none font-bold sm:text-xl">
                                                {moment(item.event_date, 'YYYY-MM-DD HH:mm:ss').format('DD')}
                                            </span>
                                        </div>

                                        <div className="flex min-w-0 flex-grow flex-col">
                                            <span
                                                className={`text-xs font-semibold sm:text-sm ${isDecember ? 'text-red-100' : isNovember ? 'text-orange-300' : 'text-red-700 dark:text-amber-400'
                                                    }`}
                                            >
                                                {moment(item.event_date, 'YYYY-MM-DD HH:mm:ss').format('YYYY')}
                                            </span>
                                            <h3
                                                className={`truncate text-base font-semibold sm:text-lg ${isDecember ? 'text-white' : isNovember ? 'text-orange-200' : 'text-red-900 dark:text-orange-100'
                                                    }`}
                                            >
                                                {item.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <p
                                        className={`mt-3 line-clamp-3 text-sm sm:text-base ${isDecember ? 'text-white/90' : isNovember ? 'text-orange-100' : 'text-orange-800 dark:text-orange-200'
                                            }`}
                                    >
                                        {item.description}
                                    </p>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="rounded-lg border bg-gray-50 p-4 text-center text-sm text-gray-500 sm:text-base dark:bg-gray-800 dark:text-gray-400">
                            No events yet
                        </div>
                    )}
                </div>
            </div>

            <ViewEventDetails isOpen={isEventDetailDialogShowing} data={selectedEventData} onClose={() => setIsEventDialogShowing(false)} />

            {/* <ClassicDialog
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
            /> */}
        </div>
    );
}