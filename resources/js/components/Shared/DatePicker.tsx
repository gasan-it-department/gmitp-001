import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';

interface DatePickerProps {
    label: string;
    value: string | undefined; // Strictly expects a Laravel string: 'YYYY-MM-DD'
    onChange: (date: string) => void;
    error?: string;
    disableFuture?: boolean; // Simple toggle for UX
}

export function DatePicker({ label, value, onChange, error, disableFuture = false }: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    // 1. Safely parse the Laravel string into a JS Date object for Shadcn
    const selectedDate = value ? parseISO(value) : undefined;

    // 2. Calculate the year range for historical registry entries
    const currentYear = new Date().getFullYear();

    return (
        <div className="flex w-full flex-col">
            <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            !value && 'text-muted-foreground',
                            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300',
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'MMM d, yyyy') : <span>Select date</span>}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        defaultMonth={selectedDate}
                        // Ensure clerks can easily select historical dates
                        captionLayout="dropdown"
                        fromYear={currentYear - 120}
                        toYear={currentYear}
                        // Conditionally disable future dates if the prop is true
                        disabled={disableFuture ? { after: new Date() } : undefined}
                        onSelect={(date) => {
                            // 3. Convert back to Laravel's expected format on selection
                            onChange(date ? format(date, 'yyyy-MM-dd') : '');
                            setOpen(false);
                        }}
                    />
                </PopoverContent>
            </Popover>

            {/* Display Laravel validation errors directly under the input */}
            {error && <span className="animate-pulse text-sm text-red-500">{error}</span>}
        </div>
    );
}
