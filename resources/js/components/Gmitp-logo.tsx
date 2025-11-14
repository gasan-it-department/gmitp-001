import { landing } from '@/routes';
import { Link, usePage } from '@inertiajs/react';

type Municipality = {
    id: string;
    name: string;
    slug: string;
    zip_code: string;
};

const GmitpLogo = () => {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    return (
        <div className="flex flex-row items-center">
            <img src="/assets/logo_gasan.png" alt="GMITP Logo" className="h-10 w-auto" />
            <div className="w-2.5" />
            <span className="text-md mb-0.5 truncate leading-tight font-extrabold text-gray-600 md:text-xl xl:text-xl">
                <Link href={landing()}>{currentMunicipality.name}</Link>
            </span>
        </div>
    );
};

export default GmitpLogo;
