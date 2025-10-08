import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

const GmitpLogo = () => {
    const { app_name } = usePage<SharedData>().props;
    const formattedName = app_name.replace(/_/g, ' ').replace(/-/g, ' ');

    return (
        <div className="flex flex-row items-center">
            <img src="assets/logo_gasan.png" alt="GMITP Logo" className="h-10 w-auto" />
            <div className='w-2.5'/>
            <span className="text-md mb-0.5 truncate leading-tight font-extrabold text-gray-600 md:text-xl xl:text-xl">{formattedName}</span>
        </div>
    );
};

export default GmitpLogo;
