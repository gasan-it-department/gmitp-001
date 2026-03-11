import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Utility from '@/pages/Utility/Utility';
import { CalendarDays } from 'lucide-react';

interface EventDataList {
    title: string;
    event_date: string;
    description: string;
    id: string;
}

type Props = {
    isOpen: boolean;
    data: EventDataList | null;
    onClose: () => void;
};

export function ViewEventDetails({ isOpen, data, onClose }: Props) {
    if (!data) return null;

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
                    {/* Title: Uses 'text-foreground' */}
                    <DialogTitle className="text-3xl font-bold tracking-tight text-foreground">
                        {data.title || 'Untitled Event'}
                    </DialogTitle>

                    {/* Event Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        {/* Meta Item: Uses 'text-primary' for the icon and 'text-muted-foreground' for text */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            <span className="font-medium text-primary">
                                {Utility().calculateArrivingDays(data.event_date)}
                            </span>
                        </div>
                    </div>

                    {/* Divider: Uses 'bg-border' */}
                    <div className="mt-3 mb-2 h-[1px] bg-border" />
                </DialogHeader>

                {/* Scrollable Description */}
                <div
                    // Updated Content Area: 'bg-muted/30', 'text-foreground', 'border-border'
                    className="scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent w-full flex-1 overflow-x-hidden overflow-y-auto rounded-lg border border-border bg-muted/30 p-4 leading-relaxed break-words whitespace-pre-line text-foreground"
                    dangerouslySetInnerHTML={{
                        __html: Utility().linkify(data.description || 'No description provided.'),
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