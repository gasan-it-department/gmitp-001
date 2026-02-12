'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExecutiveOrder } from '@/Core/Types/ExecutiveOrders/ExecutiveOrders';
import { Calendar, Download, FileText, Tag } from 'lucide-react';


interface ViewOrderDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    order: ExecutiveOrder | null;
    onDownload: (orderNumber: string) => void;
}

export function ViewOrderDialog({ isOpen, onOpenChange, order, onDownload }: ViewOrderDialogProps) {
    const primaryGradient = "bg-gradient-to-r from-red-500 to-orange-500";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl overflow-hidden p-0 rounded-2xl gap-0 border-0">

                {/* Dialog Header */}
                <div className={`px-6 py-6 ${primaryGradient} text-white`}>
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 opacity-90">
                                <Badge variant="secondary" className="font-mono text-xs bg-white/20 text-white hover:bg-white/30 border-none">
                                    {order?.number}
                                </Badge>
                                <span className="text-xs flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> {order?.dateIssued}
                                </span>
                            </div>
                            <DialogTitle className="text-xl md:text-2xl font-bold leading-snug text-white">
                                {order?.title}
                            </DialogTitle>
                        </div>
                    </div>
                </div>

                {/* Dialog Body */}
                {order && (
                    <div className="p-6 md:p-8 bg-white dark:bg-neutral-900">
                        <div className="flex items-center gap-2 mb-6">
                            <Tag className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Category: {order.category}
                            </span>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="mb-2 text-sm font-bold uppercase text-gray-400 tracking-wide">Abstract</h4>
                                <p className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg border border-gray-100 dark:border-neutral-800">
                                    {order.description}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800 flex justify-end gap-3">
                            <Button
                                onClick={() => onDownload(order.number)}
                                className={`gap-2 text-white shadow-lg hover:shadow-xl transition-all ${primaryGradient} hover:opacity-90`}
                            >
                                <Download className="h-4 w-4" />
                                Download Official PDF
                            </Button>

                            <Button
                                onClick={() => {onOpenChange(false);}}
                                className={`gap-2 text-white shadow-lg hover:shadow-xl transition-all ${primaryGradient} hover:opacity-90`}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}