import ClassicDialog from "@/pages/Utility/ClassicDialog";
import { ViewAnnouncementDetails } from "../../Home/Components/ViewAnnouncementDetails";
import LoadingSpinner from "@/pages/Utility/LoadingSpinner";
import { useEffect, useState } from "react";
import { AnnouncementData } from "@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes";
import { AnnouncementApi } from "@/Core/Api/BulletinBoard/AnnouncementApi";
import { useMunicipality } from "@/Core/Context/MunicipalityContext";
import { Pagination } from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import Utility from "@/pages/Utility/Utility";
import { router } from "@inertiajs/react";
import { home } from "@/routes";
import { ArrowUp } from "lucide-react"; // Travel/arrow icon

export default function AllAnnouncementTable() {
    const [isLoadingDialogVisible, setIsLoadingDialogVisible] = useState(false);
    const [announcementList, setAnnouncementList] = useState<AnnouncementData[]>([]);
    const { currentMunicipality } = useMunicipality();
    const [currentPage, setCurrentPage] = useState(1);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const [announcementDetailsDialog, setAnnouncementDetailsDialog] = useState<{
        isOpen: boolean;
        data: AnnouncementData | null;
    }>({
        isOpen: false,
        data: null,
    });

    useEffect(() => {
        loadAnnouncements(currentPage);

        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const loadAnnouncements = async (currentPage: number = 1) => {
        try {
            setIsLoadingDialogVisible(true);
            const response = await AnnouncementApi.getPublishedAnnouncements(currentMunicipality.slug);
            if (response.success) {
                console.log("All announcement response: ", response);
                setAnnouncementList(response.data);
                setIsLoadingDialogVisible(false);
            }
        } catch (error: any) {

        } finally {
            setIsLoadingDialogVisible(false);
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10 lg:flex-row lg:px-10">
            <div className="flex flex-1 flex-col">
                {/* Back Button */}
                <button
                    onClick={() => router.visit(home.url({ municipality: currentMunicipality.slug }))}
                    className="mb-3 inline-flex w-fit items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:opacity-90 sm:text-sm"
                >
                    ← Back
                </button>

                {/* Header */}
                <div className="px-2 sm:px-4">
                    <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-gray-100">
                        General Announcements
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 sm:text-base dark:text-gray-400">
                        Stay updated with important notices, reminders, and community information.
                    </p>
                </div>

                {/* Announcement List */}
                <div className="mt-4 w-full flex-1 bg-transparent sm:mt-6">
                    {isLoadingDialogVisible ? (
                        <div className="flex w-full items-center justify-center py-4">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                            {announcementList.length > 0 ? (
                                <div className="flex flex-col space-y-4">
                                    {announcementList.map((item, index) => (
                                        <Card
                                            key={index}
                                            className="cursor-pointer relative overflow-hidden rounded-xl border-l-4 border-red-500 bg-gradient-to-br from-red-50 via-orange-50 to-amber-100/70 p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl sm:p-5 dark:from-red-950 dark:via-orange-950 dark:to-amber-900"
                                            onClick={() => {
                                                setAnnouncementDetailsDialog((prev) => ({
                                                    ...prev,
                                                    isOpen: true,
                                                    data: item,
                                                }));
                                            }}
                                        >
                                            <div className="absolute top-2 right-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase shadow-sm sm:top-3 sm:right-3 sm:text-xs">
                                                {Utility().formatTimeAgo(item.created_at)}
                                            </div>

                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-orange-300 bg-gradient-to-br from-red-400 to-orange-400 shadow-md sm:h-12 sm:w-12">
                                                    <img
                                                        src="/assets/announcement.png"
                                                        alt="Notice Icon"
                                                        className="h-5 w-5 opacity-95 drop-shadow-[0_0_2px_rgba(255,255,255,0.6)] sm:h-6 sm:w-6"
                                                    />
                                                </div>

                                                <div className="flex min-w-0 flex-grow flex-col">
                                                    <h3 className="truncate text-base font-semibold text-red-900 sm:text-lg dark:text-orange-100">
                                                        {item.title.length > 100 ? `${item.title.slice(0, 100)}…` : item.title}
                                                    </h3>
                                                    <p className="mt-1 line-clamp-2 text-sm leading-snug text-orange-800 sm:text-[13px] dark:text-orange-200">
                                                        {item.message.length > 100 ? `${item.message.slice(0, 100)}…` : item.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-orange-200 bg-gradient-to-r from-red-50 to-orange-50 p-4 text-center text-[12px] text-red-500 sm:text-sm dark:from-red-950 dark:to-orange-950 dark:text-orange-300">
                                    No announcement yet
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Pagination */}
                <Pagination />

                <ViewAnnouncementDetails
                    isOpen={announcementDetailsDialog.isOpen}
                    data={announcementDetailsDialog.data}
                    onClose={function (): void {
                        setAnnouncementDetailsDialog((prev) => ({
                            ...prev,
                            isOpen: false,
                            data: null,
                        }));
                    }}
                />

                {/* Floating Scroll-to-Top Button */}
                {showScrollTop && (
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-r from-red-500 to-orange-500 p-3 text-white shadow-lg transition hover:scale-110"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
}
