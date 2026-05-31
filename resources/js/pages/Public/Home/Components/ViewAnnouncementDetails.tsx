import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Utility from '@/pages/Utility/Utility';
import { CalendarDays, Megaphone, X } from 'lucide-react';

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

type Props = {
    isOpen: boolean;
    data: Announcement | null;
    onClose: () => void;
};

export function ViewAnnouncementDetails({ isOpen, data, onClose }: Props) {
    if (!data) return null;

    const linkifyText = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;

        return text.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80 font-medium">${url}</a>`;
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="flex h-[90vh] w-[95vw] max-w-4xl flex-col overflow-hidden rounded-2xl border-border bg-background p-0 shadow-2xl sm:h-[85vh]"
            >
                <div className="relative flex h-full flex-col">
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 rounded-full bg-background/50 p-2 text-foreground backdrop-blur-md transition-all hover:bg-background/80 hover:scale-110 active:scale-95"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="flex flex-1 flex-col overflow-y-auto">
                        {/* Media Section */}
                        {data.images.length > 0 && (
                            <div className="relative w-full bg-muted">
                                {data.images.length > 1 ? (
                                    <Carousel className="w-full" opts={{ loop: true }}>
                                        <CarouselContent>
                                            {data.images.map((img, i) => (
                                                <CarouselItem key={i}>
                                                    <div className="flex aspect-video w-full items-center justify-center overflow-hidden">
                                                        <img
                                                            src={img.url}
                                                            alt={`${data.title} - ${i + 1}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious className="left-4" />
                                        <CarouselNext className="right-4" />
                                    </Carousel>
                                ) : (
                                    <div className="aspect-video w-full overflow-hidden">
                                        <img
                                            src={data.images[0].url}
                                            alt={data.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Content Section */}
                        <div className="p-6 sm:p-8">
                            <DialogHeader className="mb-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                                        {data.type.label}
                                    </span>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CalendarDays className="h-4 w-4 text-primary" />
                                        <span>{Utility().formatToReadableDate(data.created_at)}</span>
                                        <span className="mx-1">•</span>
                                        <span>{Utility().formatTimeAgo(data.created_at)}</span>
                                    </div>
                                </div>
                                
                                <DialogTitle className="text-2xl font-black leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                                    {data.title}
                                </DialogTitle>
                            </DialogHeader>

                            <div 
                                className="prose prose-slate max-w-none text-base leading-relaxed text-foreground/90 sm:text-lg"
                                dangerouslySetInnerHTML={{
                                    __html: linkifyText(data.content || 'No description provided.'),
                                }}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border bg-muted/30 p-4 sm:px-8">
                        <DialogFooter>
                            <Button
                                onClick={onClose}
                                className="w-full rounded-xl bg-primary px-8 py-6 text-lg font-bold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
                            >
                                Close Announcement
                            </Button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
