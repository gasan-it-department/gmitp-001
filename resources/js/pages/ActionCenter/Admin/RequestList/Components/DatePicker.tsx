import { ChevronDownIcon } from 'lucide-react';
import moment from 'moment';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

type DatePickerProps = {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
};

export function DatePicker({ value, onChange }: DatePickerProps) {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(value);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" id="date" className="w-48 justify-between font-normal">
                    {date ? moment(date).format('MMMM D, YYYY') : 'Select date'}
                    <ChevronDownIcon />
                </Button>
            </DialogTrigger>

            <DialogContent className="p-4">
                <Calendar
                    className="w-full"
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={(selected) => {
                        setDate(selected);
                        onChange?.(selected); // notify parent here
                        setOpen(false);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
