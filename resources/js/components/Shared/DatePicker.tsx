import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';

interface DatePickerProps {
    label: string;
    value: string | undefined | null; // Added null to perfectly match your ProcurementFormData
    onChange: (date: string) => void;
    error?: string;
    disableFuture?: boolean;
    disablePast?: boolean; // NEW: Toggle to prevent selecting old dates
}

export function DatePicker({ label, value, onChange, error, disableFuture = false, disablePast = false }: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    // 1. Safely parse the Laravel string into a JS Date object
    const selectedDate = value ? parseISO(value) : undefined;

    // 2. Dynamically calculate year ranges based on the props
    const currentYear = new Date().getFullYear();
    // If past is disabled, only show from this year onward. Otherwise, go back 120 years.
    const fromYear = disablePast ? currentYear : currentYear - 120;
    // If future is disabled, cap it at this year. Otherwise, allow up to 10 years in the future.
    const toYear = disableFuture ? currentYear : currentYear + 10;

    // 3. Determine disabled dates logic for Shadcn / react-day-picker
    let disabledMatcher;
    if (disableFuture && disablePast) {
        disabledMatcher = [{ before: new Date() }, { after: new Date() }]; // Only allows today
    } else if (disableFuture) {
        disabledMatcher = { after: new Date() };
    } else if (disablePast) {
        // Disables all dates before today (allows selecting today and future)
        disabledMatcher = { before: new Date() };
    }

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
                        captionLayout="dropdown"
                        fromYear={fromYear} // Dynamically set
                        toYear={toYear} // Dynamically set
                        disabled={disabledMatcher} // Applies our new logic
                        onSelect={(date) => {
                            // Convert back to Laravel's expected format on selection
                            onChange(date ? format(date, 'yyyy-MM-dd') : '');
                            setOpen(false);
                        }}
                    />
                </PopoverContent>
            </Popover>

            {/* Display Laravel validation errors */}
            {error && <span className="mt-1 text-sm font-medium text-red-500">{error}</span>}
        </div>
    );
}
