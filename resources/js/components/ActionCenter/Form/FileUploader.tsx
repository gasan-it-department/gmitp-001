import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, Trash2, UploadCloud } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface FileUploaderProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    maxFiles?: number;
    maxSizeMB?: number;
    accept?: string;
    label?: string;
    description?: string;
    error?: string;
}

export function FileUploader({
    files = [],
    onFilesChange,
    maxFiles = 5,
    maxSizeMB = 10,
    accept = 'image/*,application/pdf',
    label = 'Upload Documents',
    description = 'Attach photos or PDF files (Max 10MB each)',
    error,
}: FileUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(Array.from(e.target.files));
        }
        // Reset input so the same file can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const processFiles = (newFiles: File[]) => {
        setLocalError(null);

        // 1. Check Total Count
        if (files.length + newFiles.length > maxFiles) {
            setLocalError(`You can only upload a maximum of ${maxFiles} files.`);
            return;
        }

        const validFiles: File[] = [];

        // 2. Check File Sizes
        for (const file of newFiles) {
            if (file.size > maxSizeMB * 1024 * 1024) {
                setLocalError(`File "${file.name}" is too large. Max size is ${maxSizeMB}MB.`);
                return;
            }
            validFiles.push(file);
        }

        onFilesChange([...files, ...validFiles]);
    };

    const removeFile = (indexToRemove: number) => {
        onFilesChange(files.filter((_, index) => index !== indexToRemove));
        setLocalError(null);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Drag and Drop handlers for desktop users, but we emphasize the click
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(Array.from(e.dataTransfer.files));
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold tracking-wide text-gray-900 uppercase">{label}</h4>
                <p className="text-xs text-gray-500">{description}</p>
            </div>

            {/* Large Clickable Area */}
            <div
                className={cn(
                    'relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50 p-8 transition-all hover:bg-slate-100',
                    dragActive ? 'border-orange-500 bg-orange-50' : 'border-slate-300',
                    error || localError ? 'border-red-300 bg-red-50' : '',
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input ref={fileInputRef} type="file" className="hidden" multiple accept={accept} onChange={handleFileSelect} />

                <div className="mb-3 rounded-full bg-white p-4 shadow-sm">
                    <UploadCloud className={cn('h-8 w-8', dragActive ? 'text-orange-500' : 'text-slate-400')} />
                </div>

                <p className="text-center text-sm font-semibold text-slate-700">
                    <span className="text-orange-600 underline">Click here</span> to select files
                </p>
                <p className="mt-1 text-xs text-slate-400">or drag and drop them here</p>
            </div>

            {/* Error Message */}
            {(error || localError) && (
                <div className="flex animate-pulse items-center gap-2 rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                    <p>{localError || error}</p>
                </div>
            )}

            {/* File List - Designed for Readability */}
            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    <p className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
                        Attached Files ({files.length}/{maxFiles})
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                        {files.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-orange-200"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                        <FileText className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="max-w-[200px] truncate text-sm font-medium text-slate-700 sm:max-w-[300px]">{file.name}</p>
                                        <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:bg-red-50 hover:text-red-500"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
