import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";

interface FilterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    filters: string[];
    selectedFilter: string | null;
    currentFilter: string | null;
    onApply: (selected: string | null) => void;
}

export default function FilterDialog({
    isOpen,
    onClose,
    filters,
    currentFilter,
    onApply,
}: FilterDialogProps) {
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setSelected(currentFilter);
        }
    }, [isOpen, currentFilter]);

    const handleApply = () => {
        onApply(selected);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="
                    w-[90vw] sm:w-[80vw] md:w-[400px]
                    max-w-md rounded-2xl p-6
                    border shadow-lg
                    bg-white dark:bg-neutral-900
                    flex flex-col items-center text-center gap-5
                    transition-all duration-300 ease-in-out
                "
            >
                <h3 className="text-lg font-semibold">Sort By</h3>

                <RadioGroup
                    value={selected || ""}
                    onValueChange={(value) => setSelected(value)}
                    className="flex flex-col gap-2 w-full"
                >
                    {filters.map((filter) => (
                        <label
                            key={filter}
                            className="flex items-center gap-2 cursor-pointer text-left px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                        >
                            <RadioGroupItem
                                value={filter}
                                className="accent-orange-400 dark:accent-orange-600"
                            />
                            <span>{filter}</span>
                        </label>
                    ))}
                </RadioGroup>

                <div className="flex w-full justify-end mt-4">
                    <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={handleApply}
                    >
                        Apply
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
