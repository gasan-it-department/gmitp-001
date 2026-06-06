import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import Utility from '@/pages/Utility/Utility';
import announcement from '@/routes/announcement';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { ViewAnnouncementDetails } from './ViewAnnouncementDetails';

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: {
        value: string;
        label: string;
    };
    created_at: string;
    cover_image_url: string | null;
    images: { url: string }[];
}

interface Props {
    announcements: PaginatedResponse<Announcement>;
}

export default function GeneralAnnouncement({ announcements }: Props) {
    const { currentMunicipality } = useMunicipality();
    const [announcementDetailsDialog, setAnnouncementDetailsDialog] = useState<{
        isOpen: boolean;
        data: Announcement | null;
    }>({
        isOpen: false,
        data: null,
    });

    const announcementList = announcements.data;

    return (
        <div className="mx-auto w-full px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
            <div className="flex flex-1 flex-col">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">General Announcements</h2>
                    <p className="mt-2 text-muted-foreground sm:text-lg">
                        Stay updated with important notices, reminders, and community information.
                    </p>
                </div>

                <div className="w-full flex-1">
                    {announcementList.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
                            {announcementList.slice(0, 6).map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <Card
                                        className="group flex h-full flex-col overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-xl"
                                        onClick={() => {
                                            setAnnouncementDetailsDialog({
                                                isOpen: true,
                                                data: item,
                                            });
                                        }}
                                    >
                                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                            {item.images.length > 1 ? (
                                                <Carousel className="h-full w-full" opts={{ loop: true }}>
                                                    <CarouselContent className="h-full">
                                                        {item.images.map((img, i) => (
                                                            <CarouselItem key={i} className="h-full">
                                                                <img
                                                                    src={img.url}
                                                                    alt={`${item.title} - ${i + 1}`}
                                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                />
                                                            </CarouselItem>
                                                        ))}
                                                    </CarouselContent>
                                                    <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                        <CarouselPrevious className="relative left-0 translate-x-0" />
                                                        <CarouselNext className="relative right-0 translate-x-0" />
                                                    </div>
                                                </Carousel>
                                            ) : item.cover_image_url ? (
                                                <img
                                                    src={item.cover_image_url}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-muted/50">
                                                    <img src="/assets/announcement.png" alt="No image" className="h-12 w-12 opacity-20" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <span className="rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm">
                                                    {item.type.label}
                                                </span>
                                            </div>
                                        </div>

                                        <CardContent className="flex flex-1 flex-col p-5">
                                            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                                                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                                                <span>{Utility().formatToReadableDate(item.created_at)}</span>
                                                <span className="mx-1">•</span>
                                                <span>{Utility().formatTimeAgo(item.created_at)}</span>
                                            </div>

                                            <h3 className="mb-2 line-clamp-2 text-lg leading-tight font-bold text-foreground transition-colors group-hover:text-primary">
                                                {item.title}
                                            </h3>

                                            <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.content}</p>

                                            <div className="mt-auto border-t border-border/50 pt-4">
                                                <Button
                                                    variant="link"
                                                    className="h-auto p-0 font-semibold text-primary hover:no-underline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setAnnouncementDetailsDialog({
                                                            isOpen: true,
                                                            data: item,
                                                        });
                                                    }}
                                                >
                                                    Read More →
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
                            <div className="mb-4 rounded-full bg-muted p-4">
                                <img src="/assets/announcement.png" alt="Empty" className="h-12 w-12 opacity-20" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">No announcements yet</h3>
                            <p className="mt-1 text-muted-foreground">Important updates will appear here once published.</p>
                        </div>
                    )}

                    {announcementList.length > 0 && (
                        <div className="mt-10 flex justify-center">
                            <Button
                                size="lg"
                                className="rounded-full bg-primary px-8 text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95"
                                onClick={() => {
                                    router.visit(announcement.index.url(currentMunicipality.slug));
                                }}
                            >
                                View All Announcements
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <ViewAnnouncementDetails
                isOpen={announcementDetailsDialog.isOpen}
                data={announcementDetailsDialog.data}
                onClose={() => {
                    setAnnouncementDetailsDialog({
                        isOpen: false,
                        data: null,
                    });
                }}
            />
        </div>
    );
}
