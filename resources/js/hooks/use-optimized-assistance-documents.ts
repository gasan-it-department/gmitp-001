import { formatUploadSize, optimizeAssistanceDocument } from '@/lib/optimizeAssistanceDocument';
import { rotateImageFile, type ImageRotationDirection } from '@/lib/rotateImageFile';
import { useCallback, useRef, useState } from 'react';

export interface DocumentPreparationNotice {
    message: string;
    tone: 'success' | 'warning';
}

export function useOptimizedAssistanceDocuments(onFileReady: (documentKey: string, file: File | null) => void) {
    const [preparingKeys, setPreparingKeys] = useState<Set<string>>(() => new Set());
    const [notices, setNotices] = useState<Record<string, DocumentPreparationNotice | undefined>>({});
    const operationVersions = useRef<Record<string, number>>({});

    const prepareDocument = useCallback(
        async (documentKey: string, file: File | null) => {
            const version = (operationVersions.current[documentKey] ?? 0) + 1;
            operationVersions.current[documentKey] = version;
            setNotices((current) => ({ ...current, [documentKey]: undefined }));

            if (!file) {
                setPreparingKeys((current) => {
                    const next = new Set(current);
                    next.delete(documentKey);
                    return next;
                });
                onFileReady(documentKey, null);
                return;
            }

            setPreparingKeys((current) => new Set(current).add(documentKey));

            try {
                const optimized = await optimizeAssistanceDocument(file);

                if (operationVersions.current[documentKey] !== version) return;

                onFileReady(documentKey, optimized.file);

                if (optimized.wasCompressed) {
                    setNotices((current) => ({
                        ...current,
                        [documentKey]: {
                            tone: 'success',
                            message: `Optimized ${formatUploadSize(optimized.originalSize)} to ${formatUploadSize(optimized.file.size)} for upload.`,
                        },
                    }));
                }
            } catch {
                if (operationVersions.current[documentKey] !== version) return;

                onFileReady(documentKey, file);
                setNotices((current) => ({
                    ...current,
                    [documentKey]: {
                        tone: 'warning',
                        message: 'Could not optimize this image. The original file will be uploaded.',
                    },
                }));
            } finally {
                if (operationVersions.current[documentKey] === version) {
                    setPreparingKeys((current) => {
                        const next = new Set(current);
                        next.delete(documentKey);
                        return next;
                    });
                }
            }
        },
        [onFileReady],
    );

    const rotateDocument = useCallback(
        async (documentKey: string, file: File, direction: ImageRotationDirection) => {
            const version = (operationVersions.current[documentKey] ?? 0) + 1;
            operationVersions.current[documentKey] = version;
            setNotices((current) => ({ ...current, [documentKey]: undefined }));
            setPreparingKeys((current) => new Set(current).add(documentKey));

            try {
                const rotated = await rotateImageFile(file, direction);
                const optimized = await optimizeAssistanceDocument(rotated);

                if (operationVersions.current[documentKey] !== version) return;

                onFileReady(documentKey, optimized.file);
                setNotices((current) => ({
                    ...current,
                    [documentKey]: {
                        tone: 'success',
                        message: optimized.wasCompressed
                            ? `Rotated ${direction} and optimized to ${formatUploadSize(optimized.file.size)}.`
                            : `Rotated ${direction}. Review the preview before uploading.`,
                    },
                }));
            } catch {
                if (operationVersions.current[documentKey] !== version) return;

                setNotices((current) => ({
                    ...current,
                    [documentKey]: {
                        tone: 'warning',
                        message: 'Could not rotate this image. The current file was kept.',
                    },
                }));
            } finally {
                if (operationVersions.current[documentKey] === version) {
                    setPreparingKeys((current) => {
                        const next = new Set(current);
                        next.delete(documentKey);
                        return next;
                    });
                }
            }
        },
        [onFileReady],
    );

    return {
        isPreparing: preparingKeys.size > 0,
        notices,
        prepareDocument,
        preparingKeys,
        rotateDocument,
    };
}
