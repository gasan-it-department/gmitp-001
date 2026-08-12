import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getCroppedImg } from '@/lib/cropImage';
import { FileText, Info, Ratio, RotateCcw, RotateCw, Upload, X } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { ProfileSetupFormData, SectionProps } from '../types';

const ACCEPTED_ID_TYPES = '.jpg,.jpeg,.png,.pdf';

interface IdentityDocumentUploadSectionProps extends SectionProps {
    frontRequired?: boolean;
    frontEmptyHint?: string;
    existingFrontUploaded?: boolean;
    existingBackUploaded?: boolean;
}

export function IdentityDocumentUploadSection({
    data,
    setData,
    errors,
    frontRequired = true,
    frontEmptyHint = 'Required for verification review',
    existingFrontUploaded = false,
    existingBackUploaded = false,
}: IdentityDocumentUploadSectionProps) {
    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex gap-3">
                    <Info className="h-5 w-5 shrink-0 text-blue-600" />
                    <div>
                        <h4 className="text-sm font-bold text-blue-900">Accepted Valid IDs</h4>
                        <p className="mt-1 text-xs text-blue-700">Please upload a clear photo of one of the following valid identification cards:</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {[
                                'Senior Citizen ID',
                                'National ID (PhilSys)',
                                'PWD ID',
                                "Driver's License",
                                'UMID',
                                "Voter's ID",
                                'Postal ID',
                                'Passport',
                            ].map((id) => (
                                <span
                                    key={id}
                                    className="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-800"
                                >
                                    {id}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DocumentUploadCard
                    id="identity_id_front"
                    label="ID front"
                    required={frontRequired}
                    emptyHint={frontEmptyHint}
                    file={data.identity_id_front ?? null}
                    existingUploaded={existingFrontUploaded}
                    error={errors.identity_id_front}
                    onChange={(file) => setData('identity_id_front', file)}
                />

                <DocumentUploadCard
                    id="identity_id_back"
                    label="ID back"
                    file={data.identity_id_back ?? null}
                    existingUploaded={existingBackUploaded}
                    error={errors.identity_id_back}
                    onChange={(file) => setData('identity_id_back', file)}
                />
            </div>
        </div>
    );
}

function DocumentUploadCard({
    id,
    label,
    required = false,
    emptyHint,
    file,
    existingUploaded = false,
    error,
    onChange,
}: {
    id: keyof Pick<ProfileSetupFormData, 'identity_id_front' | 'identity_id_back'>;
    label: string;
    required?: boolean;
    emptyHint?: string;
    file: File | null;
    existingUploaded?: boolean;
    error?: string;
    onChange: (file: File | null) => void;
}) {
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropping, setIsCropping] = useState(false);
    const [isVertical, setIsVertical] = useState(false);
    const [rotation, setRotation] = useState(0);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        event.target.value = '';

        if (selectedFile) {
            // Don't crop PDFs
            if (selectedFile.type === 'application/pdf') {
                onChange(selectedFile);
                return;
            }

            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                setRotation(0);
                setCropImageSrc(reader.result?.toString() ?? null);
            });
            reader.readAsDataURL(selectedFile);
        }
    };

    const onCropComplete = useCallback((_croppedArea: any, pixels: any) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleSaveCrop = async () => {
        if (!cropImageSrc || !croppedAreaPixels) return;

        setIsCropping(true);
        try {
            const croppedFile = await getCroppedImg(cropImageSrc, croppedAreaPixels, 'cropped-id.jpg', rotation);
            onChange(croppedFile);
            setCropImageSrc(null);
        } catch (e) {
            console.error(e);
        } finally {
            setIsCropping(false);
        }
    };

    const handleCancelCrop = () => {
        setCropImageSrc(null);
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <label htmlFor={id} className="text-sm font-bold text-slate-800">
                        {label}
                        {required && <span className="ml-1 text-red-500">*</span>}
                    </label>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">JPG, PNG, or PDF. Maximum 5 MB.</p>
                </div>
                <FileText className="h-5 w-5 shrink-0 text-slate-400" />
            </div>

            <input id={id} type="file" accept={ACCEPTED_ID_TYPES} onChange={handleFileChange} className="sr-only" />

            {file ? (
                <div className="mt-4 space-y-3">
                    {file.type.startsWith('image/') && (
                        <div className="aspect-[1.586/1] overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                            <SelectedImagePreview file={file} label={label} />
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                            <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onChange(null)}
                            className="h-8 w-8 shrink-0 text-slate-500 hover:text-red-600"
                            aria-label={`Remove ${label}`}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : existingUploaded ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3">
                    <p className="text-sm font-semibold text-emerald-800">{label} already uploaded</p>
                    <p className="mt-1 text-xs text-emerald-700">Choose a new file only if MSWD asked you to replace it.</p>
                </div>
            ) : (
                <label
                    htmlFor={id}
                    className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center transition hover:border-[#005088] hover:bg-blue-50"
                >
                    <Upload className="h-6 w-6 text-[#005088]" />
                    <span className="mt-2 text-sm font-bold text-slate-800">Choose file</span>
                    <span className="mt-1 text-xs text-slate-500">{emptyHint ?? (required ? 'Required for verification review' : 'Optional')}</span>
                </label>
            )}

            {(file || existingUploaded) && (
                <label
                    htmlFor={id}
                    className="mt-3 inline-flex cursor-pointer text-xs font-semibold text-[#005088] hover:text-[#003d66] hover:underline"
                >
                    {file ? 'Replace file' : 'Upload replacement'}
                </label>
            )}

            {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}

            <Dialog open={!!cropImageSrc} onOpenChange={(open) => !open && handleCancelCrop()}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Crop ID Photo</DialogTitle>
                        <DialogDescription>
                            Rotate the ID until the text is upright, then keep all text and corners inside the frame.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative h-[400px] w-full overflow-hidden rounded-lg bg-slate-950">
                        {cropImageSrc && (
                            <Cropper
                                image={cropImageSrc}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={isVertical ? 53.98 / 85.6 : 85.6 / 53.98}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        )}
                    </div>

                    <div className="mt-2 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <span className="w-12 text-sm font-medium text-slate-700">Zoom</span>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="flex-1"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setRotation((current) => (current + 270) % 360)}
                                className="gap-2"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Rotate left
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setRotation((current) => (current + 90) % 360)}
                                className="gap-2"
                            >
                                <RotateCw className="h-4 w-4" />
                                Rotate right
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setIsVertical(!isVertical)}
                                className="gap-2 sm:ml-auto"
                            >
                                <Ratio className="h-4 w-4" />
                                {isVertical ? 'Horizontal frame' : 'Vertical frame'}
                            </Button>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-500">Siguraduhing tuwid at nababasa ang ID bago isumite.</p>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="ghost" onClick={handleCancelCrop} disabled={isCropping}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleSaveCrop} disabled={isCropping}>
                            {isCropping ? 'Saving...' : 'Save Crop'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SelectedImagePreview({ file, label }: { file: File; label: string }) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    if (previewUrl === null) {
        return null;
    }

    return <img src={previewUrl} alt={`${label} preview`} className="h-full w-full object-contain" />;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
