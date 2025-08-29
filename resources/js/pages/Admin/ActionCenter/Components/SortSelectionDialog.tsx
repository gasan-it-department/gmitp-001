import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Props {
    currentSortOption?: string;
    isOpen: boolean;
    onClose: () => void;
}


export default function SortSelectionDialog({ currentSortOption, isOpen, onClose }: Props) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="w-full h-screen max-w-none rounded-none m-0 p-4 overflow-y-auto scrollbar-hide
             sm:max-w-[350px] sm:h-auto sm:rounded-lg sm:m-auto lg:h-5/8 flex flex-col"
            >
                <DialogHeader>
                    <DialogTitle className="p-3 text-[21px] text-center">Sort List By</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <form
                        className="flex flex-col gap-6"
                        onSubmit={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <RadioGroup defaultValue="financial" className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id="sort_name" value="sort_name" />
                                <Label htmlFor="sort_name">By Name</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id="sort_request_date" value="sort_request_date" />
                                <Label htmlFor="sort_request_date">By Request Date</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id="sort_title" value="ambulance" />
                                <Label htmlFor="sort_title">By Title</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id="sort_transaction_id" value="sort_transaction_id" />
                                <Label htmlFor="sort_transaction_id">By Transaction Id</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id="sort_due_date" value="sort_due_date" />
                                <Label htmlFor="sort_due_date">By Due Date</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id="sort_status" value="sort_status" />
                                <Label htmlFor="sort_status">By Status</Label>
                            </div>
                        </RadioGroup>
                    </form>
                </div>

                {/* Sticky footer */}
                <div className="sticky bottom-0 bg-white border-t pt-3 mt-4 flex gap-2 flex-row sm:justify-end">
                    <Button
                        variant="outline"
                        className="basis-1/2 sm:basis-auto sm:w-auto"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        className="basis-1/2 sm:basis-auto sm:w-auto"
                        onClick={() => {

                        }}
                    >
                        Sort
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}