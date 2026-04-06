import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, FileText, Trash2, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';

interface SelectOption {
    value: string;
    label: string;
    color?: string;
}

export interface AttachmentItem {
    file: File;
    type: string;
}

interface Props {
    attachments: AttachmentItem[];
    onFilesChange: (files: AttachmentItem[]) => void;
    error?: string;
    disabled?: boolean;
    documentTypes: SelectOption[];
}

export const Attachments = ({ attachments, onFilesChange, error, disabled, documentTypes }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const processFiles = (files: FileList | null) => {
        if (files && files.length > 0) {
            const validFiles = Array.from(files).filter((file) => file.type === 'application/pdf');

            if (validFiles.length !== files.length) {
                alert('Only PDF files are allowed. Other file types were ignored.');
            }

            const newAttachments: AttachmentItem[] = validFiles.map((file) => ({
                file: file,
                type: '', // Forces user to select a type
            }));

            onFilesChange([...attachments, ...newAttachments]);
        }
    };

    const updateFileType = (index: number, newType: string) => {
        const updated = [...attachments];
        updated[index].type = newType;
        onFilesChange(updated);
    };

    // Drag & Drop handlers
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
            <Label className="text-sm font-semibold text-slate-800">
                Procurement Documents <span className="font-normal text-slate-500">(PDF only, Max 25MB)</span>
            </Label>

            {/* Drop Zone */}
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
                    error
                        ? 'border-red-400 bg-red-50'
                        : isDragging
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-50'
                } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                onClick={() => !disabled && inputRef.current?.click()}
            >
                <div className="pointer-events-none flex flex-col items-center justify-center gap-3">
                    <div className={`rounded-full p-4 transition-colors ${isDragging ? 'bg-blue-100' : 'bg-white shadow-sm'}`}>
                        <UploadCloud className={`h-8 w-8 ${isDragging ? 'text-blue-600' : 'text-slate-400'}`} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-700">
                            <span className="font-semibold text-blue-600 hover:text-blue-700">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-500">Attach NOAs, Contracts, or Bidding Documents</p>
                    </div>
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => processFiles(e.target.files)}
                    disabled={disabled}
                />
            </div>

            {error && <p className="text-sm font-medium text-red-500">{error}</p>}

            {/* The File List */}
            {attachments.length > 0 && (
                <ul className="mt-4 space-y-3">
                    {attachments.map((item, index) => {
                        const isMissingType = !item.type;

                        return (
                            <li
                                key={`${item.file.name}-${index}`}
                                className={`flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm transition-all md:flex-row md:items-center md:justify-between ${
                                    isMissingType ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'
                                }`}
                            >
                                {/* File Info (Left Side) */}
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`shrink-0 rounded-lg p-2.5 ${isMissingType ? 'bg-amber-100/50' : 'bg-blue-50'}`}>
                                        <FileText className={`h-5 w-5 ${isMissingType ? 'text-amber-600' : 'text-blue-600'}`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-700" title={item.file.name}>
                                            {item.file.name}
                                        </p>
                                        <p className="text-xs text-slate-500">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>

                                {/* Actions (Right Side) */}
                                <div className="flex shrink-0 items-center gap-3">
                                    {/* Missing Type Warning Icon */}
                                    {isMissingType && (
                                        <div className="flex items-center text-amber-600" title="Please select a document type">
                                            <AlertCircle className="h-4 w-4" />
                                        </div>
                                    )}

                                    {/* Connected Dropdown */}
                                    <Select value={item.type || ''} onValueChange={(val) => updateFileType(index, val)} disabled={disabled}>
                                        <SelectTrigger
                                            className={`h-9 w-[220px] text-xs font-medium ${isMissingType ? 'border-amber-400 focus:ring-amber-500' : ''}`}
                                        >
                                            <SelectValue placeholder="Select Document Type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {documentTypes.map((docType) => (
                                                <SelectItem key={docType.value} value={docType.value} className="text-xs">
                                                    {docType.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Delete Button */}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeFile(index)}
                                        className="h-9 w-9 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                        disabled={disabled}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};
