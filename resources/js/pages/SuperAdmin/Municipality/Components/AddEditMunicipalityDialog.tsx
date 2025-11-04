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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

interface MunicipalityFormData {
    name: string;
    zip_code: string;
    code: string;
    region_code: string;
    is_active: boolean;
}

interface AddEditMunicipalityProps {
    isOpen: boolean;
    editData?: MunicipalityFormData | null;
    onClose: () => void;
}

export default function AddEditMunicipalityDialog({
    isOpen,
    onClose,
    editData,
}: AddEditMunicipalityProps) {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<MunicipalityFormData>({
        defaultValues: {
            name: '',
            zip_code: '',
            code: '',
            region_code: '',
            is_active: true,
        },
    });

    const [serverError, setServerError] = useState<string | null>(null);
    const isActive = watch('is_active');
    const municipalities = [
        { name: "Boac", zip_code: "4900" },
        { name: "Gasan", zip_code: "4905" },
        { name: "Buenavista", zip_code: "4904" },
        { name: "Mogpog", zip_code: "4901" },
        { name: "Santa Cruz", zip_code: "4902" },
        { name: "Torrijos", zip_code: "4903" },
    ];

    const onSubmit: SubmitHandler<MunicipalityFormData> = async (data) => {
        setServerError(null);

        try {
            if (editData) {
                // Update existing municipality
                // await axios.put(`/municipality/${editData.id}`, data);
            } else {
                // Create new municipality
                await axios.post('/municipality', data);
            }

            reset();
            onClose();
        } catch (error) {
            const err = error as AxiosError<any>;
            if (err.response?.status === 422 && err.response.data?.errors) {
                const backendErrors = err.response.data.errors;
                Object.entries(backendErrors).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        setError(field as keyof MunicipalityFormData, {
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
                name: editData.name ?? '',
                zip_code: editData.zip_code ?? '',
                code: editData.code ?? '',
                region_code: editData.region_code ?? '',
                is_active: !!editData.is_active,
            });
        } else {
            reset({
                name: '',
                zip_code: '',
                code: '',
                region_code: '',
                is_active: true,
            });
        }
    }, [editData, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden bg-gradient-to-b from-white via-orange-50 to-rose-50 shadow-xl border-0 rounded-2xl">
                <DialogHeader className="text-center pb-3 border-b border-orange-100">
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                        {editData === null ? 'Add Municipality' : 'Edit Municipality'}
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                        Fill out the municipality details below.
                    </p>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[60vh] px-1 pr-2 custom-scrollbar">
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-6">

                        {/* Municipality Name Dropdown */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                Municipality Name *
                            </Label>
                            <Select
                                onValueChange={(value) => {
                                    const selected = municipalities.find(m => m.name === value);
                                    setValue('name', value);
                                    if (selected) setValue('zip_code', selected.zip_code);
                                }}
                                defaultValue={watch('name')}
                            >
                                <SelectTrigger className={`w-full rounded-md border font-medium text-gray-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}>
                                    <SelectValue placeholder="Select municipality" />
                                </SelectTrigger>
                                <SelectContent>
                                    {municipalities.map((m) => (
                                        <SelectItem key={m.name} value={m.name}>
                                            {m.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.name && (
                                <p className="text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Zip Code (auto-filled) */}
                        <div className="space-y-2">
                            <Label htmlFor="zip_code" className="text-sm font-semibold text-gray-700">
                                Zip Code
                            </Label>
                            <Input
                                id="zip_code"
                                readOnly
                                {...register('zip_code')}
                                className="rounded-md border font-medium text-gray-600 bg-gray-100 cursor-not-allowed"
                            />
                        </div>

                        {/* Code */}
                        {/* <div className="space-y-2">
                            <Label htmlFor="code" className="text-sm font-semibold text-gray-700">
                                Code *
                            </Label>
                            <Input
                                id="code"
                                placeholder="Enter code"
                                {...register('code', { required: 'Code is required' })}
                                className={`rounded-md border font-medium text-gray-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${errors.code ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.code && (
                                <p className="text-sm text-red-600">{errors.code.message}</p>
                            )}
                        </div> */}

                        {/* Region */}
                        {/* <div className="space-y-2">
                            <Label htmlFor="region_code" className="text-sm font-semibold text-gray-700">
                                Region *
                            </Label>
                            <Input
                                id="region_code"
                                placeholder="Enter region code"
                                {...register('region_code', { required: 'Region is required' })}
                                className={`rounded-md border font-medium text-gray-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${errors.region_code ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.region_code && (
                                <p className="text-sm text-red-600">{errors.region_code.message}</p>
                            )}
                        </div> */}

                        {/* Active Toggle */}
                        <div className="flex items-center justify-between border-t border-orange-100 pt-4">
                            <Label htmlFor="is_active" className="text-sm font-semibold text-gray-700 pr-3">
                                Active
                            </Label>
                            <Switch
                                id="is_active"
                                checked={isActive}
                                onCheckedChange={(checked) => setValue('is_active', checked)}
                            />
                        </div>

                        {/* Server Error */}
                        {serverError && (
                            <p className="text-center text-sm text-red-600">{serverError}</p>
                        )}

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
