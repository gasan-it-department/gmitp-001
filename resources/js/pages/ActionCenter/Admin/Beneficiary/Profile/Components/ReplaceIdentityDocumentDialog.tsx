import ReplaceBeneficiaryIdentityDocumentController from '@/actions/App/External/Documents/ActionCenter/ReplaceBeneficiaryIdentityDocumentController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { getCroppedImg } from '@/lib/cropImage';
import { useForm, usePage } from '@inertiajs/react';
import { FileUp, Loader2, RotateCw } from 'lucide-react';
import { FormEventHandler, useCallback, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';

type IdentityDocumentSide = 'front' | 'back';

interface Props {
    beneficiaryId: string;
    side: IdentityDocumentSide;
    isVerified: boolean;
    hasDocument: boolean;
    trigger?: React.ReactNode;
}

export default function ReplaceIdentityDocumentDialog({ beneficiaryId, side, isVerified, hasDocument, trigger }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const inputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
        document: File | null;
        reason: string;
    }>({
        document: null,
        reason: '',
    });

    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [isVertical, setIsVertical] = useState(false);

    const sideLabel = side === 'front' ? 'front' : 'back';
    const actionLabel = hasDocument ? `Replace ID ${sideLabel}` : `Upload ID ${sideLabel}`;

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();

        post(ReplaceBeneficiaryIdentityDocumentController.url({ beneficiaryId, side }), {
            forceFormData: true,
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            preserveScroll: true,
            onSuccess: () => handleClose(),
        });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        event.target.value = '';

        if (selectedFile) {
            if (selectedFile.type === 'application/pdf') {
                setData('document', selectedFile);
                return;
            }

            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setCropImageSrc(reader.result?.toString() ?? null);
            });
            reader.readAsDataURL(selectedFile);
        }
    };

    const onCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleSaveCrop = async () => {
        if (!cropImageSrc || !croppedAreaPixels) return;

        setIsCropping(true);
        try {
            const croppedFile = await getCroppedImg(cropImageSrc, croppedAreaPixels, `cropped-id-${side}.jpg`);
            setData('document', croppedFile);
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

    const handleClose = () => {
        clearErrors();
        reset();
        if (inputRef.current) inputRef.current.value = '';
        setOpen(false);
    };

    return (
        <>
            {trigger ? (
                <div onClick={() => setOpen(true)} className="inline-block cursor-pointer">
                    {trigger}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                >
                    <FileUp className="h-4 w-4" />
                    {actionLabel}
                </button>
            )}

            <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : handleClose())}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{actionLabel}</DialogTitle>
                        <DialogDescription>
                            Upload a JPG, PNG, or PDF file. Replacing this document does not change the beneficiary's verification status.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor={`identity-document-${side}`} className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                                ID {sideLabel} file
                            </Label>
                            <Input
                                ref={inputRef}
                                id={`identity-document-${side}`}
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                                onChange={handleFileChange}
                            />
                            {data.document && <p className="text-[11px] text-slate-500">{data.document.name}</p>}
                            {errors.document && <p className="text-xs font-medium text-red-500">{errors.document}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor={`identity-document-${side}-reason`}
                                className="text-xs font-bold tracking-widest text-slate-500 uppercase"
                            >
                                Reason {isVerified ? <span className="text-red-500">*</span> : <span className="text-slate-400">(optional)</span>}
                            </Label>
                            <Textarea
                                id={`identity-document-${side}-reason`}
                                rows={3}
                                className="resize-none"
                                placeholder={
                                    isVerified
                                        ? 'Explain why this verified beneficiary ID is being replaced.'
                                        : 'Optional note for the document replacement.'
                                }
                                value={data.reason}
                                onChange={(event) => setData('reason', event.target.value)}
                            />
                            {errors.reason && <p className="text-xs font-medium text-red-500">{errors.reason}</p>}
                        </div>

                        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button type="button" variant="ghost" onClick={handleClose} disabled={processing}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || data.document === null}
                                className="bg-slate-900 text-white hover:bg-slate-800"
                            >
                                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                                Save document
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Cropper Dialog */}
            <Dialog open={!!cropImageSrc} onOpenChange={(isOpen) => !isOpen && handleCancelCrop()}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Crop ID Photo</DialogTitle>
                        <DialogDescription>
                            Pinch or drag to align your ID within the frame. Ensure all text and corners are visible.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative h-[45vh] max-h-[400px] min-h-64 w-full overflow-hidden rounded-lg bg-slate-950">
                        {cropImageSrc && (
                            <Cropper
                                image={cropImageSrc}
                                crop={crop}
                                zoom={zoom}
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

                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setIsVertical(!isVertical)}
                                className="flex items-center gap-2"
                            >
                                <RotateCw className="h-4 w-4" />
                                {isVertical ? 'Switch to Horizontal' : 'Switch to Vertical'}
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="ghost" onClick={handleCancelCrop} disabled={isCropping}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleSaveCrop} disabled={isCropping}>
                            {isCropping ? 'Saving...' : 'Save Crop'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
