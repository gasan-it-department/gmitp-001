import { usePage } from '@inertiajs/react';
import { createContext, ReactNode, useContext } from 'react';

type Municipality = {
    id: string;
    name: string;
    slug: string;
    zip_code: string;
};

type MunicipalityContextType = {
    currentMunicipality: Municipality;
};

const MunicipalityContext = createContext<MunicipalityContextType | undefined>(undefined);

export const MunicipalityProvider = ({ children }: { children: ReactNode }) => {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    return <MunicipalityContext.Provider value={{ currentMunicipality }}>{children}</MunicipalityContext.Provider>;
};

export const useMunicipality = () => {
    const context = useContext(MunicipalityContext);
    if (!context) throw new Error('no municipality');
    return context;
};
