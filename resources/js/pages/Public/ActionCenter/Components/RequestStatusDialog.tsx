import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Utility from '@/pages/Utility/Utility';
import { CheckCircle, Clock, FileText, InfoIcon, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    isOpen: boolean;
    selectedRequest: RequestData | null | undefined;
    onClose: () => void;
}

interface RequestData {
    id: number;
    title: string;
    status: string;
    requestedDate: string;
    transactionNumber: string;
    vehicleRequested: string | null;
    documentUploaded: boolean;
    reviewComment: string | null;
    data: {
        clientName: string;
        clientAge: string;
        clientContactNumber: string;
        clientAddress: string;
    }[];
}

export default function RequestStatusDialog({ isOpen, selectedRequest, onClose }: Props) {
    const [clientName, setClientName] = useState('');
    const [clientAge, setClientAge] = useState('');
    const [clientContactMumber, setClientContactNumber] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [clientRequestedService, setClientRequestedService] = useState('');
    const [files, setFiles] = useState<{ files: File[] }>({ files: [] });
    const [totalFileSize, setTotalFileSize] = useState(0);

    useEffect(() => {
        initLogic();
    });

    async function initLogic() {
        setClientName(selectedRequest?.data[0]?.clientName ?? '');
        setClientAge(selectedRequest?.data[0]?.clientAge ?? '');
        setClientContactNumber(selectedRequest?.data[0]?.clientContactNumber ?? '');
        setClientAddress(selectedRequest?.data[0]?.clientAddress ?? '');
        setClientRequestedService(selectedRequest!.title);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);

        if (selectedFiles.length > 10) {
            alert('You can only select up to 10 files.');
            e.target.value = '';
            return;
        }

        const updatedFiles = [...files.files];
        let newTotalSize = totalFileSize;

        selectedFiles.forEach((file) => {
            if (!updatedFiles.some((f) => f.name === file.name && f.size === file.size)) {
                updatedFiles.push(file);
                newTotalSize += file.size;
            }
        });

        setFiles({ files: updatedFiles });
        setTotalFileSize(newTotalSize);
    };

    // Helper to determine status styling
    const getStatusStyles = (status: string | undefined) => {
        switch (status) {
            case 'In-review':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Approved':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected':
                return 'bg-destructive/10 text-destructive border-destructive/20'; // Uses theme 'destructive'
            case 'Document':
                return 'bg-secondary text-secondary-foreground border-border'; // Uses theme 'secondary'
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="scrollbar-hide m-0 h-screen w-full max-w-none overflow-y-auto rounded-none border-border bg-background p-4 sm:m-auto sm:h-auto sm:max-w-[700px] sm:rounded-lg lg:h-5/6"
            >
                <DialogHeader>
                    <DialogTitle className="p-3 text-center text-xl font-bold text-foreground">Request Status</DialogTitle>
                </DialogHeader>
                <form
                    className="flex flex-col gap-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                >
                    {/* Status Badge */}
                    <div
                        className={`flex flex-col items-center rounded-lg border px-4 py-6 text-center ${getStatusStyles(selectedRequest?.status)}`}
                    >
                        {selectedRequest?.status === 'In-review' ? (
                            <Clock size={40} className="mb-2 opacity-80" />
                        ) : selectedRequest?.status === 'Approved' ? (
                            <CheckCircle size={40} className="mb-2 opacity-80" />
                        ) : selectedRequest?.status === 'Document' ? (
                            <FileText size={40} className="mb-2 opacity-80" />
                        ) : selectedRequest?.status === 'Rejected' ? (
                            <XCircle size={40} className="mb-2 opacity-80" />
                        ) : (
                            <Clock size={40} className="mb-2 opacity-80" />
                        )}

                        <span className="text-xl font-bold">{selectedRequest?.status}</span>

                        <span className="mt-1 text-sm font-medium opacity-90">
                            {selectedRequest?.status === 'In-review'
                                ? 'Your application is being reviewed by Action Center.'
                                : selectedRequest?.status === 'Approved'
                                  ? 'Your application has been approved. Please check details below.'
                                  : selectedRequest?.status === 'Rejected'
                                    ? 'Your application has been rejected. More details below.'
                                    : selectedRequest?.status === 'Document'
                                      ? 'Your application is pending. Please submit the necessary documents.'
                                      : 'Unknown status.'}
                        </span>
                    </div>

                    {/* Review Comment Box (If Rejected or Document needed) */}
                    {(selectedRequest?.status === 'Rejected' || selectedRequest?.status === 'Document') && (
                        <div
                            className={`flex flex-row items-start gap-3 rounded-md border p-3 text-sm ${
                                selectedRequest?.status === 'Document'
                                    ? 'border-border bg-secondary text-secondary-foreground'
                                    : 'border-destructive/20 bg-destructive/5 text-destructive'
                            }`}
                        >
                            <InfoIcon size={18} className="mt-0.5 shrink-0" />
                            <span>{selectedRequest.reviewComment}</span>
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name / Pangalan</label>
                            <Input
                                id="clientName"
                                disabled={true}
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="bg-muted/50 text-foreground"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Age / Edad</label>
                            <Input
                                id="clientAge"
                                disabled={true}
                                value={clientAge}
                                onChange={(e) => setClientAge(e.target.value)}
                                className="bg-muted/50 text-foreground"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact number</label>
                            <Input
                                id="clientContactNumber"
                                disabled={true}
                                value={clientContactMumber}
                                onChange={(e) => setClientContactNumber(e.target.value)}
                                className="bg-muted/50 text-foreground"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Address</label>
                            <Input
                                id="clientAddress"
                                disabled={true}
                                value={clientAddress}
                                onChange={(e) => setClientAddress(e.target.value)}
                                className="bg-muted/50 text-foreground"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assistance needed</label>
                        <Input
                            id="clientSelectedService"
                            value={clientRequestedService}
                            className="bg-muted/50 text-foreground"
                            disabled={true}
                        />
                    </div>

                    {/* File Upload Section (Only shown if status is 'Document') */}
                    {selectedRequest?.status === 'Document' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Upload Documents</label>
                            <div
                                onClick={() => document.getElementById('file-upload')?.click()}
                                className="cursor-pointer rounded-md border border-dashed border-input bg-background p-4 text-center hover:bg-muted/50 transition-colors"
                            >
                                <p className="text-sm text-muted-foreground">Click to select files</p>
                                <input
                                    type="file"
                                    multiple
                                    id="file-upload"
                                    className="hidden"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <ul className="max-h-32 list-inside overflow-y-auto text-sm text-foreground">
                                {files.files.filter((file) => file.type.startsWith('image/') || file.type === 'application/pdf').length === 0 ? (
                                    <li className="text-muted-foreground italic">No files selected</li>
                                ) : (
                                    files.files
                                        .filter((file) => file.type.startsWith('image/') || file.type === 'application/pdf')
                                        .map((file, index) => (
                                            <li key={index} className="flex items-center justify-between py-1">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <span className="truncate max-w-[200px]">{file.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({file.size >= 1048576 ? `${(file.size / 1048576).toFixed(2)} MB` : `${(file.size / 1024).toFixed(2)} KB`})
                                                    </span>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newFiles = [...files.files];
                                                        newFiles.splice(index, 1);
                                                        setFiles({ ...files, files: newFiles });
                                                        setTotalFileSize(totalFileSize - file.size);
                                                    }}
                                                    className="h-auto px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    Remove
                                                </Button>
                                            </li>
                                        ))
                                )}
                            </ul>
                        </div>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex flex-col gap-1 rounded-md bg-muted p-3 text-xs text-muted-foreground">
                        <span>Submitted on {Utility().formatToReadableDate(selectedRequest?.requestedDate)}</span>
                        <span>Transaction No. <span className="font-mono text-foreground">{selectedRequest?.transactionNumber}</span></span>
                    </div>

                    {/* Actions */}
                    <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button variant="outline" type="button" onClick={onClose} className="sm:w-auto">
                            Close
                        </Button>

                        {(selectedRequest?.status === 'Document' || selectedRequest?.status === 'Rejected') && (
                            <Button
                                type="button" // Use type="submit" if you wire up the form submission
                                onClick={() => {
                                    console.log('Submitting updated info...');
                                }}
                                className="sm:w-auto"
                            >
                                Submit Update
                            </Button>
                        )}
                        
                        {/* Just for display, if it's approved */}
                        {selectedRequest?.status === 'Approved' && (
                            <Button disabled className="bg-green-600 text-white opacity-100 sm:w-auto">
                                Approved
                            </Button>
                        )}
                         {/* Just for display, if it's in-review */}
                         {selectedRequest?.status === 'In-review' && (
                            <Button disabled variant="secondary" className="sm:w-auto">
                                Pending Review
                            </Button>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}