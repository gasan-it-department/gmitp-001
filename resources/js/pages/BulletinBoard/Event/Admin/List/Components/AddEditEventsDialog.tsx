import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EventsApi } from '@/Core/Api/BulletinBoard/EventsApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { EventFormData } from '@/Core/Types/BulletinBoard/Events';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface AddEditEventsDialogProps {
    isOpen: boolean;
    editData: EventFormData | null;
    onClose: () => void;
    onSuccess?: (data: EventFormData, isEdit: boolean) => void;
    onFailed?: (error: any, isEdit: boolean) => void;
}

export default function AddEditEventsDialog({ isOpen, editData, onClose, onSuccess }: AddEditEventsDialogProps) {
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
    const { currentMunicipality } = useMunicipality();
    // Populate form when editing
    useEffect(() => {
        if (editData) {
            reset({
                id: editData.id ?? '',
                title: editData.title ?? '',
                description: editData.description ?? '',
                event_date: toDateInputValue(editData.event_date) ?? '',
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
                await EventsApi.updateEvent(editData.id, currentMunicipality.slug, data);
                onSuccess!(data, true);
            } else {
                const response = await EventsApi.storeEvents(data, currentMunicipality.slug);
                const reconstructedResponse = {
                    id: response.data.id,
                    title: response.data.title,
                    description: response.data.description,
                    event_date: response.data.event_date.date,
                    event_created_at: response.data.created_at.date,
                };
                console.log('Response data:', response.data);
                onSuccess!(reconstructedResponse, false);
            }
            reset();
            onClose();
        } catch (error: any) {
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

    function toDateInputValue(dateString: string) {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return ''; // invalid date fallback

        return d.toISOString().split('T')[0];
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-white via-orange-50 to-rose-50 shadow-xl sm:max-w-md">
                <DialogHeader className="border-b border-orange-100 pb-3 text-center">
                    <DialogTitle className="text-2xl font-bold text-gray-800">{editData ? 'Edit Event' : 'Add Event'}</DialogTitle>
                    <p className="text-sm text-gray-500">Fill out the details for your event below.</p>
                </DialogHeader>

                <div className="custom-scrollbar max-h-[60vh] overflow-y-auto px-1 pr-2">
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
                                className={`rounded-md border font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${
                                    errors.title ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
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
                                className={`min-h-[150px] rounded-md border font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${
                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
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
                                className={`rounded-md border font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${
                                    errors.event_date ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.event_date && <p className="text-sm text-red-600">{errors.event_date.message}</p>}
                        </div>

                        {/* General server error */}
                        {serverError && <p className="text-center text-sm text-red-600">{serverError}</p>}

                        {/* Footer Buttons */}
                        <DialogFooter className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 rounded-md border-gray-300 text-gray-700 hover:bg-gray-100 sm:flex-none"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 rounded-md bg-gradient-to-r from-orange-500 to-red-500 font-medium text-white shadow-md transition-all duration-200 hover:from-orange-600 hover:to-red-600 hover:shadow-lg disabled:opacity-50 sm:flex-none"
                            >
                                {isSubmitting ? (editData ? 'Updating...' : 'Saving...') : editData ? 'Update' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
