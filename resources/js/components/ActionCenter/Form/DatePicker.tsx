import { format } from 'date-fns';
import { CalendarIcon, ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
    label?: string;
    value?: string; // Expects 'yyyy-MM-dd'
    onChange: (date: string) => void;
    error?: string;
    required?: boolean;
}

export function DatePickerField({ label, value, onChange, error, required }: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    // Convert string from parent back to a Date object for the Calendar
    // Handle invalid dates safely to prevent crashes
    const selectedDate = value && !isNaN(Date.parse(value)) ? new Date(value) : undefined;

    return (
        <div className="flex flex-col gap-2">
            {label && (
                <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    {label} {required && '*'}
                </Label>
            )}

            {/* ✅ FIX: Added modal={true} 
               This tells Radix UI that this Popover should behave like a modal.
               It manages focus correctly when nested inside another Dialog/Modal,
               allowing interactions with the calendar (like dropdowns) to work.
            */}
            <Popover open={open} onOpenChange={setOpen} modal={true}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            'h-11 w-full justify-between text-left font-semibold shadow-sm',
                            !value && 'font-normal text-slate-400',
                            error && 'border-red-500 ring-1 ring-red-500',
                        )}
                    >
                        <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-orange-500" />
                            {selectedDate ? format(selectedDate, 'PPP') : 'Select birth date'}
                        </div>
                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="z-[100] w-auto overflow-hidden p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            // Format to string before sending to parent/backend
                            onChange(date ? format(date, 'yyyy-MM-dd') : '');
                            setOpen(false);
                        }}
                        captionLayout="dropdown" // Enables the dropdowns for Month/Year
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        classNames={{
                            caption_dropdowns: 'flex justify-center gap-1 font-bold text-sm',
                        }}
                    />
                </PopoverContent>
            </Popover>

            {error && <p className="ml-1 animate-pulse text-[11px] font-bold text-red-500 italic">{error}</p>}
        </div>
    );
}
