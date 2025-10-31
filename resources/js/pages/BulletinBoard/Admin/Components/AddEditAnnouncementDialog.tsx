import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

interface AddEditAnnouncementProps {
    isOpen: boolean;
    onClose: () => void;
}

interface AnnouncementFormData {
    title: string;
    message: string;
}

export default function AddEditAnnouncementDialog({ isOpen, onClose }: AddEditAnnouncementProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AnnouncementFormData>({
        defaultValues: { title: '', message: '' },
    });

    const onSubmit: SubmitHandler<AnnouncementFormData> = async (data) => {
        try {
            const response = await axios.post('/bulletin-board/announcement', data);
            console.log('Saved:', response.data);
            reset();
            onClose();
        } catch (error) {
            console.error('Error saving announcement:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-gradient-to-b from-white via-orange-50 to-rose-50 shadow-xl border-0 rounded-2xl">
                <DialogHeader className="text-center pb-3 border-b border-orange-100">
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                        Post Announcement
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                        Fill out the details for your announcement.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-6">
                    {/* Title Field */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                            Title *
                        </Label>
                        <Input
                            id="title"
                            placeholder="Enter announcement title"
                            {...register('title', { required: 'Title is required' })}
                            className={`rounded-md border font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${errors.title ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.title && (
                            <p className="text-sm text-red-600">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Message Field */}
                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-semibold text-gray-700">
                            Message *
                        </Label>
                        <Textarea
                            id="message"
                            placeholder="Enter your announcement message"
                            {...register('message', { required: 'Message is required' })}
                            className={`min-h-[120px] rounded-md border font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${errors.message ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.message && (
                            <p className="text-sm text-red-600">{errors.message.message}</p>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <DialogFooter className="pt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onClose()}
                            className="flex-1 sm:flex-none rounded-md border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium shadow-md hover:shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
