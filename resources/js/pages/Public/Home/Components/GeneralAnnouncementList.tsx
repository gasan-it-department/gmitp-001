import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Megaphone } from "lucide-react";
import PublicLayout from "@/layouts/Public/wrapper/PublicLayoutTemplate";
import Utility from "@/pages/Utility/Utility";
import PaginationView from "@/pages/Utility/PaginationView";
import { AnnouncementData } from '@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes';
import { AnnouncementApi } from "@/Core/Api/BulletinBoard/AnnouncementApi";
import { useMunicipality } from "@/Core/Context/MunicipalityContext";

export default function GeneralAnnouncementList() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [announcementList, setAnnouncementList] = useState<AnnouncementData[]>([]);
    const { currentMunicipality } = useMunicipality();

    const handlePageChange = (page: number, totalPages: number) => {
        console.log("Current page: ", page);
        console.log("Total pages: ", totalPages);
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    useEffect(() => {
        loadAnnouncement();
    }, []);

    async function loadAnnouncement() {
        try {
            const response = await AnnouncementApi.getAnnouncement(currentMunicipality.slug);
            if (response.success) {
                setAnnouncementList(response.data);
            } else {
                
            }
        } catch (error: any) {
            
        }
    }

    return (
        <PublicLayout title="Announcements" description="">
            <section className="px-4 sm:px-6 lg:px-10 py-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-center mb-10 gap-4 sm:gap-6">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-md">
                        <Megaphone className="h-7 w-7" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left text-gray-800 dark:text-gray-100">
                        General Announcements
                    </h1>
                </div>

                {/* Announcement Cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {announcementList.map((item) => (
                        <Card
                            key={item.id}
                            className="group relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300
        rounded-2xl bg-gradient-to-br from-orange-50 via-red-50 to-orange-100
        dark:from-gray-900 dark:via-orange-900/20 dark:to-gray-800"
                        >
                            {/* Decorative overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/50 dark:to-gray-900/40 pointer-events-none"></div>

                            <CardHeader className="relative z-10 px-5 pt-5">
                                <CardTitle className="text-lg sm:text-xl font-bold text-red-700 dark:text-orange-200 group-hover:text-orange-600 transition-colors">
                                    {item.title}
                                </CardTitle>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {Utility().formatTimeAgo(item.created_at)}
                                </p>
                            </CardHeader>

                            <CardContent className="relative z-10 px-5 pb-5">
                                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 line-clamp-4 leading-relaxed mb-3">
                                    {item.message}
                                </p>
                                <button className="text-sm sm:text-base font-medium text-orange-600 hover:text-orange-500 hover:underline transition-colors">
                                    Read more →
                                </button>
                            </CardContent>

                            {/* Optional icon badge */}
                            <div className="absolute top-4 right-4 p-2 rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-md">
                                <Megaphone className="h-5 w-5 text-white" />
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Pagination
                <div className="flex flex-wrap justify-center items-center gap-2 mt-10">
                    <PaginationView
                        maxVisible={3}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={currentItems.length}
                        itemsPerPage={5} />
                </div> */}
            </section>
        </PublicLayout>
    );
}
