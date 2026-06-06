import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Utility from '@/pages/Utility/Utility';
import { CalendarDays, MapPin } from 'lucide-react';

interface Event {
    id: string;
    title: string;
    description: string;
    type: {
        value: string;
        label: string;
    };
    start_datetime: string;
    end_datetime: string;
    location_name: string;
    banner_url: string | null;
    created_at: string;
}

type Props = {
    isOpen: boolean;
    data: Event | null;
    onClose: () => void;
};

export function ViewEventDetails({ isOpen, data, onClose }: Props) {
    if (!data) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="flex h-[90vh] w-[95vw] max-w-4xl flex-col overflow-hidden rounded-2xl border-border bg-background p-0 shadow-2xl sm:h-[85vh]"
            >
                <div className="relative flex h-full flex-col">
                    <div className="flex flex-1 flex-col overflow-y-auto">
                        {/* Banner Image */}
                        {data.banner_url && (
                            <div className="aspect-video w-full overflow-hidden bg-muted">
                                <img
                                    src={data.banner_url}
                                    alt={data.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}

                        <div className="p-6 sm:p-8">
                            <DialogHeader className="mb-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                                        {data.type.label}
                                    </span>
                                </div>
                                
                                <DialogTitle className="text-2xl font-black leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                                    {data.title}
                                </DialogTitle>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-primary" />
                                        <span>{data.start_datetime}</span>
                                        {data.end_datetime && (
                                            <>
                                                <span className="mx-1">-</span>
                                                <span>{data.end_datetime}</span>
                                            </>
                                        )}
                                    </div>
                                    {data.location_name && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <span>{data.location_name}</span>
                                        </div>
                                    )}
                                </div>
                            </DialogHeader>

                            <div 
                                className="prose prose-slate max-w-none text-base leading-relaxed text-foreground/90 sm:text-lg"
                                dangerouslySetInnerHTML={{
                                    __html: Utility().linkify(data.description || 'No description provided.'),
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
                                Close
                            </Button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
