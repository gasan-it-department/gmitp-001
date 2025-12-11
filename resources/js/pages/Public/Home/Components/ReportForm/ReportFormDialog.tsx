import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { CommunityReportApi } from '@/Core/Api/CommunityReport/CommunityReportApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { AlertTriangle, FileIcon, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

// --- MOCK DEFINITIONS AND TYPES ---
interface CommunityReportFormData {
    issue_type: string;
    location: string;
    description: string;
    sender_name: string;
    contact: string;
    latitude: string;
    longitude: string;
    files: File[];
}

interface ClassicDialogState {
    title: string;
    message: string;
    positiveButtonTitle: string;
    negativeButtonTitle: string;
    isShowing: boolean;
    hideNegativeButton: boolean;
}

const MapCoordinates = ({ latitude, longitude }: { latitude: number; longitude: number }) => (
    <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-500">
        Map Preview: ({latitude}, {longitude})
    </div>
);

const ClassicDialog = ({ title, message, open, onPositiveClick, hideNegativeButton, positiveButtonText }: any) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                <p className="mt-3 text-sm whitespace-pre-wrap text-gray-600">{message}</p>
                <div className="mt-5 flex justify-end">
                    <button onClick={onPositiveClick} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        {positiveButtonText || 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
};
// ------------------------------------------

// --- MAIN COMPONENT ---

export function ReportFormDialog({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; onSuccess: () => void }) {
    const { currentMunicipality } = useMunicipality();
    const [isSubmitting, setIsSubmiting] = useState(false);
    const [isGettingCoordinates, setIsGettingCoordinates] = useState(false);
    const [classicDialog, setClassicDialog] = useState<ClassicDialogState>({
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

    // --- DIRECT GEOLOCATION HANDLER (Consolidated Logic) ---
    const handleGetLocation = () => {
        setIsGettingCoordinates(true);
        clearErrors('latitude');
        clearErrors('longitude');

        if (!navigator.geolocation) {
            setClassicDialog((prev) => ({
                ...prev,
                title: 'Geolocation Not Supported',
                message: 'Your browser or device does not support location services.',
                hideNegativeButton: true,
                positiveButtonTitle: 'Close',
                isShowing: true,
            }));
            setIsGettingCoordinates(false);
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
        };

        window.navigator.geolocation.getCurrentPosition(
            // === SUCCESS CALLBACK ===
            (position) => {
                const latitude = String(position.coords.latitude);
                const longitude = String(position.coords.longitude);
                setValue('latitude', latitude, { shouldValidate: true });
                setValue('longitude', longitude, { shouldValidate: true });
                setIsGettingCoordinates(false);
            },

            // === ERROR CALLBACK ===
            (error) => {
                let title = 'Location Access Required';
                let message;

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message =
                            'Location permission was permanently denied by your device or browser settings.\n\n' +
                            '**Troubleshooting Steps:**\n' +
                            "1. Go to your Phone's Settings (Android/iOS).\n" +
                            "2. Find Apps/Browser settings and ensure Location access is 'Allowed'.\n" +
                            '3. Restart your browser and try again.\n\n' +
                            "Still can't get location? Please check if the website is running at https not in http.";
                        title = 'ACCESS DENIED (Check Settings)';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = "Location information is unavailable. Ensure your device's GPS is ON and you have a clear sky view.";
                        break;
                    case error.TIMEOUT:
                        message = 'The location request timed out (15 seconds). Check your internet/GPS signal strength and try again.';
                        title = 'Request Timed Out';
                        break;
                    default:
                        message = 'An unknown error occurred while attempting to find your location.';
                }

                setValue('latitude', '');
                setValue('longitude', '');

                setClassicDialog((prev) => ({
                    ...prev,
                    title: title,
                    message: message,
                    hideNegativeButton: true,
                    positiveButtonTitle: 'OK',
                    isShowing: true,
                }));
                setIsGettingCoordinates(false);
            },
            options,
        );
    };
    // ---------------------------------------------------

    const onSubmit = async (data: CommunityReportFormData) => {
        console.log('Report Submitted:', data);
        setIsSubmiting(true);
        console.log(currentMunicipality.slug);

        // --- API CALL ---
        const response = await CommunityReportApi.storeCommunityReport(currentMunicipality.slug, data);
        if (response.success) {
            setIsSubmiting(false);
            onOpenChange(false);
            reset();
            onSuccess();
        } else {
            setClassicDialog((prev) => ({
                ...prev,
                title: 'Submission Failed',
                message: 'There was an error submitting your report. Please try again.',
                hideNegativeButton: true,
                positiveButtonTitle: 'OK',
                isShowing: true,
            }));
            setIsSubmiting(false);
        }
    };

    useEffect(() => {
        // Reset coordinates when dialog opens/closes
        if (open) {
            setValue('latitude', '');
            setValue('longitude', '');
            setError(null); // Clear any file errors
        }
    }, [open, setValue]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={true}
                className="
                    /* MOBILE (Default: Full Screen) */
                    flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden rounded-none border-0
                    
                    /* DESKTOP/LAPTOP (sm: breakpoint and above) */
                    sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-xl sm:rounded-2xl sm:border
                    lg:max-w-2xl 
                    
                    bg-white p-0
                ">
                {/* HEADER */}
                <div className="sticky top-0 z-50 bg-gradient-to-r from-red-500 to-orange-500 px-6 py-5 sm:px-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white">Report Local Issue</DialogTitle>
                    </DialogHeader>
                </div>

                <div className="space-y-10 px-6 py-6 sm:px-8 sm:py-8 overflow-auto">
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
                                    <RadioGroup
                                        value={field.value}
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            clearErrors('issue_type');
                                        }}
                                        className="flex flex-wrap gap-6 pt-1"
                                    >
                                        {['Road Damage', 'Streetlight', 'Garbage', 'Water Leak', 'Others'].map((issue) => (
                                            <div key={issue} className="flex items-center space-x-2">
                                                <RadioGroupItem value={issue.toLowerCase()} id={issue} />
                                                <Label htmlFor={issue} className="cursor-pointer">
                                                    {issue}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
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
                                {...register('location', { required: 'Location description is required.' })}
                                className={errors.location ? 'border-red-500' : ''}
                            />

                            {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}

                            <div className="grid gap-3 sm:grid-cols-2">
                                <Input
                                    placeholder="Latitude"
                                    {...register('latitude', { required: 'GPS coordinates are required.' })}
                                    readOnly
                                    className={errors.latitude ? 'border-red-500' : ''}
                                />
                                <Input
                                    placeholder="Longitude"
                                    {...register('longitude', { required: 'GPS coordinates are required.' })}
                                    readOnly
                                    className={errors.longitude ? 'border-red-500' : ''}
                                />
                            </div>

                            {watch('latitude') && watch('longitude') && (
                                <div className="relative mt-3 h-64 w-full overflow-hidden rounded-xl border">
                                    {/* Note: MapCoordinates component needs an external map library to function */}
                                    <MapCoordinates latitude={Number(watch('latitude'))} longitude={Number(watch('longitude'))} />
                                </div>
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onClick={handleGetLocation}
                                disabled={isGettingCoordinates}
                            >
                                {isGettingCoordinates ? 'Getting coordinates...' : 'Get GPS Coordinates'}
                            </Button>
                            {errors.latitude && <p className="text-sm text-red-500">{errors.latitude.message}</p>}
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
                                disabled={isSubmitting}
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
