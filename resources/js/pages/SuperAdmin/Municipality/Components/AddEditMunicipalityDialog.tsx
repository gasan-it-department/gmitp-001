import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

interface Municipality {
    name: string;
    municipal_code: string;
}

interface AddEditMunicipalityProps {
    isOpen: boolean;
    editData?: MunicipalityType | null;
    onClose: () => void;
    onSuccess?: (newData: MunicipalityType, isEdit: boolean) => void;
}

const BASE = 'https://psgc.gitlab.io/api';
const provinceCode = '174000000';

export default function AddEditMunicipalityDialog({ isOpen, onClose, editData, onSuccess }: AddEditMunicipalityProps) {
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        clearErrors,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<MunicipalityType>({
        defaultValues: {
            name: '',
            zip_code: '',
            municipal_code: '',
            is_active: true,
        },
    });

    const isActive = watch('is_active');
    const selectedMunicipality = watch('name');

    // 🟠 Reset form + errors when dialog closes
    useEffect(() => {
        if (!isOpen) {
            reset({
                name: '',
                zip_code: '',
                municipal_code: '',
                is_active: true,
            });
            clearErrors();
            setServerError(null);
        }
    }, [isOpen, reset, clearErrors]);

    // 🟠 Fetch municipalities from API
    useEffect(() => {
        async function getMunicipalities() {
            setLoadingMunicipalities(true);
            try {
                const response = await fetch(`${BASE}/provinces/${provinceCode}/municipalities/`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
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

    // 🟠 Auto-fill municipal code when selecting name
    useEffect(() => {
        if (selectedMunicipality && !editData) {
            const selected = municipalities.find((m) => m.name === selectedMunicipality);
            if (selected) {
                setValue('municipal_code', selected.municipal_code);
            }
        }
    }, [selectedMunicipality, municipalities, setValue, editData]);

    // 🟠 Reset form when switching between Add/Edit
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
        clearErrors();
        setServerError(null);
        console.log('ID', editData?.id);
    }, [isOpen]);

    // 🟠 Submit handler
    const onSubmit: SubmitHandler<MunicipalityType> = async (data) => {
        setServerError(null);
        clearErrors();

        try {
            let response;
            if (editData) {
                response = await axios.put(`/municipality/super-admin/update/${editData.id}`, data);
                onSuccess?.(response.data.data, true);
            } else {
                response = await axios.post('/super-admin/municipality-add', data);
                console.log('Add id: ', response.data.id);
                onSuccess?.(response.data.data, false);
            }

            reset();
            onClose();
        } catch (error) {
            const err = error as AxiosError<any>;
            const data = err.response?.data;

            // 🟠 Map server errors to specific fields
            if (data?.errors && Array.isArray(data.errors)) {
                data.errors.forEach((msg: string) => {
                    if (msg.toLowerCase().includes('municipality')) {
                        setError('name', { type: 'server', message: msg });
                    } else if (msg.toLowerCase().includes('zip')) {
                        setError('zip_code', { type: 'server', message: msg });
                    } else if (msg.toLowerCase().includes('code')) {
                        setError('municipal_code', { type: 'server', message: msg });
                    }
                });
            } else {
                setServerError('Something went wrong. Please try again.');
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-white via-orange-50 to-rose-50 shadow-xl sm:max-w-md">
                <DialogHeader className="border-b border-orange-100 pb-3 text-center">
                    <DialogTitle className="text-2xl font-bold text-gray-800">{editData ? 'Edit Municipality' : 'Add Municipality'}</DialogTitle>
                    <p className="text-sm text-gray-500">Fill out the municipality details below.</p>
                </DialogHeader>

                <div className="custom-scrollbar max-h-[60vh] overflow-y-auto px-1 pr-2">
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-6">
                        {/* Municipality Name */}
                        <div className="space-y-1">
                            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                Municipality Name <span className="text-red-500">*</span>
                            </Label>

                            {editData ? (
                                <div className="rounded-md border border-gray-300 bg-gray-100 px-3 py-2 font-medium text-gray-600">
                                    {watch('name')}
                                </div>
                            ) : (
                                <>
                                    <Select
                                        onValueChange={(value) => {
                                            setValue('name', value);
                                            clearErrors('name');
                                        }}
                                        value={watch('name')}
                                        disabled={loadingMunicipalities}
                                    >
                                        <SelectTrigger
                                            className={`w-full rounded-md border font-medium text-gray-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${
                                                errors.name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        >
                                            <SelectValue placeholder={loadingMunicipalities ? 'Loading...' : 'Select municipality'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {municipalities.map((m) => (
                                                <SelectItem key={m.municipal_code} value={m.name}>
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                                </>
                            )}
                        </div>

                        {/* Zip Code */}
                        <div className="space-y-1">
                            <Label htmlFor="zip_code" className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                                Zip Code <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="zip_code"
                                placeholder="Enter zip code"
                                {...register('zip_code', { required: 'Zip code is required' })}
                                onChange={() => clearErrors('zip_code')}
                                className={`rounded-md border bg-white font-medium text-gray-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${
                                    errors.zip_code ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.zip_code && <p className="mt-1 text-xs text-red-600">{errors.zip_code.message}</p>}
                        </div>

                        {/* Municipal Code (read-only) */}
                        <div className="space-y-2">
                            <Label htmlFor="code" className="text-sm font-semibold text-gray-700">
                                Code * <span className="text-xs text-gray-500">(from API)</span>
                            </Label>
                            <div className="rounded-md border border-gray-300 bg-gray-100 px-3 py-2 font-medium text-gray-600">
                                {watch('municipal_code') || '-'}
                            </div>
                            <input type="hidden" {...register('municipal_code', { required: 'Code is required' })} />
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
                                onClick={() => {
                                    reset();
                                    clearErrors();
                                    setServerError(null);
                                    onClose();
                                }}
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
