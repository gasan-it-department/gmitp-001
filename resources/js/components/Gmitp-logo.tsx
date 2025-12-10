import { useMunicipality } from '@/Core/Context/MunicipalityContext'; // Import your hook
import { landing } from '@/routes';
import { Link } from '@inertiajs/react';
const GmitpLogo = () => {
    // 1. Use the hook instead of manual usePage
    // This gives you the name and the computed logoUrl automatically
    const { currentMunicipality, logoUrl } = useMunicipality();

    return (
        <Link href={landing()} className="z-[1000] flex cursor-pointer flex-row items-center">
            {/* 2. Image is now part of the link */}
            {logoUrl && <img src={logoUrl} alt={`${currentMunicipality.name} Logo`} className="h-10 w-auto rounded-full object-contain" />}

            <div className="w-2.5" />

            {/* 3. The name text */}
            <span className="text-md mb-0.5 truncate leading-tight font-extrabold text-gray-600 md:text-xl xl:text-xl">
                {currentMunicipality.name}
            </span>
        </Link>
    );
};

export default GmitpLogo;
