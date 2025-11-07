import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EventFormData } from '@/Core/Types/BulletinBoard/Events';
import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface AddEditEventsDialogProps {
    isOpen: boolean;
    editData: EventFormData | null;
    onClose: () => void;
}

export default function AddEditEventsDialog({
    isOpen,
    editData,
    onClose,
}: AddEditEventsDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<EventFormData>({
        defaultValues: {
            id: '',
            title: '',
            description: '',
            event_date: '',
        },
    });

    const [serverError, setServerError] = useState<string | null>(null);

    // Populate form when editing
    useEffect(() => {
        if (editData) {
            reset({
                id: editData.id ?? '',
                title: editData.title ?? '',
                description: editData.description ?? '',
                event_date: editData.event_date ?? '',
            });
        } else {
            reset({
                id: '',
                title: '',
                description: '',
                event_date: '',
            });
        }
    }, [editData, reset]);

    const onSubmit = async (data: EventFormData) => {
        setServerError(null);
        try {
            if (editData) {
                // await axios.put(`/bulletin-board/events/${editData.id}`, data);
                console.log("New Data", data);
            } else {
                await axios.post('/bulletin-board/events', data);
            }
            reset();
            onClose();
        } catch (error) {
            const err = error as AxiosError<any>;
            if (err.response?.status === 422 && err.response.data?.errors) {
                const backendErrors = err.response.data.errors;
                Object.entries(backendErrors).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        setError(field as keyof EventFormData, {
                            type: 'server',
                            message: messages[0],
                        });
                    }
                });
            } else {
                setServerError('Something went wrong. Please try again.');
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden bg-gradient-to-b from-white via-orange-50 to-rose-50 shadow-xl border-0 rounded-2xl">
                <DialogHeader className="text-center pb-3 border-b border-orange-100">
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                        {editData ? 'Edit Event' : 'Add Event'}
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                        Fill out the details for your event below.
                    </p>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[60vh] px-1 pr-2 custom-scrollbar">
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-6">
                        {/* Title Field */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                                Title *
                            </Label>
                            <Input
                                id="title"
                                placeholder="Enter event title"
                                {...register('title', { required: 'Title is required' })}
                                className={`rounded-md border font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-600">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Description Field */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                                Description *
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Enter event description"
                                rows={4}
                                {...register('description', { required: 'Description is required' })}
                                className={`min-h-[150px] rounded-md border font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600">{errors.description.message}</p>
                            )}
                        </div>

                        {/* Event Date Field */}
                        <div className="space-y-2">
                            <Label htmlFor="event_date" className="text-sm font-semibold text-gray-700">
                                Event Date *
                            </Label>
                            <Input
                                type="date"
                                id="event_date"
                                {...register('event_date', { required: 'Date is required' })}
                                className={`rounded-md border font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${errors.event_date ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.event_date && (
                                <p className="text-sm text-red-600">{errors.event_date.message}</p>
                            )}
                        </div>

                        {/* General server error */}
                        {serverError && (
                            <p className="text-center text-sm text-red-600">{serverError}</p>
                        )}

                        {/* Footer Buttons */}
                        <DialogFooter className="pt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 sm:flex-none rounded-md border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium shadow-md hover:shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50"
                            >
                                {isSubmitting
                                    ? editData
                                        ? 'Updating...'
                                        : 'Saving...'
                                    : editData
                                        ? 'Update'
                                        : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
