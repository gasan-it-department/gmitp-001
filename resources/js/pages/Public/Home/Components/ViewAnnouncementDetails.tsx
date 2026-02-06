import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AnnouncementData } from '@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes';
import Utility from '@/pages/Utility/Utility';
import { CalendarDays, Megaphone } from 'lucide-react';

type Props = {
    isOpen: boolean;
    data: AnnouncementData | null;
    onClose: () => void;
};

export function ViewAnnouncementDetails({ isOpen, data, onClose }: Props) {
    if (!data) return null;

    const linkifyText = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;

        return text.replace(urlRegex, (url) => {
            // Updated link color to match theme primary or a standard blue
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80 font-medium">${url}</a>`;
        });
    };

    return (
        <Dialog open={isOpen}>
            <DialogContent
                showCloseButton={false}
                onInteractOutside={(e) => e.preventDefault()}
                // Updated Container: Uses 'bg-background', 'border-border'
                className="flex h-[80vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-background p-6 shadow-2xl transition-all duration-300 sm:h-[75vh] sm:max-w-3xl lg:h-[70vh] lg:max-w-4xl"
            >
                {/* Header */}
                <DialogHeader className="flex-shrink-0 space-y-3">
                    <div className="flex w-full min-w-0 items-start gap-3">
                        {/* Icon: Uses 'bg-primary' with 'text-primary-foreground' */}
                        <div className="shrink-0 rounded-full bg-primary p-3 shadow-md text-primary-foreground">
                            <Megaphone className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            {/* Title: Uses 'text-foreground' */}
                            <DialogTitle className="line-clamp-3 overflow-hidden text-left text-xl leading-tight font-bold tracking-tight break-words text-foreground sm:text-2xl">
                                {data.title || 'Untitled Announcement'}
                            </DialogTitle>
                        </div>
                    </div>
                    
                    {/* Meta Data: Uses 'text-muted-foreground' */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <span>{Utility().formatToReadableDate(data.created_at)}</span>
                        <span className="mx-1">•</span>
                        <span>{Utility().formatTimeAgo(data.created_at)}</span>
                    </div>
                    
                    {/* Divider: Uses 'bg-border' */}
                    <div className="mt-3 mb-2 h-[1px] bg-border" />
                </DialogHeader>

                {/* Scrollable Message Container */}
                <div
                    // Updated Content Area: 'bg-muted/30', 'text-foreground', 'border-border'
                    className="scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent w-full flex-1 overflow-x-hidden overflow-y-auto rounded-lg border border-border bg-muted/30 p-4 leading-relaxed break-words whitespace-pre-line text-foreground"
                    dangerouslySetInnerHTML={{
                        __html: linkifyText(data.message || 'No message provided for this announcement.'),
                    }}
                />

                {/* Footer */}
                <DialogFooter className="mt-4 flex flex-shrink-0 justify-end">
                    <Button
                        onClick={onClose}
                        // Button: Uses 'bg-primary', 'text-primary-foreground'
                        className="rounded-lg bg-primary px-6 py-2.5 text-base font-medium text-primary-foreground shadow-md transition-all duration-200 hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}