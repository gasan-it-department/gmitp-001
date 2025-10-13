import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Utility from '@/pages/Utility/Utility';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface EventDataList {
    eventName: string;
    date: string;
    eventDescription: string;
    id: string;
}

export default function EventsCalendarUi() {
    const [seasonalTheme, setSeasonalTheme] = useState(true);
    const [dashboardList, setDashboardList] = useState<EventDataList[]>([]);

    const data: EventDataList[] = [
        {
            id: 'TXN-001',
            eventName: 'Municipal Clean-Up Drive',
            eventDescription:
                'Join us this coming October 12, 2025, for the annual Clean-Up Drive. Volunteers will gather at the Municipal Hall at 6:00 AM before heading to assigned cleanup zones. Let’s work together for a cleaner and greener Gasan!',
            date: '1759813952', // October 12, 2025
        },
        {
            id: 'TXN-002',
            eventName: 'Halloween Night Celebration',
            eventDescription:
                'Dress up and join the Halloween Night Celebration at the Town Plaza on October 31, 2025, 7:00 PM onwards. Enjoy fun activities, costume contests, food stalls, and live performances!',
            date: '1762492292', // October 31, 2025
        },
        {
            id: 'TXN-003',
            eventName: 'All Saints’ Day Candle Lighting Ceremony',
            eventDescription:
                'A solemn candle lighting event will be held at the municipal cemetery on November 1, 2025, to honor our dearly departed. Residents are invited to participate and observe proper decorum.',
            date: '1762588692', // November 1, 2025
        },
        {
            id: 'TXN-004',
            eventName: 'Christmas Tree Lighting Ceremony',
            eventDescription:
                'Celebrate the spirit of Christmas as we light up the town’s Christmas tree at the Municipal Hall on December 5, 2025, at 6:00 PM. Enjoy performances, food booths, and holiday music!',
            date: '1764919200', // December 5, 2025
        },
        {
            id: 'TXN-005',
            eventName: 'New Year’s Countdown Celebration',
            eventDescription:
                'Join us for the grand New Year’s Countdown at the Town Plaza on December 31, 2025. Witness fireworks, live bands, and welcome 2026 with joy and unity!',
            date: '1767116400', // December 31, 2025
        },
    ];


    useEffect(() => {
        setDashboardList(data);
    }, []);

    return (
        <div className="mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Upcoming Events
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        Stay updated on upcoming municipal events and activities.
                    </p>
                </div>
            </div>

            {/* Events List (Column layout) */}
            <div className="flex flex-col gap-4 sm:gap-6">
                {dashboardList.length > 0 ? (
                    dashboardList.map((item, index) => {
                        const month = moment(parseInt(item.date, 10) * 1000).format('MM');
                        const isDecember = month === '12' && seasonalTheme;
                        const isNovember = month === '11' && seasonalTheme;

                        return (
                            <motion.div
                                key={item.id}
                                className="cursor-pointer active:scale-[0.97] hover:scale-[1.02] transition-transform duration-200 ease-in-out"
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
                                    className={`relative overflow-hidden p-5 rounded-xl shadow-md transition-all duration-300 ${isDecember
                                        ? 'bg-gradient-to-br from-green-700 via-green-600 to-green-500'
                                        : isNovember
                                            ? 'bg-gradient-to-br from-[#2e0233] via-[#3c063d] to-[#5e1a00]'
                                            : 'bg-gradient-to-br from-red-50 via-orange-50 to-amber-100 dark:from-red-950 dark:via-orange-950 dark:to-amber-900'
                                        }`}
                                >
                                    {/* Floating Ribbon */}
                                    <div
                                        className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm ${isDecember
                                            ? 'bg-red-600 text-white'
                                            : isNovember
                                                ? 'bg-orange-600 text-black'
                                                : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                                            }`}
                                    >
                                        {Utility().calculateArrivingDays(item.date)}
                                    </div>

                                    {/* Date and Info */}
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        {/* Date Box */}
                                        <div
                                            className={`flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-lg font-semibold shadow-md border ${isDecember
                                                ? 'bg-green-800 text-white border-green-900'
                                                : isNovember
                                                    ? 'bg-gradient-to-br from-orange-700 to-black text-orange-200 border-orange-800'
                                                    : 'bg-gradient-to-br from-red-400 to-orange-400 text-white border-red-300 dark:border-orange-800'
                                                }`}
                                        >
                                            <span className="text-xs sm:text-sm uppercase leading-none">
                                                {moment(parseInt(item.date, 10) * 1000).format('MMM')}
                                            </span>
                                            <span className="text-lg sm:text-xl font-bold leading-none">
                                                {moment(parseInt(item.date, 10) * 1000).format('DD')}
                                            </span>
                                        </div>

                                        {/* Event Text */}
                                        <div className="flex flex-col min-w-0 flex-grow">
                                            <span
                                                className={`text-xs sm:text-sm font-semibold ${isDecember
                                                    ? 'text-red-100'
                                                    : isNovember
                                                        ? 'text-orange-300'
                                                        : 'text-red-700 dark:text-amber-400'
                                                    }`}
                                            >
                                                {moment(parseInt(item.date, 10) * 1000).format('YYYY')}
                                            </span>
                                            <h3
                                                className={`text-base sm:text-lg font-semibold truncate ${isDecember
                                                    ? 'text-white'
                                                    : isNovember
                                                        ? 'text-orange-200'
                                                        : 'text-red-900 dark:text-orange-100'
                                                    }`}
                                            >
                                                {item.eventName}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p
                                        className={`mt-3 text-sm sm:text-base line-clamp-3 ${isDecember
                                            ? 'text-white/90'
                                            : isNovember
                                                ? 'text-orange-100'
                                                : 'text-orange-800 dark:text-orange-200'
                                            }`}
                                    >
                                        {item.eventDescription}
                                    </p>
                                </Card>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="p-4 text-center text-sm sm:text-base border rounded-lg text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                        No events yet
                    </div>
                )}
            </div>

            {/* View More Button */}
            {dashboardList.length > 0 && (
                <div className="w-full flex justify-end items-end mt-6">
                    <Button variant="outline">View More</Button>
                </div>
            )}
        </div>

    );
}
