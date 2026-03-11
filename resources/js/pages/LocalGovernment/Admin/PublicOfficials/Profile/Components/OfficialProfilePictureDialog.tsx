import UpdateOfficialProfilePictureController from '@/actions/App/External/Api/Controllers/Government/Official/UpdateOfficialProfilePictureController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';

interface Props {
    officialId: string;
    currentImageUrl?: string | null;
}

export const OfficialProfilePictureDialog = ({ officialId, currentImageUrl }: Props) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cancelTokenRef = useRef<{ cancel: () => void } | null>(null); // 👉 Holds the Axios cancel token

    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0); // 👉 Tracks upload percentage
    const [uploadError, setUploadError] = useState<string | null>(null);

    const { currentMunicipality } = useMunicipality();

    // Triggered when the user selects a file from their computer
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setUploadError(null);
        setUploadProgress(0);
        setIsOpen(true);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Safely close the modal and clear browser memory
    const handleClose = () => {
        // Do not allow normal closing if actively uploading (force them to use the cancel button)
        if (isUploading) return;

        setIsOpen(false);
        setTimeout(() => {
            setSelectedFile(null);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setUploadError(null);
            setUploadProgress(0);
        }, 200);
    };

    // Execute the upload
    const handleSave = () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setUploadError(null);
        setUploadProgress(0);

        router.post(
            UpdateOfficialProfilePictureController.url({ officialId: officialId }),
            {
                _method: 'put',
                profile_picture: selectedFile,
            },
            {
                headers: {
                    'X-Municipality-Slug': currentMunicipality.slug,
                },
                forceFormData: true,
                preserveScroll: true,
                // 👉 Capture the cancel token
                onCancelToken: (cancelToken) => {
                    cancelTokenRef.current = cancelToken as unknown as { cancel: () => void };
                },
                // 👉 Track the upload percentage
                onProgress: (event) => {
                    if (event?.percentage) {
                        setUploadProgress(Math.round(event.percentage));
                    }
                },
                onError: (errors) => {
                    setUploadError(errors.profile_picture || 'An error occurred during upload.');
                },
                onSuccess: () => {
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    handleClose();
                },
                onCancel: () => {
                    setUploadError('Upload was cancelled.');
                },
                onFinish: () => {
                    setIsUploading(false);
                    cancelTokenRef.current = null;
                },
            },
        );
    };

    // 👉 Explicitly cancel the ongoing upload request
    const handleCancelUpload = () => {
        if (cancelTokenRef.current) {
            cancelTokenRef.current.cancel();
            cancelTokenRef.current = null;
        }
    };

    return (
        <>
            {/* 1. THE TRIGGER (The Avatar & Camera Button) */}
            <div className="relative h-24 w-24 shrink-0">
                <img
                    className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md dark:border-zinc-800"
                    src={currentImageUrl || '/images/placeholder_avatar.png'}
                    alt="Official profile"
                />

                <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleFileSelect} />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm ring-2 ring-white hover:bg-slate-700 dark:ring-zinc-900"
                    aria-label="Change profile picture"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                        />
                    </svg>
                </button>
            </div>

            {/* 2. THE DIALOG (The Preview Modal) */}
            {/* Prevent closing by clicking outside if uploading */}
            <Dialog open={isOpen} onOpenChange={(open) => (!isUploading && !open ? handleClose() : null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Profile Picture</DialogTitle>
                        <DialogDescription>Preview the new profile picture before saving.</DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center justify-center py-8">
                        {previewUrl && (
                            <div className="relative flex h-40 w-40 items-center justify-center">
                                {/* The Image */}
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className={`absolute h-40 w-40 rounded-full border-4 border-slate-100 object-cover shadow-lg transition-all dark:border-zinc-800 ${
                                        isUploading ? 'scale-95 brightness-50' : 'scale-100'
                                    }`}
                                />

                                {/* The Overlay Loading Animation */}
                                {isUploading && (
                                    <div className="absolute flex flex-col items-center justify-center text-white">
                                        <svg className="mb-2 h-8 w-8 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        <span className="text-xs font-bold tracking-widest">{uploadProgress}%</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Error Message Space */}
                        <div className="mt-4 h-5 text-center">
                            {uploadError && <p className="text-sm font-medium text-red-600 dark:text-red-400">{uploadError}</p>}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:justify-end">
                        {isUploading ? (
                            <Button type="button" variant="destructive" onClick={handleCancelUpload}>
                                Stop Upload
                            </Button>
                        ) : (
                            <>
                                <Button type="button" variant="secondary" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button type="button" onClick={handleSave}>
                                    Save Changes
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
