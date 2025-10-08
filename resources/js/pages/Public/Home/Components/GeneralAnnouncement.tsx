import { Card } from "@/components/ui/card";
import moment from "moment";
import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import Utility from "@/pages/Utility/Utility";

interface AnnouncementData {
    title: string
    message: string
    date: string
    id: string
}

export default function GeneralAnnouncement() {
    const [dashboardList, setDashboardList] = useState<AnnouncementData[]>([]);

    const data: AnnouncementData[] = [
        {
            title: 'Test Title 1',
            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1759827102',
            id: 'TXN-001'
        },

        {
            title: 'Test Title 1',
            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1759813952',
            id: 'TXN-002'
        },

        {
            title: 'Test Title 1',
            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.',
            date: '1759813952',
            id: 'TXN-003'
        },
    ];

    useEffect(() => {
        setDashboardList(data);
    }, []);

    return (
        <div className="mx-auto py-8 sm:py-16 flex flex-col lg:flex-row p-5">
            <div className="flex-1 flex flex-col">
                <div className="px-5">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        General Announcements
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                </div>

                {/* Scrollable List */}
                <div className="mt-4 flex-1 overflow-y-auto p-3 w-full bg-transparent max-h-[500px]">
                    {dashboardList.length > 0 ? (
                        dashboardList.map((item) => (
                            <Card
                                key={item.id}
                                className="relative p-2 mb-4 cursor-pointer hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors duration-150"
                            >

                                <div className="flex items-center gap-4 mt-2">
                                    {/* Date Block */}
                                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray dark:bg-orange-400 w-12 h-12 flex-shrink-0">
                                        <img
                                            src="assets/announcement.png" />
                                    </div>

                                    {/* Event Details */}
                                    <div className="flex flex-col min-w-0 flex-grow">
                                        {/* Title */}
                                        <span className="truncate text-base font-medium text-gray-900 dark:text-gray-100 block p-0.5">
                                            {item.title.length > 100
                                                ? `${item.title.slice(0, 100)}…`
                                                : item.title}
                                        </span>

                                        {/* Message */}
                                        <p className="text-[12px] text-gray-600 dark:text-gray-400 block p-0.5">
                                            {item.message.length > 100
                                                ? `${item.message.slice(0, 100)}…`
                                                : item.message}
                                        </p>

                                        {/* Timestamp aligned to right */}
                                        <div className="flex justify-end items-center">
                                            <span className="text-[10px] font-medium text-white dark:text-gray-300 bg-orange-500 dark:bg-gray-700 px-2 py-0.5 rounded-full mt-2">
                                                {Utility().formatTimeAgo(item.date)}
                                            </span>
                                        </div>
                                    </div>

                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="p-4 text-center text-[12px] border rounded-lg text-gray-500">
                            No matches found
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}