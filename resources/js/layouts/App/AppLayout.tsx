import { AdminSidebar } from '@/components/Admin/AdminSidebar';
import { SuperAdminSidebar } from '@/components/SuperAdmin/SuperAdminSidebar';
import { AppContent } from '@/layouts/App/Components/AppContent';
import { AppHeader } from '@/layouts/App/Components/AppHeader';
import { AppShell } from '@/layouts/App/Components/AppShell';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function BaseLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedData>().props;

    const sidebar = auth.roles.isAdmin ? <AdminSidebar /> : <SuperAdminSidebar />;
    return (
        <AppShell>
            {sidebar}
            <AppContent>
                <AppHeader />
                {children}
            </AppContent>
        </AppShell>
    );
}
