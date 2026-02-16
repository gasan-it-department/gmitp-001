import { FormInput } from '@/components/FormInputField';
import { Label } from '@/components/ui/label';
import { GovernmentApi } from '@/Core/Api/Government/government.api';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { Loader2, Save, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface CreateOfficialForm {
    first_name: string;
    last_name: string;
    middle_name: string;
    suffix: string;
    gender: string;
    biography: string;
}

interface Props {
    onCancel: (reason: string) => void;
    onSuccess: (official: any) => void;
    prefillName?: string;
}

export const CreateOfficialDialog = ({ onSuccess, onCancel, prefillName }: Props) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { currentMunicipality } = useMunicipality();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<CreateOfficialForm>({
        defaultValues: {
            first_name: '',
            last_name: '',
            middle_name: '',
            suffix: '',
            gender: 'male',
            biography: '',
        },
    });

    useEffect(() => {
        if (prefillName) {
            setValue('first_name', prefillName);
        }
    }, [prefillName, setValue]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const onSubmit = async (data: CreateOfficialForm) => {
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => formData.append(key, value));
            if (selectedFile) formData.append('profile_image', selectedFile);

            const response = await GovernmentApi.StoreOfficial(formData, currentMunicipality.slug);

            console.log(response);
            onSuccess(response);
        } catch (error) {
            console.error('Failed to create official', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* MAIN CONTENT GRID */}
            <div className="flex flex-col gap-8 md:flex-row">
                {/* LEFT COLUMN: Profile Image (1/3 width approx) */}
                <div className="flex flex-col items-center gap-4 md:w-1/3 md:pt-4">
                    <Label className="text-sm font-semibold text-gray-700">Profile Photo</Label>
                    <div className="group relative">
                        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-blue-200 bg-blue-50/50 transition-colors group-hover:border-blue-400 group-hover:bg-blue-50">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-blue-400">
                                    <Upload className="h-8 w-8" />
                                    <span className="text-[10px] font-medium tracking-wider uppercase">Upload</span>
                                </div>
                            )}
                        </div>
                        <input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={handleFileChange} />
                        {previewUrl && (
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 -right-1 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-transform hover:scale-110"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                    <p className="text-center text-[11px] leading-tight text-gray-400">
                        Recommended: Square image
                        <br />
                        (JPG or PNG)
                    </p>
                </div>

                {/* RIGHT COLUMN: Form Fields (2/3 width) */}
                <div className="flex-1 space-y-4">
                    {/* NAMES */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            id="first_name"
                            label="First Name"
                            required
                            isUppercase
                            value={watch('first_name')}
                            onChange={(e) => setValue('first_name', e.target.value)}
                            error={errors.first_name?.message}
                        />
                        <FormInput
                            id="last_name"
                            label="Last Name"
                            required
                            isUppercase
                            value={watch('last_name')}
                            onChange={(e) => setValue('last_name', e.target.value)}
                            error={errors.last_name?.message}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            id="middle_name"
                            label="Middle Name"
                            placeholder="Optional"
                            isUppercase
                            value={watch('middle_name')}
                            onChange={(e) => setValue('middle_name', e.target.value)}
                        />
                        <FormInput
                            id="suffix"
                            label="Suffix"
                            placeholder="e.g. Jr."
                            value={watch('suffix')}
                            onChange={(e) => setValue('suffix', e.target.value)}
                        />
                    </div>

                    {/* GENDER & BIO */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                            Gender <span className="text-red-500">*</span>
                        </Label>
                        <select
                            {...register('gender')}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="biography" className="text-sm font-medium text-gray-700">
                            Short Biography
                        </Label>
                        <textarea
                            {...register('biography')}
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                            placeholder="Brief background of the official..."
                        />
                    </div>
                </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex items-center justify-end gap-3 border-t pt-6">
                <button
                    type="button"
                    onClick={() => {
                        onCancel('User clicked back');
                    }}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                    Back to Search
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Official
                </button>
            </div>
        </form>
    );
};
