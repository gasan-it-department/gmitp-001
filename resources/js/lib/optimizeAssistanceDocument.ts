import imageCompression from 'browser-image-compression';

const ONE_MEGABYTE = 1024 * 1024;
const COMPRESSIBLE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface OptimizedAssistanceDocument {
    file: File;
    originalSize: number;
    wasCompressed: boolean;
}

export async function optimizeAssistanceDocument(file: File): Promise<OptimizedAssistanceDocument> {
    if (!COMPRESSIBLE_IMAGE_TYPES.has(file.type) || file.size <= ONE_MEGABYTE) {
        return {
            file,
            originalSize: file.size,
            wasCompressed: false,
        };
    }

    const compressed = await imageCompression(file, {
        maxSizeMB: 1.25,
        maxWidthOrHeight: 2400,
        initialQuality: 0.85,
        useWebWorker: true,
        fileType: 'image/jpeg',
        preserveExif: false,
    });

    if (compressed.size >= file.size) {
        return {
            file,
            originalSize: file.size,
            wasCompressed: false,
        };
    }

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'assistance-document';
    const optimizedFile = new File([compressed], `${baseName}.jpg`, {
        type: 'image/jpeg',
        lastModified: file.lastModified,
    });

    return {
        file: optimizedFile,
        originalSize: file.size,
        wasCompressed: true,
    };
}

export function formatUploadSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < ONE_MEGABYTE) return `${(bytes / 1024).toFixed(0)} KB`;

    return `${(bytes / ONE_MEGABYTE).toFixed(1)} MB`;
}
