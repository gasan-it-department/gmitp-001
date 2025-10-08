
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: ClientData) => void;
}

interface ClientData {
    last_name: string;
    first_name: string;
    middle_name?: string;
    contact_number: string;
    transacted_with?: string;
    purpose?: string;
    recommendation?: string;
}

export default function FeedbackFormDialog({ isOpen, onClose, onSubmit }: Props) {
    const [isDatePickerOpened, setDatePickerOpened] = useState(false)
    const [date, setDate] = useState<Date | undefined>(undefined)

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ClientData>({});

    const handleFormSubmit = async (data: ClientData) => {
        try {
            console.log('Form data to be submitted:', data);
            reset();
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleReset = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="w-full h-screen max-w-none rounded-none m-0 p-4 overflow-y-auto scrollbar-hide
                     sm:max-w-[700px] sm:h-auto sm:rounded-lg sm:m-auto lg:h-5/6 flex flex-col"
            >
                <DialogHeader>
                    <DialogTitle className="p-3 text-[21px] text-center">Client Feedback Form</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6 p-8">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name:
                                </label>
                                <Input
                                    {...register("last_name")}
                                    className="placeholder-transparent w-full"
                                />
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name:
                                </label>
                                <Input
                                    {...register("first_name")}
                                    className="placeholder-transparent w-full"
                                />
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Middle Name (optional):
                                </label>
                                <Input
                                    {...register("middle_name")}
                                    className="placeholder-transparent w-full"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact number:
                                </label>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    {...register("contact_number", {
                                        required: true,
                                        pattern: {
                                            value: /^[0-9]+$/,
                                            message: "Numbers only, no decimals."
                                        }
                                    })}
                                    placeholder=" "
                                    className="placeholder-transparent w-full"
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <Label htmlFor="date" className="px-1">
                                    Date:
                                </Label>

                                <Popover open={isDatePickerOpened} onOpenChange={setDatePickerOpened} modal={false}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="date"
                                            className="w-48 justify-between font-normal"
                                        >
                                            {date ? date.toLocaleDateString() : "Select date"}
                                            <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent
                                        className="w-auto overflow-visible p-0 z-[99999] fixed"
                                        align="start"
                                        sideOffset={5}
                                        onPointerDownOutside={(e) => e.preventDefault()} // prevent accidental dismiss
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            captionLayout="dropdown"
                                            onSelect={(selectedDate) => {
                                                if (selectedDate) {
                                                    setDate(selectedDate)
                                                    // slight delay before closing so user sees the selected state
                                                    setTimeout(() => setDatePickerOpened(false), 100)
                                                }
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Persons/Department transacted with:
                                </label>
                                <Input
                                    {...register("transacted_with")}
                                    className="placeholder-transparent w-full"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Purpose of Transaction:
                                </label>
                                <Textarea
                                    {...register("purpose")}
                                    placeholder="Enter here"
                                    className="placeholder-transparent w-full resize-y min-h-[80px] max-h-[300px]"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Recommendation/Suggestion/Desire Action from Office:
                                </label>
                                <Textarea
                                    {...register("recommendation")}
                                    placeholder="Enter here"
                                    className="placeholder-transparent w-full resize-y min-h-[80px] max-h-[300px]"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="sticky bottom-0 bg-white border-t pt-3 mt-4 flex gap-2 flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        className="basis-1/2 sm:basis-auto sm:w-auto"
                        onClick={() => {
                            onClose();

                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        disabled={isSubmitting}
                        variant="default"
                        type="submit"
                        className="basis-1/2 sm:basis-auto sm:w-auto"
                        onClick={handleReset}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>

        // <>
        //     <Card className="p-5 m-1 h-full flex flex-col">
        //         {/* Header */}
        //         <div className="flex items-center">
        //             <Star className="w-12 h-12 text-yellow-500 shrink-0" />
        //             <span className="ml-4 font-bold text-lg sm:text-xl md:text-2xl">
        //                 Feedback Form
        //             </span>
        //         </div>

        //         {/* Description */}
        //         <span className="block mt-3 mb-5 text-sm sm:text-base text-gray-600">
        //             Share your thoughts, suggestions, or issues to help us improve our services and better serve you.
        //         </span>

        //         {/* Button wrapper pushed to bottom */}
        //         <div className="mt-auto flex justify-end">
        //             <Button
        //                 className="p-3 flex items-center justify-center gap-2 w-full sm:w-auto"
        //                 variant="outline"
        //                 size="sm"
        //                 onClick={() => setIsPopupOpen(true)}
        //             >
        //                 Create Feedback
        //                 <ArrowRight size={20} />
        //             </Button>
        //         </div>
        //     </Card>


        //     <ComplaintPopupForm
        //         isOpen={isPopupOpen}
        //         onClose={() => setIsPopupOpen(false)}
        //     />
        // </>
    );
}
