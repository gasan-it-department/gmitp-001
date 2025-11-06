import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MunicipalityDataType } from '@/Core/Types/Municipality/MunicipalityTypes';
import axios, { type AxiosError } from 'axios';
import { da } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

interface Municipality {
    name: string;
    municipal_code: string;
}

interface AddEditMunicipalityProps {
    isOpen: boolean;
    editData?: MunicipalityDataType | null;
    onClose: () => void;
}

const BASE = 'https://psgc.gitlab.io/api';
const provinceCode = '174000000';

export default function AddEditMunicipalityDialog({ isOpen, onClose, editData }: AddEditMunicipalityProps) {
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

    useEffect(() => {
        async function getMunicipalities() {
            setLoadingMunicipalities(true);
            try {
                const response = await fetch(`${BASE}/provinces/${provinceCode}/municipalities/`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();

                // Normalize field names for backend compatibility
                const normalized = data.map((m: any) => ({
                    name: m.name,
                    municipal_code: m.code,
                }));

                setMunicipalities(normalized);
            } catch (error) {
                console.error('Error fetching municipalities:', error);
                setMunicipalities([]);
            } finally {
                setLoadingMunicipalities(false);
            }
        }

        getMunicipalities();
    }, []);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<MunicipalityDataType>({
        defaultValues: {
            name: '',
            zip_code: '',
            municipal_code: '',
            is_active: true,
        },
    });

    const [serverError, setServerError] = useState<string | null>(null);
    const isActive = watch('is_active');
    const selectedMunicipality = watch('name');

    useEffect(() => {
        if (selectedMunicipality && !editData) {
            const selected = municipalities.find((m) => m.name === selectedMunicipality);
            if (selected) {
                setValue('municipal_code', selected.municipal_code);
            }
        }
    }, [selectedMunicipality, municipalities, setValue, editData]);

    const onSubmit: SubmitHandler<MunicipalityDataType> = async (data) => {
        setServerError(null);

        try {
            if (editData) {
                // Update existing municipality
                console.log("Updating municipality:", data);
                console.log("Municipal code: ", editData.id);
                await axios.put(`/super-admin/municipality-update/${editData.id}`, data);
            } else {
                // Create new municipality
                await axios.post('/super-admin/municipality-add', data);
            }


            reset();
            onClose();
        } catch (error) {
            const err = error as AxiosError<any>;
            if (err.response?.status === 422 && err.response.data?.errors) {
                const backendErrors = err.response.data.errors;
                Object.entries(backendErrors).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        setError(field as keyof MunicipalityDataType, {
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
                municipal_code: editData.municipal_code ?? '',
                is_active: !!editData.is_active,
            });
        } else {
            reset({
                name: '',
                zip_code: '',
                municipal_code: '',
                is_active: true,
            });
        }
    }, [editData, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-white via-orange-50 to-rose-50 shadow-xl sm:max-w-md">
                <DialogHeader className="border-b border-orange-100 pb-3 text-center">
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                        {editData == null ? 'Add Municipality' : 'Edit Municipality'}
                    </DialogTitle>
                    <p className="text-sm text-gray-500">Fill out the municipality details below.</p>
                </DialogHeader>

                <div className="custom-scrollbar max-h-[60vh] overflow-y-auto px-1 pr-2">
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-6">
                        {/* Municipality Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                Municipality Name<span className="text-red-500">*</span>
                            </Label>
                            {editData ? (
                                <div className="rounded-md border border-gray-300 bg-gray-100 px-3 py-2 font-medium text-gray-600">
                                    {watch('name')}
                                </div>
                            ) : (
                                <Select
                                    onValueChange={(value) => {
                                        setValue('name', value);
                                    }}
                                    defaultValue={watch('name')}
                                    disabled={loadingMunicipalities}
                                >
                                    <SelectTrigger
                                        className={`w-full rounded-md border font-medium text-gray-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <SelectValue placeholder={loadingMunicipalities ? 'Loading...' : 'Select municipality'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {municipalities.map((m) => (
                                            <SelectItem key={m.name} value={m.name}>
                                                {m.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                        </div>

                        {/* Zip Code (user-editable) */}
                        <div className="space-y-2">
                            <Label htmlFor="zip_code" className="flex items-center gap-1">
                                Zip Code <span className="text-red-500">*</span>
                            </Label>

                            <Input
                                id="zip_code"
                                placeholder="Enter zip code"
                                {...register('zip_code', { required: 'Zip code is required' })}
                                className={`rounded-md border bg-white font-medium text-gray-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${errors.zip_code ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.zip_code && <p className="text-sm text-red-600">{errors.zip_code.message}</p>}
                        </div>

                        {/* Code (read-only, from API) */}
                        <div className="space-y-2">
                            <Label htmlFor="code" className="text-sm font-semibold text-gray-700">
                                Code * <span className="text-xs text-gray-500">(from API)</span>
                            </Label>
                            <div className="rounded-md border border-gray-300 bg-gray-100 px-3 py-2 font-medium text-gray-600">
                                {watch('municipal_code') || '-'}
                            </div>
                            <input type="hidden" {...register('municipal_code', { required: 'Code is required' })} />
                            {errors.municipal_code && <p className="text-sm text-red-600">{errors.municipal_code.message}</p>}
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center justify-between border-t border-orange-100 pt-4">
                            <Label htmlFor="is_active" className="pr-3 text-sm font-semibold text-gray-700">
                                Active
                            </Label>
                            <Switch id="is_active" checked={isActive} onCheckedChange={(checked) => setValue('is_active', checked)} />
                        </div>

                        {/* Server Error */}
                        {serverError && <p className="text-center text-sm text-red-600">{serverError}</p>}

                        {/* Footer Buttons */}
                        <DialogFooter className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onClose()}
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
