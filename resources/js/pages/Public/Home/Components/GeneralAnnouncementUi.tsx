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
            date: '1760056824',
            id: 'TXN-003'
        },
    ];

    useEffect(() => {
        setAnnouncements(data);
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
                <div className="mt-4 flex-1 p-3 w-full bg-transparent">
                    {
                        (announcements.length > 0) &&
                        <Card className="p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-400 rounded-xl shadow-sm">
                            <div className="flex items-start gap-3">
                                {/* Icon (optional) */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>

                                {/* Text */}
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                                        THIS IS PRIORITY ANNOUNCEMENT
                                    </span>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                        Please be advised that maintenance will occur tonight from 2:00 AM to 4:00 AM.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    }


                    <div className="mt-5 mb-5" />

                    {announcements.length > 0 ? (
                        <div>
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
                                        initial={{ opacity: 0, x: -120 }}                // start from right side
                                        whileInView={{ opacity: 1, x: 0 }}              // animate when visible
                                        viewport={{ once: true, amount: 0.2 }}          // trigger only once (20% visible)
                                        transition={{
                                            duration: 0.1,
                                            delay: index * 0.15,
                                            ease: [0.25, 0.1, 0.25, 1],
                                        }}
                                    >
                                        <Card
                                            className="relative overflow-hidden p-4 mb-4 border-l-4 border-red-500 
            bg-gradient-to-br from-red-50 via-orange-50 to-amber-100/70 
            dark:from-red-950 dark:via-orange-950 dark:to-amber-900 
            hover:shadow-xl hover:scale-[1.01] transition-all duration-300 rounded-xl"
                                        >
                                            {/* Floating Ribbon */}
                                            <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm">
                                                {Utility().formatTimeAgo(item.date)}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {/* Icon Block */}
                                                <div className="flex items-center justify-center w-12 h-12 flex-shrink-0 rounded-lg 
                bg-gradient-to-br from-red-400 to-orange-400 border border-orange-300 
                shadow-md">
                                                    <img
                                                        src="assets/announcement.png"
                                                        alt="Notice Icon"
                                                        className="w-6 h-6 opacity-95 drop-shadow-[0_0_2px_rgba(255,255,255,0.6)]"
                                                    />
                                                </div>

                                                {/* Content Block */}
                                                <div className="flex flex-col min-w-0 flex-grow">
                                                    <h3 className="text-base font-semibold text-red-900 dark:text-orange-100 truncate">
                                                        {item.title.length > 100 ? `${item.title.slice(0, 100)}…` : item.title}
                                                    </h3>
                                                    <p className="text-[13px] text-orange-800 dark:text-orange-200 mt-1 leading-snug line-clamp-2">
                                                        {item.message.length > 100 ? `${item.message.slice(0, 100)}…` : item.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-[12px] border border-orange-200 rounded-lg text-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 dark:text-orange-300">
                            No announcement yet
                        </div>
                    )}


                    {
                        (announcements.length > 0) &&
                        <div className='w-full justify-end items-end flex'>
                            <Button
                                variant={'outline'}>
                                View More
                            </Button>
                        </div>
                    }
                </div>
            </div>

        </div>
    );
}