import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FeedbackApi } from '@/Core/Api/Feedback/FeedbackApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { AnnouncementData } from '@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import LoadingSpinner from '@/pages/Utility/LoadingSpinner';
import Utility from '@/pages/Utility/Utility';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ViewAnnouncementDetails } from './ViewAnnouncementDetails';
import { AnnouncementApi } from '@/Core/Api/BulletinBoard/AnnouncementApi';
import { announcements } from '@/routes';

export default function GeneralAnnouncement() {
    const { currentMunicipality } = useMunicipality();
    const [announcementList, setAnnouncementList] = useState<AnnouncementData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [classicDialog, setClassicDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
        isNegativeButtonHidden: false,
        action: '',
    });
    const [announcementDetailsDialog, setAnnouncementDetailsDialog] = useState<{
        isOpen: boolean;
        data: AnnouncementData | null;
    }>({
        isOpen: false,
        data: null,
    });

    useEffect(() => {
        loadAnnouncement();
    }, []);

    async function loadAnnouncement() {
        try {
            setIsLoading(true);
            // const response = await AnnouncementApi.getPublishedAnnouncements(currentMunicipality.slug);
            const response = await AnnouncementApi.getPublishedAnnouncements(currentMunicipality.slug);
            if (response.success) {
                console.log('Announcements:', response.data);
                const sorted = [...response.data].sort((a, b) => {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });
                setAnnouncementList(sorted);
            } else {
                setClassicDialog((prev) => ({
                    ...prev,
                    isOpen: true,
                    title: 'An error occurred!',
                    message: 'Failed to load announcement. Please check your Internet connection and try again.',
                    positiveButtonText: 'Close',
                    isNegativeButtonHidden: true,
                }));
            }
        } catch (error: any) {
            console.error('Error fetching announcements:', error);
            setClassicDialog((prev) => ({
                ...prev,
                isOpen: true,
                title: 'An error occurred!',
                message: error,
                positiveButtonText: 'Close',
                isNegativeButtonHidden: true,
            }));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10 lg:flex-row lg:px-10">
            <div className="flex flex-1 flex-col">
                <div className="px-2 sm:px-4">
                    <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-gray-100">General Announcements</h2>
                    <p className="mt-1 text-sm text-gray-600 sm:text-base dark:text-gray-400">
                        Stay updated with important notices, reminders, and community information.
                    </p>
                </div>

                <div className="mt-4 w-full flex-1 bg-transparent sm:mt-6">
                    {isLoading ? (
                        <div className="flex w-full items-center justify-center py-4">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                            {/* ANNOUNCEMENTS */}
                            {announcementList.length > 0 ? (
                                <div className="flex flex-col space-y-4">
                                    {announcementList.slice(0, 5).map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            onClick={() => {
                                                setAnnouncementDetailsDialog((prev) => ({
                                                    ...prev,
                                                    isOpen: true,
                                                    data: item,
                                                }));
                                            }}
                                            className="cursor-pointer transition-transform active:scale-[0.98]"
                                            initial={{ opacity: 0, x: -80 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true, amount: 0.2 }}
                                            transition={{
                                                duration: 0.2,
                                                delay: index * 0.1,
                                                ease: [0.25, 0.1, 0.25, 1],
                                            }}
                                        >
                                            <Card className="relative overflow-hidden rounded-xl border-l-4 border-red-500 bg-gradient-to-br from-red-50 via-orange-50 to-amber-100/70 p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl sm:p-5 dark:from-red-950 dark:via-orange-950 dark:to-amber-900">
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
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-orange-200 bg-gradient-to-r from-red-50 to-orange-50 p-4 text-center text-[12px] text-red-500 sm:text-sm dark:from-red-950 dark:to-orange-950 dark:text-orange-300">
                                    No announcement yet
                                </div>
                            )}

                            {/* VIEW MORE BUTTON */}
                            {announcementList.length > 0 && (
                                <div className="mt-6 flex w-full justify-end">
                                    <Button
                                        variant="outline"
                                        className="text-sm sm:text-base"
                                        onClick={() => {
                                            router.visit(announcements.url(currentMunicipality.slug))
                                        }}
                                    >
                                        View More
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>

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

                <ClassicDialog
                    title={classicDialog.title}
                    message={classicDialog.message}
                    positiveButtonText={classicDialog.positiveButtonText}
                    negativeButtonText={classicDialog.negativeButtonText}
                    hideNegativeButton={classicDialog.isNegativeButtonHidden}
                    open={false}
                    onPositiveClick={() => {
                        setClassicDialog((prev) => ({
                            ...prev,
                            isOpen: false,
                        }));
                    }}
                    onNegativeClick={() => {
                        setClassicDialog((prev) => ({
                            ...prev,
                            isOpen: false,
                        }));
                    }}
                />
            </div>
        </div>
    );
}
