import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileText, Trash2, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';

// 1. Define the allowed Document Types
const DOCUMENT_TYPES = [
    { value: 'INVITATION', label: 'Invitation to Bid / Request for Quote' },
    { value: 'BID_DOCS', label: 'Bidding Documents' },
    { value: 'BULLETIN', label: 'Bid Bulletin' },
    { value: 'NOTICE_OF_AWARD', label: 'Notice of Award' },
    { value: 'CONTRACT', label: 'Contract / PO' },
    { value: 'NOTICE_TO_PROCEED', label: 'Notice to Proceed' },
    { value: 'OTHERS', label: 'Others' },
];

// 2. Define the new shape of a single attachment item
export interface AttachmentItem {
    file: File;
    type: string; // The selected value from the dropdown
}

interface Props {
    // Update props to use the new object structure
    attachments: AttachmentItem[];
    onFilesChange: (files: AttachmentItem[]) => void;
    error?: string;
    disabled?: boolean;
}

export const Attachments = ({ attachments, onFilesChange, error, disabled }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const processFiles = (files: FileList | null) => {
        if (files && files.length > 0) {
            const validFiles = Array.from(files).filter((file) => file.type === 'application/pdf');

            if (validFiles.length !== files.length) {
                alert('Only PDF files are allowed.');
            }

            // 3. Wrap the raw File in our new Object structure
            const newAttachments: AttachmentItem[] = validFiles.map((file) => ({
                file: file,
                type: '', // Default to empty (forces user to select) or 'OTHERS'
            }));

            onFilesChange([...attachments, ...newAttachments]);
        }
    };

    // 4. Handle Dropdown Changes
    const updateFileType = (index: number, newType: string) => {
        const updated = [...attachments];
        updated[index].type = newType;
        onFilesChange(updated);
    };

    // Standard Drag & Drop handlers...
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (!disabled) processFiles(e.dataTransfer.files);
    };

    const removeFile = (indexToRemove: number) => {
        const updated = attachments.filter((_, index) => index !== indexToRemove);
        onFilesChange(updated);
    };

    return (
        <div className="space-y-4">
            <Label>Procurement Documents (PDF only, Max 25MB)</Label>

            {/* Drop Zone */}
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                    error ? 'border-red-500 bg-red-50' : isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className={`rounded-full p-3 ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <UploadCloud className={`h-6 w-6 ${isDragging ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            <span className="cursor-pointer text-blue-600 hover:underline" onClick={() => !disabled && inputRef.current?.click()}>
                                Click to upload
                            </span>{' '}
                            or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF up to 25MB per file</p>
                    </div>
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => processFiles(e.target.files)}
                    disabled={disabled}
                />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* The File List with Dropdowns */}
            {attachments.length > 0 && (
                <ul className="space-y-3">
                    {attachments.map((item, index) => (
                        <li
                            key={`${item.file.name}-${index}`}
                            className="flex flex-col gap-3 rounded-md border bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between"
                        >
                            {/* File Info */}
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="rounded bg-blue-50 p-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="truncate">
                                    <p className="max-w-[200px] truncate text-sm font-medium">{item.file.name}</p>
                                    <p className="text-xs text-gray-500">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>

                            {/* Actions: Dropdown & Delete */}
                            <div className="flex items-center gap-2">
                                {/* 5. The Document Type Dropdown */}
                                <select
                                    className="h-8 rounded-md border border-gray-300 bg-transparent px-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
                                    value={item.type}
                                    onChange={(e) => updateFileType(index, e.target.value)}
                                    disabled={disabled}
                                >
                                    <option value="" disabled>
                                        Select Type...
                                    </option>
                                    {DOCUMENT_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                    disabled={disabled}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
