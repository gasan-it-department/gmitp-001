import { Availability } from '@/Core/Types/Facility/FacilityTypes';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';

export default function useFacilityRefresh(prop: 'facility' | 'facilities', availability?: Availability) {
    const computed = availability?.computed_at;
    const next = availability?.next_refresh_at;
    useEffect(() => {
        let disposed = false;
        let loading = false;
        let timer: ReturnType<typeof setTimeout>;
        // Use the server's interval, not the visitor's clock or timezone.
        const delay = computed && next ? Math.max(1000, Math.min(60000, Date.parse(next) - Date.parse(computed))) : 60000;
        const schedule = () => {
            if (!disposed) timer = setTimeout(refresh, delay);
        };
        const refresh = () => {
            clearTimeout(timer);
            if (disposed || loading) return;
            if (document.visibilityState !== 'visible') {
                schedule();
                return;
            }
            loading = true;
            router.reload({
                only: [prop],
                onFinish: () => {
                    loading = false;
                    schedule();
                },
            });
        };
        const focus = () => {
            if (document.visibilityState === 'visible') refresh();
        };
        schedule();
        window.addEventListener('focus', focus);
        document.addEventListener('visibilitychange', focus);
        return () => {
            disposed = true;
            clearTimeout(timer);
            window.removeEventListener('focus', focus);
            document.removeEventListener('visibilitychange', focus);
        };
    }, [prop, computed, next]);
}
