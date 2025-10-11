import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import Utility from '@/pages/Utility/Utility';
import { Label } from '@radix-ui/react-label';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface EventDataList {
    eventName: string
    date: string
    eventDescription: string
    id: string
}

export default function EventsCalendarUi() {
    const [seasonalTheme, setSeasonalTheme] = useState(true);
    const [dashboardList, setDashboardList] = useState<EventDataList[]>([]);

    {/* Sample Data */ }
    const data: EventDataList[] = [
        {
            id: 'TXN-001',
            eventName: 'NORMAL THEMED CARD',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1759813952',
        },
        {
            id: 'TXN-002',
            eventName: 'HALLOWEEN THEMED CARD',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1762492292',
        },
        {
            id: 'TXN-003',
            eventName: 'HALLOWEEN THEMED CARD',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1762492292',
        },
        {
            id: 'TXN-004',
            eventName: 'CHRISTMAS THEMED CARD',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1765084292',
        },
        {
            id: 'TXN-005',
            eventName: 'CHRISTMAS THEMED CARD',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1765084292',
        },
        {
            id: 'TXN-006',
            eventName: 'Team Building Workshop JAN',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1767762692',
        },
        {
            id: 'TXN-007',
            eventName: 'Website Redesign Kickoff FEB',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1770441092',
        },
        {
            id: 'TXN-008',
            eventName: 'Website Redesign Kickoff MAR',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1772860292',
        },
        {
            id: 'TXN-009',
            eventName: 'Website Redesign Kickoff APR',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1775538692',
        },
        {
            id: 'TXN-010',
            eventName: 'Website Redesign Kickoff MAY',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1778130692',
        },
        {
            id: 'TXN-011',
            eventName: 'Website Redesign Kickoff JUN',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1780809092',
        },
    ];

    useEffect(() => {
        setDashboardList(data);
    }, []);

    return (
        <div className="mx-auto py-8 sm:py-16 flex flex-col lg:flex-row p-5">
            {/* === RIGHT COLUMN: List === */}
            <div className="flex-1 flex flex-col">
                <div className="px-5">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Upcoming Events
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            </p>
                        </div>

                        {/* <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3">
                            <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="seasonal-theme"
                                        checked={seasonalTheme}
                                        onCheckedChange={setSeasonalTheme}
                                        className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-gray-300"
                                    />
                                    <Label
                                        htmlFor="seasonal-theme"
                                        className="text-sm font-medium text-gray-800 dark:text-gray-200"
                                    >
                                        Season Themed
                                    </Label>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>

                {/* Events List */}
                <div className="mt-4 flex-1 p-3 w-full bg-transparent">
                    {dashboardList.length > 0 ? (
                        dashboardList.slice(0, 5).map((item, index) => {
                            const month = moment(parseInt(item.date, 10) * 1000).format("MM");
                            const isDecember = month === "12" && seasonalTheme;
                            const isNovember = month === "11" && seasonalTheme;

                            return (
                                <motion.div
                                    key={item.id}
                                    onClick={() => console.log("Clicked Event:", item.eventName)}
                                    className="cursor-pointer active:scale-[0.97] hover:scale-[1.02] transition-transform duration-200 ease-in-out"
                                    initial={{ opacity: 0, x: 120 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{
                                        duration: 0.1,
                                        delay: index * 0.15,
                                        ease: [0.25, 0.1, 0.25, 1],
                                    }}
                                >
                                    <Card
                                        className={`relative overflow-hidden p-4 mb-4 rounded-xl shadow-md transition-all duration-300 ${isDecember
                                                ? "bg-gradient-to-br from-green-700 via-green-600 to-green-500"
                                                : isNovember
                                                    ? "bg-gradient-to-br from-[#2e0233] via-[#3c063d] to-[#5e1a00]"
                                                    : "bg-gradient-to-br from-red-50 via-orange-50 to-amber-100 dark:from-red-950 dark:via-orange-950 dark:to-amber-900"
                                            }`}
                                    >
                                        {/* Floating Ribbon */}
                                        <div
                                            className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm ${isDecember
                                                    ? "bg-red-600 text-white"
                                                    : isNovember
                                                        ? "bg-orange-600 text-black"
                                                        : "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                                                }`}
                                        >
                                            {Utility().calculateArrivingDays(item.date)}
                                        </div>

                                        {/* Dot Marker */}
                                        <div
                                            className={`absolute left-[-10px] top-6 w-4 h-4 rounded-full border-2 border-white shadow-md ${isDecember
                                                    ? "bg-red-600"
                                                    : isNovember
                                                        ? "bg-orange-500"
                                                        : "bg-gradient-to-br from-red-500 to-orange-500 dark:border-gray-800"
                                                }`}
                                        ></div>

                                        {/* Date + Event Info */}
                                        <div className="flex items-center gap-3">
                                            {/* Date Box */}
                                            <div
                                                className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg font-semibold shadow-md border ${isDecember
                                                        ? "bg-green-800 text-white border-green-900"
                                                        : isNovember
                                                            ? "bg-gradient-to-br from-orange-700 to-black text-orange-200 border-orange-800"
                                                            : "bg-gradient-to-br from-red-400 to-orange-400 text-white border-red-300 dark:border-orange-800"
                                                    }`}
                                            >
                                                <span className="text-xs uppercase leading-none">
                                                    {moment(parseInt(item.date, 10) * 1000).format("MMM")}
                                                </span>
                                                <span className="text-lg font-bold leading-none">
                                                    {moment(parseInt(item.date, 10) * 1000).format("DD")}
                                                </span>
                                            </div>

                                            {/* Text Content */}
                                            <div className="flex flex-col min-w-0 flex-grow">
                                                <span
                                                    className={`text-sm font-semibold ${isDecember
                                                            ? "text-red-100"
                                                            : isNovember
                                                                ? "text-orange-300"
                                                                : "text-red-700 dark:text-amber-400"
                                                        }`}
                                                >
                                                    {moment(parseInt(item.date, 10) * 1000).format("YYYY")}
                                                </span>
                                                <h3
                                                    className={`text-base font-semibold truncate flex items-center gap-1 ${isDecember
                                                            ? "text-white"
                                                            : isNovember
                                                                ? "text-orange-200"
                                                                : "text-red-900 dark:text-orange-100"
                                                        }`}
                                                >
                                                    {item.eventName}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <p
                                            className={`mt-2 text-sm line-clamp-2 ${isDecember
                                                    ? "text-white/90"
                                                    : isNovember
                                                        ? "text-orange-100"
                                                        : "text-orange-800 dark:text-orange-200"
                                                }`}
                                        >
                                            {item.eventDescription}
                                        </p>
                                    </Card>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="p-4 text-center text-[12px] border rounded-lg text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                            No events yet
                        </div>
                    )}

                    {dashboardList.length > 0 && (
                        <div className="w-full flex justify-end items-end">
                            <Button variant="outline">View More</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
