import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface EventDataList {
    eventName: string
    date: string
    eventDescription: string
    id: string
}

export default function EventsCalendarUi() {
    const [dashboardList, setDashboardList] = useState<EventDataList[]>([]);

    {/* Sample Data */ }
    const data: EventDataList[] = [
        {
            id: 'TXN-001',
            eventName: 'Product Launch Q4 OCT',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1759813952',
        },
        {
            id: 'TXN-002',
            eventName: 'Backend Migration NOV',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1762492292',
        },
        {
            id: 'TXN-003',
            eventName: 'Quarterly Sales Review DEC',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1765084292',
        },
        {
            id: 'TXN-004',
            eventName: 'Team Building Workshop JAN',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1767762692',
        },
        {
            id: 'TXN-005',
            eventName: 'Website Redesign Kickoff FEB',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1770441092',
        },
        {
            id: 'TXN-006',
            eventName: 'Website Redesign Kickoff MAR',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1772860292',
        },
        {
            id: 'TXN-007',
            eventName: 'Website Redesign Kickoff APR',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1775538692',
        },
        {
            id: 'TXN-008',
            eventName: 'Website Redesign Kickoff MAY',
            eventDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1778130692',
        },
        {
            id: 'TXN-009',
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
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Upcoming Events
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                </div>

                <div className="mt-4 flex-1 p-3 w-full bg-transparent">
                    {dashboardList.length > 0 ? (
                        dashboardList.slice(0, 5).map((item) => (
                            <Card
                                key={item.id}
                                className="relative p-2 mb-4 cursor-pointer hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors duration-150"
                            >
                                {/* Floating Year Badge */}
                                <span className="absolute -top-1 -left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md rotate-[-20deg] shadow-md">
                                    {moment(parseInt(item.date, 10) * 1000).format("YYYY")}
                                </span>

                                <div className="flex items-center gap-4 mt-2">
                                    {/* Date Block */}
                                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700 w-12 h-12 flex-shrink-0 border border-gray-300 dark:border-gray-600">
                                        <span className="text-xs font-semibold uppercase leading-none text-red-500 p-0.5">
                                            {moment(parseInt(item.date, 10) * 1000).format("MMM")}
                                        </span>
                                        <span className="text-lg font-bold leading-none text-gray-900 dark:text-gray-100 p-0.5">
                                            {moment(parseInt(item.date, 10) * 1000).format("DD")}
                                        </span>
                                    </div>

                                    {/* Event Details */}
                                    <div className="flex flex-col min-w-0 flex-grow">
                                        <span className="truncate-200 text-base font-medium text-gray-900 dark:text-gray-100 block p-0.5">
                                            {item.eventName.length > 200
                                                ? `${item.eventName.slice(0, 200)}…`
                                                : item.eventName}
                                        </span>

                                        <p className="text-[12px] text-gray-600 dark:text-gray-400 w-full block truncate-200 p-0.5">
                                            {item.eventDescription.length > 100
                                                ? `${item.eventDescription.slice(0, 100)}…`
                                                : item.eventDescription}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="p-4 text-center text-[12px] border rounded-lg text-gray-500">
                            No matches found
                        </div>
                    )}

                    <div className='w-full justify-end items-end flex'>
                        <Button
                            variant={'outline'}>
                            More Events
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
