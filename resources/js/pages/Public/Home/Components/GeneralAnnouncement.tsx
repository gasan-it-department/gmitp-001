import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface AnnouncementData {
    title: string;
    message: string;
    date: string;
    id: string;
}

export default function GeneralAnnouncement() {
    const [dashboardList, setDashboardList] = useState<AnnouncementData[]>([]);

    const data: AnnouncementData[] = [
        {
            title: 'Test Title 1',
            message:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1759827102',
            id: 'TXN-001',
        },

        {
            title: 'Test Title 1',
            message:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1759813952',
            id: 'TXN-002',
        },

        {
            title: 'Test Title 1',
            message:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1759813952',
            id: 'TXN-003',
        },
    ];

    useEffect(() => {
        setDashboardList(data);
    }, []);

    return (
        <div className="mx-auto flex flex-col p-5 py-8 sm:py-16 lg:flex-row">
            <div className="flex flex-1 flex-col">
                <div className="px-5">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">General Announcements</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>

                {/* Scrollable List */}
                <div className="mt-4 max-h-[500px] w-full flex-1 overflow-y-auto bg-transparent p-3">
                    {dashboardList.length > 0 ? (
                        dashboardList.map((item) => (
                            <Card
                                key={item.id}
                                className="relative mb-4 cursor-pointer p-2 transition-colors duration-150 hover:bg-orange-50 dark:hover:bg-gray-800"
                            >
                                <div className="mt-2 flex items-center gap-4">
                                    {/* Date Block */}
                                    <div className="bg-gray flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg p-2 dark:bg-orange-400">
                                        <img src="assets/announcement.png" />
                                    </div>

                                    {/* Event Details */}
                                    <div className="flex min-w-0 flex-grow flex-col">
                                        {/* Title */}
                                        <span className="block truncate p-0.5 text-base font-medium text-gray-900 dark:text-gray-100">
                                            {item.title.length > 100 ? `${item.title.slice(0, 100)}…` : item.title}
                                        </span>

                                        {/* Message */}
                                        <p className="block p-0.5 text-[12px] text-gray-600 dark:text-gray-400">
                                            {item.message.length > 100 ? `${item.message.slice(0, 100)}…` : item.message}
                                        </p>

                                        {/* Timestamp aligned to right */}
                                        <div className="flex items-center justify-end">
                                            <span className="mt-2 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-medium text-white dark:bg-gray-700 dark:text-gray-300">
                                                {/* {Utility().formatTimeAgo(item.date)} */}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="rounded-lg border p-4 text-center text-[12px] text-gray-500">No matches found</div>
                    )}
                </div>
            </div>
        </div>
    );
}
