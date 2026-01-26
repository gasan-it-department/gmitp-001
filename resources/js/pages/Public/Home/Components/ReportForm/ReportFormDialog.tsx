import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CommunityReportApi } from '@/Core/Api/CommunityReport/CommunityReportApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { CommunityReportFormData } from '@/Core/Types/CommunityReportPage/CommunityReportPageTypes';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { AlertTriangle, FileIcon, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import MapCoordinates from './MapCoordinates';
import { ReportTypeOption } from './ReportType';

interface ReportFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    onFailed?: (errorMessage: string) => void;
}

export function ReportFormDialog({ open, onOpenChange, onSuccess, onFailed }: ReportFormDialogProps) {
    const { currentMunicipality } = useMunicipality();
    const { auth } = usePage<SharedData>().props;
    const [isSubmitting, setIsSubmiting] = useState({
        isOpen: false,
        title: 'Loading, please wait...',
    });
    const [isGettingCoordinates, setIsGettingCoordinates] = useState(false);
    const [classicDialog, setClassicDialog] = useState({
        title: '',
        message: '',
        positiveButtonTitle: '',
        negativeButtonTitle: '',
        isShowing: false,
        hideNegativeButton: false,
    });
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        clearErrors,
        watch,
        formState: { errors },
        reset,
    } = useForm<CommunityReportFormData>({
        defaultValues: {
            issue_type: '',
            location: '',
            description: '',
            sender_name: '',
            contact: '',
            latitude: '',
            longitude: '',
            files: [],
        },
        mode: 'onSubmit',
    });

    const files = watch('files');
    const MAX_FILES = 5;
    const MAX_TOTAL_SIZE = 50 * 1024 * 1024;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);
        const combined = [...files, ...newFiles].slice(0, MAX_FILES);

        const totalSize = combined.reduce((acc, file) => acc + file.size, 0);
        if (totalSize > MAX_TOTAL_SIZE) {
            setError('Total file size exceeds 50MB limit.');
            return;
        }
        setError(null);
        setValue('files', combined);
    };

    const removeFile = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setValue('files', updatedFiles);
    };

    const handleGetLocation = async () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }

        setIsGettingCoordinates(true);

        try {
            // Check permission status first
            const permission = await navigator.permissions.query({
                name: 'geolocation',
            });

            if (permission.state === 'denied') {
                // Permission already denied — show dialog
                setClassicDialog((prev) => ({
                    ...prev,
                    title: 'Permission Denied',
                    message: 'Location permission has been denied. Please enable it in your browser settings.',
                    hideNegativeButton: true,
                    positiveButtonTitle: 'Close',
                    isShowing: true,
                }));
                setIsGettingCoordinates(false);
                return;
            }

            // If state is "granted" or "prompt", we can try to get location
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setValue('latitude', String(position.coords.latitude));
                    setValue('longitude', String(position.coords.longitude));
                    setIsGettingCoordinates(false);
                },
                (error) => {
                    let message = 'Unable to get coordinates.';
                    if (error.code === error.PERMISSION_DENIED) {
                        message = 'Location permission denied. Please allow permission and try again.';
                    }

                    setClassicDialog((prev) => ({
                        ...prev,
                        title: 'Error',
                        message,
                        hideNegativeButton: true,
                        positiveButtonTitle: 'Close',
                        isShowing: true,
                    }));

                    setIsGettingCoordinates(false);
                },
            );
        } catch (err: any) {
            console.log('Permission API error:', err);
            // Fallback if the browser doesn't support Permission API
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setValue('latitude', String(position.coords.latitude));
                    setValue('longitude', String(position.coords.longitude));
                    setIsGettingCoordinates(false);
                },
                () => {
                    setClassicDialog((prev) => ({
                        ...prev,
                        title: 'Permission Denied',
                        message: 'Unable to get coordinates. Please allow Location permission.',
                        hideNegativeButton: true,
                        positiveButtonTitle: 'Close',
                        isShowing: true,
                    }));
                    setIsGettingCoordinates(false);
                },
            );
        }
    };

    const onSubmit = async (data: CommunityReportFormData) => {
        try {
            console.log('Report Submitted:', data);
            setIsSubmiting((prev) => ({
                ...prev,
                isOpen: true,
                title: 'Submitting...',
            }));
            const response = await CommunityReportApi.storeCommunityReport(currentMunicipality.slug, data);
            if (response.success) {
                setIsSubmiting((prev) => ({
                    ...prev,
                    isOpen: false,
                    title: 'Submitting...',
                }));
                onOpenChange(false);
                reset();
                onSuccess();
            }
        } catch (error: any) {
            if (onFailed !== undefined) {
                onFailed(error);
                onOpenChange(false);
            }
        } finally {
            setIsSubmiting((prev) => ({
                ...prev,
                isOpen: false,
                title: 'Submitting...',
            }));
        }
    };

    useEffect(() => {
        setValue('latitude', '');
        setValue('longitude', '');
        setValue('contact', auth.user?.phone || '');
    }, [open]);

    const handleClearCoordinates = () => {
        setValue('latitude', '');
        setValue('longitude', '');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={true}
                className="/* MOBILE (Default: Full Screen) */ /* DESKTOP/LAPTOP (sm: breakpoint and above) */ flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden rounded-none border-0 bg-white p-0 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-xl sm:rounded-2xl sm:border lg:max-w-2xl"
            >
                {/* HEADER */}
                <div className="sticky top-0 z-50 bg-gradient-to-r from-red-500 to-orange-500 px-6 py-5 sm:px-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white">Report Local Issue</DialogTitle>
                    </DialogHeader>
                </div>

                <div className="space-y-10 overflow-auto px-6 py-6 sm:px-8 sm:py-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                        {/* ISSUE TYPE */}
                        <div className="space-y-4">
                            <Label className="font-semibold text-gray-800">
                                Type of Issue <span className="text-red-500">*</span>
                            </Label>

                            <Controller
                                control={control}
                                name="issue_type"
                                rules={{ required: 'Please select an issue type.' }}
                                render={({ field }) => (
                                    <ReportTypeOption
                                        // 1. When user clicks a button, update React Hook Form
                                        onSelect={field.onChange}
                                        // 2. Pass the current form value so the button highlights
                                        selectedValue={field.value}
                                    />
                                )}
                            />

                            {errors.issue_type && <p className="text-sm text-red-500">{errors.issue_type.message}</p>}
                        </div>

                        {/* LOCATION */}
                        <div className="space-y-4">
                            <Label className="font-semibold text-gray-800">
                                Location <span className="text-red-500">*</span>
                            </Label>

                            <Input
                                placeholder="e.g., Barangay Poblacion, near municipal hall"
                                {...register('location', { required: 'Location is required.' })}
                                className={errors.location ? 'border-red-500' : ''}
                            />

                            {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}

                            <div className="grid gap-3 sm:grid-cols-2">
                                <Input placeholder="Latitude" {...register('latitude')} readOnly />
                                <Input placeholder="Longitude" {...register('longitude')} readOnly />
                            </div>

                            {watch('latitude') && watch('longitude') && (
                                <div className="relative mt-3 h-64 w-full overflow-hidden rounded-xl border">
                                    <MapCoordinates latitude={Number(watch('latitude'))} longitude={Number(watch('longitude'))} />
                                </div>
                            )}

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                    onClick={handleGetLocation}
                                    disabled={isGettingCoordinates}
                                >
                                    {isGettingCoordinates ? 'Getting coordinates...' : 'Get GPS Coordinates'}
                                </Button>

                                {watch('latitude') && watch('longitude') && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-gray-300 text-gray-600 hover:bg-gray-100"
                                        onClick={handleClearCoordinates}
                                    >
                                        Clear Coordinates
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* DESCRIPTION */}
                        <div className="space-y-3">
                            <Label className="font-semibold text-gray-800">
                                Description <span className="text-red-500">*</span>
                            </Label>

                            <Textarea
                                rows={5}
                                placeholder="Describe the issue in detail..."
                                {...register('description', { required: 'Description is required.' })}
                                className={errors.description ? 'border-red-500' : ''}
                            />

                            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                        </div>

                        {/* FILE UPLOAD */}
                        <div className="space-y-4">
                            <Label className="font-semibold text-gray-800">Upload Photos or Videos (Optional)</Label>

                            <p className="text-sm text-gray-600">
                                Upload up to <b>5 files</b>, total size must not exceed <b>50MB</b>.
                            </p>

                            <Button
                                type="button"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => document.getElementById('evidence')?.click()}
                                disabled={files.length >= MAX_FILES}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {files.length >= MAX_FILES ? 'Max Files Reached' : 'Choose Files'}
                            </Button>

                            <input id="evidence" type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="hidden" />

                            {error && (
                                <div className="flex items-center gap-2 rounded-md border border-red-300 bg-red-100 p-2 text-sm text-red-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            {files.length > 0 && (
                                <div className="space-y-2">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm"
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                                <FileIcon className="h-4 w-4 text-orange-600" />

                                                {/* File name with ellipsis */}
                                                <span className="max-w-[140px] truncate sm:max-w-[200px]">{file.name}</span>

                                                <span className="text-xs whitespace-nowrap text-gray-500">
                                                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                                </span>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                className="h-6 w-6 flex-shrink-0 p-0 text-gray-500 hover:text-red-500"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* PERSONAL INFO */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Your Information</h3>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <Label className="font-semibold text-gray-800">Full Name (Optional)</Label>
                                    <Input placeholder="Full name (optional)" {...register('sender_name')} />
                                </div>

                                <div>
                                    <Label className="font-semibold text-gray-800">Contact Number (Optional)</Label>
                                    <Input type="tel" placeholder="+63 912 345 6789" {...register('contact')} />
                                </div>
                            </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="flex flex-row gap-4 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>

                            <Button
                                disabled={isSubmitting.isOpen}
                                type="submit"
                                className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90"
                            >
                                Submit Report
                            </Button>
                        </div>
                    </form>

                    <ClassicDialog
                        title={classicDialog.title}
                        message={classicDialog.message}
                        positiveButtonText={classicDialog.positiveButtonTitle}
                        negativeButtonText={classicDialog.negativeButtonTitle}
                        hideNegativeButton={classicDialog.hideNegativeButton}
                        onPositiveClick={() => setClassicDialog((prev) => ({ ...prev, isShowing: false }))}
                        onNegativeClick={() => setClassicDialog((prev) => ({ ...prev, isShowing: false }))}
                        open={classicDialog.isShowing}
                    />

                    <LoadingDialog isOpen={isSubmitting.isOpen} title={isSubmitting.title} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
