import { usePage } from '@inertiajs/react';
import { createContext, ReactNode, useContext } from 'react';

// 1. Define the Settings structure
type MunicipalitySettings = {
    id: string;
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

// 3. UPDATE: Add settingsId to the Context Type
type MunicipalityContextType = {
    currentMunicipality: Municipality;
    logoUrl: string | null;
    settingsId: string | undefined; // <--- ADD THIS
};

const MunicipalityContext = createContext<MunicipalityContextType | undefined>(undefined);

export const MunicipalityProvider = ({ children }: { children: ReactNode }) => {
    // Fetch data from Inertia shared props
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    // 4. Derive values safely
    const logoUrl = currentMunicipality?.settings?.logoUrl ?? null;
    const settingsId = currentMunicipality?.settings?.id;

    // Debugging log
    return (
        <MunicipalityContext.Provider
            value={{
                currentMunicipality,
                logoUrl,
                settingsId,
            }}
        >
            {children}
        </MunicipalityContext.Provider>
    );
};

export const useMunicipality = () => {
    const context = useContext(MunicipalityContext);
    if (!context) throw new Error('useMunicipality must be used within a MunicipalityProvider');
    return context;
};
