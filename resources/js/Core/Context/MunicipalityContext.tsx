import { usePage } from '@inertiajs/react';
import { createContext, ReactNode, useContext } from 'react';

// 1. Define the Settings structure coming from your Laravel Resource
type MunicipalitySettings = {
    logoUrl: string | null;
    homeTitle: string | null;
    primaryColor: string | null;
};

// 2. Add settings to the Municipality type
type Municipality = {
    id: string;
    name: string;
    slug: string;
    zip_code: string;
    settings: MunicipalitySettings | null;
};

// 3. Add logoUrl to the Context Type for easy access
type MunicipalityContextType = {
    currentMunicipality: Municipality;
    logoUrl: string | null;
};

const MunicipalityContext = createContext<MunicipalityContextType | undefined>(undefined);

export const MunicipalityProvider = ({ children }: { children: ReactNode }) => {
    // Fetch data from Inertia shared props
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    // 4. Derive the logoUrl safely
    const logoUrl = currentMunicipality?.settings?.logoUrl ?? null;

    return <MunicipalityContext.Provider value={{ currentMunicipality, logoUrl }}>{children}</MunicipalityContext.Provider>;
};

export const useMunicipality = () => {
    const context = useContext(MunicipalityContext);
    if (!context) throw new Error('useMunicipality must be used within a MunicipalityProvider');
    return context;
};
