// Components/FlashMessage.tsx (Create this once, use everywhere)
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner'; // Assuming you use a toast library like Sonner or React-Hot-Toast

export const FlashHandler = () => {
    // 1. Get the flash data shared from Laravel
    const { flash } = usePage<any>().props;

    useEffect(() => {
        if (flash.success) {
            // 2. Display it
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]); // Run whenever flash changes

    return null; // This component is invisible logic
};
