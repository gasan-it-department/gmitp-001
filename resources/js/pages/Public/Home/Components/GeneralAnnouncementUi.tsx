import { Card } from "@/components/ui/card";
import moment from "moment";
import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import Utility from "@/pages/Utility/Utility";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";


interface AnnouncementData {
    title: string
    message: string
    date: string
    id: string
}

export default function GeneralAnnouncement() {
    const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);

    const data: AnnouncementData[] = [
        {
            title: 'Suspension of Classes Due to Heavy Rainfall',
            message:
                'All levels, both public and private, are hereby suspended today, October 10, 2025, due to continuous heavy rainfall and flooding in low-lying areas. Please stay indoors and keep safe.',
            date: '1760056824',
            id: 'TXN-001',
        },
        {
            title: 'Power Interruption Notice',
            message:
                'Please be informed that there will be a scheduled power interruption on October 12, 2025, from 8:00 AM to 12:00 NN to give way to maintenance activities by the local electric cooperative. We apologize for the inconvenience.',
            date: '1760056824',
            id: 'TXN-002',
        },
        {
            title: 'Municipal Hall Maintenance Work',
            message:
                'The Gasan Municipal Hall will be closed on October 14, 2025, for a one-day general cleaning and maintenance. Regular operations will resume on October 15, 2025. Thank you for your understanding.',
            date: '1760056824',
            id: 'TXN-003',
        },
        {
            title: 'Public Advisory on Water Supply',
            message:
                'The Gasan Water District has announced a temporary water service interruption on October 11, 2025, from 10:00 PM to 5:00 AM the following day due to line flushing. Consumers are advised to store enough water for their needs.',
            date: '1760056824',
            id: 'TXN-004',
        },
        {
            title: 'Upcoming Blood Donation Drive',
            message:
                'Join us for the Blood Donation Drive on October 20, 2025, at the Municipal Covered Court from 8:00 AM to 3:00 PM. Let’s save lives together!',
            date: '1760056824',
            id: 'TXN-005',
        },
    ];


    useEffect(() => {
        setAnnouncements(data);
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row gap-8">
            {/* Left Column - Announcements */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="px-2 sm:px-4">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        General Announcements
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                </div>

                <div className="mt-4 sm:mt-6 flex-1 w-full bg-transparent">
                    {/* Announcements */}
                    {announcements.length > 0 ? (
                        <div className="flex flex-col space-y-4">
                            {announcements
                                .filter((item) => {
                                    const eventDate = moment(parseInt(item.date, 10) * 1000);
                                    const now = moment();
                                    const diffDays = eventDate.startOf("day").diff(now.startOf("day"), "days");
                                    return diffDays >= -2;
                                })
                                .slice(0, 5)
                                .map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        onClick={() => console.log("Clicked:", item.title)}
                                        className="cursor-pointer active:scale-[0.98] transition-transform"
                                        initial={{ opacity: 0, x: -80 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, amount: 0.2 }}
                                        transition={{
                                            duration: 0.2,
                                            delay: index * 0.1,
                                            ease: [0.25, 0.1, 0.25, 1],
                                        }}
                                    >
                                        <Card
                                            className="relative overflow-hidden p-4 sm:p-5 border-l-4 border-red-500 
                    bg-gradient-to-br from-red-50 via-orange-50 to-amber-100/70 
                    dark:from-red-950 dark:via-orange-950 dark:to-amber-900 
                    hover:shadow-xl hover:scale-[1.01] transition-all duration-300 rounded-xl"
                                        >
                                            {/* Floating Ribbon */}
                                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full uppercase shadow-sm">
                                                {Utility().formatTimeAgo(item.date)}
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                                {/* Icon Block */}
                                                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg 
                      bg-gradient-to-br from-red-400 to-orange-400 border border-orange-300 
                      shadow-md">
                                                    <img
                                                        src="assets/announcement.png"
                                                        alt="Notice Icon"
                                                        className="w-5 h-5 sm:w-6 sm:h-6 opacity-95 drop-shadow-[0_0_2px_rgba(255,255,255,0.6)]"
                                                    />
                                                </div>

                                                {/* Content Block */}
                                                <div className="flex flex-col min-w-0 flex-grow">
                                                    <h3 className="text-base sm:text-lg font-semibold text-red-900 dark:text-orange-100 truncate">
                                                        {item.title.length > 100 ? `${item.title.slice(0, 100)}…` : item.title}
                                                    </h3>
                                                    <p className="text-sm sm:text-[13px] text-orange-800 dark:text-orange-200 mt-1 leading-snug line-clamp-2">
                                                        {item.message.length > 100 ? `${item.message.slice(0, 100)}…` : item.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-[12px] sm:text-sm border border-orange-200 rounded-lg text-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 dark:text-orange-300">
                            No announcement yet
                        </div>
                    )}

                    {/* View More Button */}
                    {announcements.length > 0 && (
                        <div className="w-full flex justify-end mt-6">
                            <Button variant="outline" className="text-sm sm:text-base">
                                View More
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column (optional) */}
            {/* <div className="flex-1">
    <EventsCalendarUi />
  </div> */}
        </div>

    );
}