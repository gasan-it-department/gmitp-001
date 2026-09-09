import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useRef, useState } from 'react';

interface ErrorResponse {
    message?: string;
    errors?: Record<string, string | string[]>;
}

/** JSON mutations must refresh the resource before another fingerprint-bound action. */
export function useAssistanceRequestAction() {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const busy = useRef(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const submit = async (route: { url: string; method: string }, data: object = {}): Promise<boolean> => {
        if (busy.current) return false;
        busy.current = true;
        setProcessing(true);
        setErrors({});
        try {
            await axios({ ...route, data, headers: { 'X-Municipality-Slug': currentMunicipality.slug, Accept: 'application/json' } });
            await new Promise<void>((resolve) => router.reload({ onFinish: () => resolve() }));
            return true;
        } catch (error) {
            const response = axios.isAxiosError<ErrorResponse>(error) ? error.response?.data : undefined;
            const fieldErrors = Object.fromEntries(
                Object.entries(response?.errors ?? {}).map(([field, messages]) => [field, Array.isArray(messages) ? messages.join(' ') : messages]),
            );
            setErrors(Object.keys(fieldErrors).length ? fieldErrors : { request: response?.message ?? 'Unable to save. Please try again.' });
            return false;
        } finally {
            busy.current = false;
            setProcessing(false);
        }
    };

    return { submit, processing, errors, clearErrors: () => setErrors({}) };
}
