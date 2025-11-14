import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AnnouncementApi } from '@/Core/Api/BulletinBoard/AnnouncementApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import type { AnnouncementData } from '@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes';
import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

interface AddEditAnnouncementProps {
    isOpen: boolean;
    editData?: AnnouncementData | null;
    onClose: () => void;
    onSuccess: (data: AnnouncementData, isEdit: boolean) => void;
}

export default function AddEditAnnouncementDialog({ isOpen, onClose, editData, onSuccess }: AddEditAnnouncementProps) {
    const { currentMunicipality } = useMunicipality();
    const municipalSlug = currentMunicipality.slug;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<AnnouncementData>({
        defaultValues: { title: '', message: '', is_published: false },
    });

    const [serverError, setServerError] = useState<string | null>(null);

    const onSubmit: SubmitHandler<AnnouncementData> = async (data) => {
        setServerError(null);

        const payload = {
            title: data.title,
            message: data.message,
            is_published: data.is_published,
        };

        try {
            let response;
            if (editData) {
                // response = await axios.put(`/bulletin-board/announcement/${editData.id}`, payload);
                // if (response.success) {
                //     onSuccess(response.data, true);
                // }
            } else {
                response = await AnnouncementApi.storeAnnouncement(payload, municipalSlug);
                if (response.success) {
                    onSuccess(response.data, false);
                }
            }

            reset();
            onClose();
        } catch (error) {
            const err = error as AxiosError<any>;
            if (err.response?.status === 422 && err.response.data?.errors) {
                const backendErrors = err.response.data.errors;

                Object.entries(backendErrors).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        setError(field as keyof AnnouncementData, {
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

    useEffect(() => {
        if (editData) {
            reset({
                title: editData.title ?? '',
                message: editData.message ?? '',
                is_published: !!editData.is_published,
            });
        } else {
            reset({
                title: '',
                message: '',
                is_published: true,
            });
        }
    }, [editData, reset]);

    useEffect(() => {
        if (isOpen) {
            if (editData === null) {
                reset({
                    title: '',
                    message: '',
                    is_published: true,
                });
            }
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-white via-orange-50 to-rose-50 shadow-xl sm:max-w-md">
                <DialogHeader className="border-b border-orange-100 pb-3 text-center">
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                        {editData === null ? 'Post Announcement' : 'Edit Announcement'}
                    </DialogTitle>
                    <p className="text-sm text-gray-500">Fill out the details for your announcement.</p>
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
                                placeholder="Enter announcement title"
                                {...register('title', { required: 'Title is required' })}
                                className={`rounded-md border font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${
                                    errors.title ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
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
                                className={`min-h-[150px] rounded-md border font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${
                                    errors.message ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.message && <p className="text-sm text-red-600">{errors.message.message}</p>}
                        </div>

                        {/* Server error */}
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
