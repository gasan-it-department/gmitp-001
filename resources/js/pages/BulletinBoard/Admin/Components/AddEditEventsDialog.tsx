import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

type EventFormData = {
    title: string;
    message: string;
    event_date: string;
    event_time: string;
};

export default function AddEditEventsDialog() {
    const [open, setOpen] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isValid },
    } = useForm<EventFormData>({
        mode: 'onChange', // validate as user types
        defaultValues: {
            title: '',
            message: '',
            event_date: '',
            event_time: '',
        },
    });

    const event_date = watch('event_date');
    const event_time = watch('event_time');

    const [combinedDate, setCombinedDate] = useState<Date | undefined>();

    useEffect(() => {
        if (event_date && event_time) {
            setCombinedDate(new Date(`${event_date}T${event_time}`));
        } else {
            setCombinedDate(undefined);
        }
    }, [event_date, event_time]);

    const onSubmit = async (data: EventFormData) => {
        if (!combinedDate) return;

        try {
            console.log('📅 Event Saved:', {
                ...data,
            });
            const response = await axios.post('/bulletin-board/events', data);
            reset();
            setOpen(false);
        } catch (error) {
            console.log('error event upload');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">Add Event</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Event</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" placeholder="Enter event title" {...register('title', { required: 'Title is required' })} />
                        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="message">Description</Label>
                        <Textarea
                            id="message"
                            placeholder="Enter event description"
                            rows={4}
                            {...register('message', { required: 'Description is required' })}
                        />
                        {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="event_date">Date</Label>
                        <Input type="date" id="event_date" {...register('event_date', { required: 'Date is required' })} />
                        {errors.event_date && <p className="text-sm text-red-500">{errors.event_date.message}</p>}
                    </div>

                    {/* Time */}
                    <div className="space-y-2">
                        <Label htmlFor="event_time">Time</Label>
                        <Input type="time" id="event_time" {...register('event_time', { required: 'Time is required' })} />
                        {errors.event_time && <p className="text-sm text-red-500">{errors.event_time.message}</p>}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!isValid}>
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
