import { MunicipalityProvider } from '@/Core/Context/MunicipalityContext';
import { AdminSidebar } from '@/layouts/App/Components/AdminSideBar';
import { AppContent } from '@/layouts/App/Components/AppContent';
import { AppHeader } from '@/layouts/App/Components/AppHeader';
import { AppShell } from '@/layouts/App/Components/AppShell';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { SuperAdminAppSidebar } from './Components/SuperAdminAppSidebar';

export default function BaseLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedData>().props;

    const isAdmin = auth.roles?.isAdmin;
    console.log(isAdmin);
    return (
        <AppShell>
            {isAdmin ? (
                <MunicipalityProvider>
                    <AdminSidebar />
                    <AppContent>
                        <AppHeader />
                        {children}
                    </AppContent>
                </MunicipalityProvider>
            ) : (
                <>
                    <SuperAdminAppSidebar />
                    <AppContent>
                        <AppHeader />
                        {children}
                    </AppContent>
                </>
            )}
        </AppShell>
    );
}
