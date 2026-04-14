import { AlertCircle, CheckCircle2, FileText, Loader2, Upload } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';

// Shadcn UI Components
import ConfirmDialog from '@/components/Shared/ConfirmDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import api from '@/lib/axios';
import procurement from '@/routes/procurement';
import axios from 'axios'; // Raw, clean slate for Cloudflare
import { toast } from 'sonner';

interface SelectOption {
    value: string;
    label: string;
    color?: string;
}

interface UploadDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    procurementId: string | number;
    onSuccess: () => void;
    docTypes: SelectOption[];
}

export function ProcurementUploadDialog({ isOpen, onOpenChange, procurementId, onSuccess, docTypes }: UploadDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [docType, setDocType] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isAlertConfirmOpen, setIsAlertConfirmOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { currentMunicipality } = useMunicipality();

    const resetForm = () => {
        setFile(null);
        setDocType('');
        setProgress(0);
        setStatus('idle');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const partialSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsAlertConfirmOpen(true);
    };
    const MAX_FILE_SIZE_MB = 25; // Set your limit here
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    const handleUpload = async () => {
        if (!file || !docType) return;

        // 🛡️ FRONTEND VALIDATION
        if (file.size > MAX_FILE_SIZE_BYTES) {
            toast.error('File too large', {
                description: `Please select a document smaller than ${MAX_FILE_SIZE_MB}MB.`,
            });
            return;
        }

        setIsAlertConfirmOpen(false);
        setIsUploading(true);
        setStatus('idle');

        try {
            const extension = file.name.split('.').pop();
            const genUrlEndpoint = procurement.generate.upload.url(procurementId);

            // 🟢 STEP 1: Talk to Laravel (Use 'api')
            const { data: ticket } = await api.post(
                genUrlEndpoint,
                {
                    extension,
                    content_type: file.type,
                    file_size: file.size,
                    type: docType,
                },
                {
                    headers: { 'X-Municipality-Slug': currentMunicipality.slug },
                },
            );

            if (!ticket || !ticket.upload_url) {
                setStatus('error');
                return;
            }

            // 🟠 STEP 2: Talk to Cloudflare R2 (Use RAW 'axios')
            // Using raw axios guarantees no 'withCredentials' CORS errors!
            await axios.put(ticket.upload_url, file, {
                headers: { 'Content-Type': file.type },
                onUploadProgress: (p) => {
                    const pct = Math.round((p.loaded * 100) / (p.total ?? 1));
                    setProgress(pct);
                },
            });

            // 🟢 STEP 3: Talk to Laravel (Use 'api')
            const saveUrlEndpoint = procurement.document.upload.url(procurementId);
            await api.post(
                saveUrlEndpoint,
                {
                    file_path: ticket.storage_path,
                    type: docType,
                    file_name: file.name,
                    file_size: file.size,
                    mime_type: file.type,
                },
                {
                    headers: { 'X-Municipality-Slug': currentMunicipality.slug },
                },
            );

            setStatus('success');
            onSuccess();
        } catch (error) {
            console.error('Upload Error:', error);
            setStatus('error');

            // 🛡️ ERROR HANDLING LOGIC
            // If the error came from Laravel (api), the global interceptor ALREADY showed the toast.
            // We only need to show a toast if the RAW axios (Cloudflare upload) failed.
            if (axios.isAxiosError(error) && !error.response?.data?.message) {
                toast.error('Cloud Upload Failed', {
                    description: 'There was an issue sending the file to the storage bucket.',
                });
            }
        } finally {
            setIsUploading(false);
        }
    };

    // Helper to get the human-readable label for the confirmation message
    const getDocTypeLabel = () => docTypes.find((t) => t.value === docType)?.label || 'Document';

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !isUploading && onOpenChange(open)}>
                <DialogContent
                    className="sm:max-w-[425px]"
                    // Prevent closing by clicking outside while uploading
                    onInteractOutside={(e) => {
                        if (isUploading) e.preventDefault();
                    }}
                    onEscapeKeyDown={(e) => {
                        if (isUploading) e.preventDefault();
                    }}
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" />
                            Upload Document
                        </DialogTitle>
                    </DialogHeader>

                    {status === 'success' ? (
                        <div className="flex flex-col items-center space-y-4 py-6 text-center">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                            <div className="space-y-1">
                                <h4 className="text-lg font-semibold">Upload Complete!</h4>
                                <p className="text-sm text-muted-foreground">The file is now attached to the procurement.</p>
                            </div>
                            <div className="flex w-full gap-2 pt-4">
                                <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                                    Close
                                </Button>
                                <Button className="flex-1" onClick={resetForm}>
                                    Upload Another
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-6 py-4">
                            {/* File Selection */}
                            <div className="grid gap-2">
                                <Label htmlFor="file">Document File (PDF only)</Label>
                                <div
                                    onClick={() => !isUploading && fileInputRef.current?.click()}
                                    className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${file ? 'border-blue-400 bg-blue-50' : 'border-muted hover:border-muted-foreground'}`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".pdf"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    />
                                    <Upload className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                                    <span className="text-sm font-medium text-slate-600">{file ? file.name : 'Click to select file'}</span>
                                </div>
                            </div>

                            {/* Type Selection */}
                            <div className="grid gap-2">
                                <Label>Document Category</Label>
                                <Select value={docType} onValueChange={setDocType} disabled={isUploading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select document type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {docTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Progress Bar */}
                            {isUploading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium text-blue-600">
                                        <span>Uploading to Cloud...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>
                            )}

                            {/* Error Alert */}
                            {status === 'error' && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>Failed to upload. Please check your connection.</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}

                    {status !== 'success' && (
                        <DialogFooter>
                            {/* Changed type to button so it doesn't try to trigger native form submissons if wrapped in a <form> later */}
                            <Button type="button" className="w-full" onClick={partialSubmit} disabled={!file || !docType || isUploading}>
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Start Upload'
                                )}
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={isAlertConfirmOpen}
                onCancel={() => setIsAlertConfirmOpen(false)}
                onConfirm={handleUpload}
                // FIX 3: Contextual Copywriting
                title="Confirm Upload"
                message={`Are you sure you want to officially attach ${file?.name} as an ${getDocTypeLabel()}?`}
                confirmText="Yes, Upload File"
                cancelText="Cancel"
                // isProcessing is false because this dialog closes instantly when confirmed
                isProcessing={false}
            />
        </>
    );
}
