import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnnouncementApi } from '@/Core/Api/BulletinBoard/AnnouncementApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { AnnouncementData } from '@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import Utility from '@/pages/Utility/Utility';
import { Megaphone } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GeneralAnnouncementList() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [announcementList, setAnnouncementList] = useState<AnnouncementData[]>([]);
    const { currentMunicipality } = useMunicipality();

    const handlePageChange = (page: number, totalPages: number) => {
        console.log('Current page: ', page);
        console.log('Total pages: ', totalPages);
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
        } catch (error: any) {}
    }

    return (
        <PublicLayout title="Announcements" description="">
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
                {/* Header */}
                <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
                    <div className="rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 p-3 text-white shadow-md">
                        <Megaphone className="h-7 w-7" />
                    </div>
                    <h1 className="text-center text-2xl font-bold text-gray-800 sm:text-left sm:text-3xl dark:text-gray-100">
                        General Announcements
                    </h1>
                </div>

                {/* Announcement Cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {announcementList.map((item) => (
                        <Card
                            key={item.id}
                            className="group relative overflow-hidden rounded-2xl border-none bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 shadow-lg transition-all duration-300 hover:shadow-xl dark:from-gray-900 dark:via-orange-900/20 dark:to-gray-800"
                        >
                            {/* Decorative overlay gradient */}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent to-white/50 dark:to-gray-900/40"></div>

                            <CardHeader className="relative z-10 px-5 pt-5">
                                <CardTitle className="text-lg font-bold text-red-700 transition-colors group-hover:text-orange-600 sm:text-xl dark:text-orange-200">
                                    {item.title}
                                </CardTitle>
                                <p className="mt-1 text-xs text-gray-500 sm:text-sm dark:text-gray-400">{Utility().formatTimeAgo(item.created_at)}</p>
                            </CardHeader>

                            <CardContent className="relative z-10 px-5 pb-5">
                                <p className="mb-3 line-clamp-4 text-sm leading-relaxed text-gray-700 sm:text-base dark:text-gray-300">
                                    {item.message}
                                </p>
                                <button className="text-sm font-medium text-orange-600 transition-colors hover:text-orange-500 hover:underline sm:text-base">
                                    Read more →
                                </button>
                            </CardContent>

                            {/* Optional icon badge */}
                            <div className="absolute top-4 right-4 rounded-full bg-gradient-to-br from-red-500 to-orange-500 p-2 shadow-md">
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
