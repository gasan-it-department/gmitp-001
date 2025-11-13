import { MunicipalityProvider } from '@/Core/Context/MunicipalityContext';
import { AppContent } from '@/layouts/App/Components/AppContent';
import { AppHeader } from '@/layouts/App/Components/AppHeader';
import { AppShell } from '@/layouts/App/Components/AppShell';
import { AppSidebar } from '@/layouts/App/Components/AppSidebar';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function BaseLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedData>().props;

    const isAdmin = auth.roles?.isAdmin;

    return (
        <AppShell>
            {isAdmin ? (
                <MunicipalityProvider>
                    <AppSidebar />
                    <AppContent>
                        <AppHeader />
                        {children}
                    </AppContent>
                </MunicipalityProvider>
            ) : (
                children
            )}
        </AppShell>
    );
}
