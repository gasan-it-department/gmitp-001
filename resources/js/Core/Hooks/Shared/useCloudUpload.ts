import axios from '@/lib/axios';
import { useState } from 'react';

interface UploadConfig {
    generateUrlEndpoint: string;
    saveMetadataEndpoint: string;
}

export function useCloudUpload() {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const executeUpload = async (file: File, config: UploadConfig, additionalMetadata: any = {}) => {
        setIsUploading(true);
        setStatus('idle');
        setProgress(0);

        try {
            const extension = file.name.split('.').pop();

            // 1. Get the Ticket
            const { data: ticket } = await axios.post(config.generateUrlEndpoint, {
                extension,
                content_type: file.type,
            });

            // 2. Upload to Cloud
            await axios.put(ticket.upload_url, file, {
                headers: { 'Content-Type': file.type },
                onUploadProgress: (p) => {
                    setProgress(Math.round((p.loaded * 100) / (p.total ?? 1)));
                },
            });

            // 3. Save Metadata
            await axios.post(config.saveMetadataEndpoint, {
                file_path: ticket.storage_path,
                original_name: file.name,
                file_size: file.size,
                mime_type: file.type,
                extension: extension,
                ...additionalMetadata, // Spreads in module-specific stuff (like document_type)
            });

            setStatus('success');
        } catch (error) {
            console.error(error);
            setStatus('error');
            throw error; // Let the component know it failed
        } finally {
            setIsUploading(false);
        }
    };

    const reset = () => {
        setProgress(0);
        setStatus('idle');
    };

    return { executeUpload, isUploading, progress, status, reset };
}