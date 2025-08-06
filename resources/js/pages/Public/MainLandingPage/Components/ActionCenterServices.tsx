import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    services: { id: number; serviceName: string }[];
}

export default function ActionCenterServices({ isOpen, onClose, services }: Props) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="w-full h-screen max-w-none rounded-none m-0 p-4 overflow-hidden sm:max-w-[500px] sm:h-auto sm:rounded-lg sm:m-auto lg:h-5/6 flex flex-col"
            >
                {/* Sticky Header */}
                <div className="sticky top-0 bg-white z-10 pb-2">
                    <span className="text-[20px]">Action Center Services</span>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <ul className="mt-2 space-y-2">
                        {services.map((service) => (
                            <li key={service.id} className="p-3">
                                <Card className="p-5">
                                    {service.serviceName}
                                </Card>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Sticky Footer */}
                <div className="mt-4">
                    <Button className="w-full" onClick={onClose}>
                        Submit
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
