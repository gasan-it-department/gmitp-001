import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AnnouncementApi } from '@/Core/Api/BulletinBoard/AnnouncementApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { AnnouncementData } from '@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import LoadingSpinner from '@/pages/Utility/LoadingSpinner';
import Utility from '@/pages/Utility/Utility';
import { announcements } from '@/routes';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ViewAnnouncementDetails } from './ViewAnnouncementDetails';

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
            const response = await AnnouncementApi.getPublishedAnnouncements(currentMunicipality.slug);
            if (response.success) {
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
        <div className="mx-auto w-full px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
            <div className="flex flex-1 flex-col">
                <div>
                    {/* Updated to use semantic text colors */}
                    <h2 className="text-xl font-semibold text-foreground sm:text-2xl">General Announcements</h2>
                    <p className="mt-1 text-sm text-muted-foreground sm:text-base">
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
                            {/* ANNOUNCEMENTS LIST */}
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
                                            className="cursor-pointer transition-transform active:scale-[0.99]"
                                            initial={{ opacity: 0, x: -80 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true, amount: 0.2 }}
                                            transition={{
                                                duration: 0.2,
                                                delay: index * 0.1,
                                                ease: [0.25, 0.1, 0.25, 1],
                                            }}
                                        >
                                            {/* Updates:
                                                1. Removed red gradients.
                                                2. Added 'bg-card' and 'border-border'.
                                                3. Used 'border-l-primary' for the accent line on the left.
                                            */}
                                            <Card className="relative overflow-hidden rounded-xl border border-border border-l-4 border-l-primary bg-card p-4 transition-all duration-300 hover:shadow-md sm:p-5">
                                                {/* Time Badge: Uses 'secondary' background for subtle contrast */}
                                                <div className="absolute top-2 right-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground shadow-sm sm:top-3 sm:right-3 sm:text-xs">
                                                    {Utility().formatTimeAgo(item.created_at)}
                                                </div>

                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                                    {/* Icon Container: Uses 'muted' background */}
                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-muted shadow-sm sm:h-12 sm:w-12">
                                                        <img
                                                            src="/assets/announcement.png"
                                                            alt="Notice Icon"
                                                            className="h-5 w-5 opacity-80 sm:h-6 sm:w-6"
                                                        />
                                                    </div>

                                                    <div className="flex min-w-0 flex-grow flex-col">
                                                        {/* Title: Primary Foreground color */}
                                                        <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">
                                                            {item.title.length > 100 ? `${item.title.slice(0, 100)}…` : item.title}
                                                        </h3>
                                                        {/* Body: Muted text color */}
                                                        <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground sm:text-[13px]">
                                                            {item.message.length > 100 ? `${item.message.slice(0, 100)}…` : item.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                /* Empty State: Neutral styling */
                                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                                    No announcements yet
                                </div>
                            )}

                            {/* VIEW MORE BUTTON */}
                            {announcementList.length > 0 && (
                                <div className="mt-6 flex w-full justify-end">
                                    <Button
                                        variant="outline"
                                        className="text-sm sm:text-base hover:bg-secondary/80"
                                        onClick={() => {
                                            router.visit(announcements.url(currentMunicipality.slug));
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
                    onClose={() => {
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
                    open={classicDialog.isOpen}
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