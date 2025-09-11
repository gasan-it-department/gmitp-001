import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

const GmitpLogo = () => {
    const { app_name } = usePage<SharedData>().props;

    const formattedName = app_name.replace(/_/g, ' ');

    return (
        <div className="ml-1 grid text-left text-sm">
            <span className="text-md mb-0.5 truncate leading-tight font-extrabold text-gray-600 md:text-xl xl:text-xl">{formattedName}</span>
        </div>
    );
};

export default GmitpLogo;
