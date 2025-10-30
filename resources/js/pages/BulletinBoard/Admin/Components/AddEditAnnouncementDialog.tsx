import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

// ------------------------------
// 🧩 1. Define your form interface
// ------------------------------
interface AnnouncementFormData {
    title: string;
    message: string;
}

export default function AddEditAnnouncementDialog() {
    const [open, setOpen] = useState<boolean>(false);

    // ------------------------------
    // 🧩 2. Initialize React Hook Form with types
    // ------------------------------
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AnnouncementFormData>({
        defaultValues: { title: '', message: '' },
    });

    // ------------------------------
    // 🧩 3. Define submit handler with type safety
    // ------------------------------
    const onSubmit: SubmitHandler<AnnouncementFormData> = async (data) => {
        try {
            const response = await axios.post('/bulletin-board/announcement', data);
            console.log('Saved:', response.data);

            setOpen(false);
            reset();
        } catch (error) {
            console.error('Error saving announcement:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">Add Announcement</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Announcement</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4 py-2">
                        {/* Title Field */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                className="w-full"
                                placeholder="Enter announcement title"
                                {...register('title', { required: 'Title is required' })}
                            />
                            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                        </div>

                        {/* Message Field */}
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                className="w-full"
                                placeholder="Enter your announcement message"
                                {...register('message', { required: 'Message is required' })}
                            />
                            {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
