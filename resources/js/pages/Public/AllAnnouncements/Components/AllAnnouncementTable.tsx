import { Card } from '@/components/ui/card';
import { AnnouncementApi } from '@/Core/Api/BulletinBoard/AnnouncementApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { AnnouncementData } from '@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes';
import LoadingSpinner from '@/pages/Utility/LoadingSpinner';
import PaginationView from '@/pages/Utility/PaginationView';
import Utility from '@/pages/Utility/Utility';
import { home } from '@/routes';
import { router } from '@inertiajs/react';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ViewAnnouncementDetails } from '../../Home/Components/ViewAnnouncementDetails';

export default function AllAnnouncementTable() {
    const [isLoadingDialogVisible, setIsLoadingDialogVisible] = useState(false);
    const [announcementList, setAnnouncementList] = useState<AnnouncementData[]>([]);
    const { currentMunicipality } = useMunicipality();
    const [currentPage, setCurrentPage] = useState(1);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Pagination State
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

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

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentPage]);

    const loadAnnouncements = async (currentPage: number = 1) => {
        try {
            setIsLoadingDialogVisible(true);
            const response = await AnnouncementApi.getPublishedAnnouncements(currentMunicipality.slug, currentPage);
            if (response.success) {
                console.log('All announcement response: ', response);
                setAnnouncementList(response.data);
                setIsLoadingDialogVisible(false);
            }

            setLastPage(response.meta.last_page);
            setPerPage(response.meta.per_page);
            setTotalItems(response.meta.total);
        } catch (error: any) {
            console.error(error);
        } finally {
            setIsLoadingDialogVisible(false);
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10 lg:flex-row lg:px-10">
            <div className="flex flex-1 flex-col">
                {/* Back Button - Theme Updated */}
                <button
                    onClick={() => router.visit(home.url({ municipality: currentMunicipality.slug }))}
                    className="mb-3 inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 sm:text-sm"
                >
                    ← Back
                </button>

                {/* Header - Theme Updated */}
                <div className="px-2 sm:px-4">
                    <h2 className="text-xl font-semibold text-foreground sm:text-2xl">General Announcements</h2>
                    <p className="mt-1 text-sm text-muted-foreground sm:text-base">
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
                                            // Theme Update: 'bg-card', 'border-border', 'border-l-primary'
                                            className="relative cursor-pointer overflow-hidden rounded-xl border border-border border-l-4 border-l-primary bg-card p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg sm:p-5"
                                            onClick={() => {
                                                setAnnouncementDetailsDialog((prev) => ({
                                                    ...prev,
                                                    isOpen: true,
                                                    data: item,
                                                }));
                                            }}
                                        >
                                            {/* Time Badge: Uses 'secondary' theme */}
                                            <div className="absolute top-2 right-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground shadow-sm sm:top-3 sm:right-3 sm:text-xs">
                                                {Utility().formatTimeAgo(item.created_at)}
                                            </div>

                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                                {/* Icon Box: Uses 'muted' theme */}
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-muted shadow-sm sm:h-12 sm:w-12">
                                                    <img
                                                        src="/assets/announcement.png"
                                                        alt="Notice Icon"
                                                        className="h-5 w-5 opacity-80 sm:h-6 sm:w-6"
                                                    />
                                                </div>

                                                <div className="flex min-w-0 flex-grow flex-col">
                                                    {/* Title: Uses 'foreground' */}
                                                    <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">
                                                        {item.title.length > 100 ? `${item.title.slice(0, 100)}…` : item.title}
                                                    </h3>
                                                    {/* Description: Uses 'muted-foreground' */}
                                                    <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground sm:text-[13px]">
                                                        {item.message.length > 100 ? `${item.message.slice(0, 100)}…` : item.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                /* Empty State */
                                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                                    No announcements yet
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* PAGINATION */}
                <div className="mt-4">
                    <PaginationView
                        currentPage={currentPage}
                        totalPages={lastPage}
                        totalItems={totalItems}
                        itemsPerPage={perPage}
                        onPageChange={setCurrentPage}
                    />
                </div>

                {/* Announcement Details Dialog */}
                <ViewAnnouncementDetails
                    isOpen={announcementDetailsDialog.isOpen}
                    data={announcementDetailsDialog.data}
                    onClose={() => {
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
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        // Theme Update: 'bg-primary'
                        className="fixed right-6 bottom-6 z-50 rounded-full bg-primary p-3 text-primary-foreground shadow-lg transition hover:scale-110 hover:bg-primary/90"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
}