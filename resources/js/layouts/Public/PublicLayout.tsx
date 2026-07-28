import { ReactNode } from 'react';
import { Head } from '@inertiajs/react';
import { Content } from '@/components/Content';
import { LayoutHeader } from '@/components/LayoutHeader';
import LayoutShell from '@/components/LayoutShell';
import { MunicipalityProvider } from '@/Core/Context/MunicipalityContext';

import Footer from '@/components/Public/Footer'; 

interface PublicLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
}

export default function PublicLayout({ 
    children, 
    title = 'Welcome', 
    description = 'Default description for the application.' 
}: PublicLayoutProps) {
    return (
        <MunicipalityProvider>
            {/* Add Inertia Head for SEO using your props */}
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
            </Head>

            <LayoutShell variant="header">
                <LayoutHeader />
                
                {/* Main content area */}
                <Content>
                    {children}
                </Content>
                
                <Footer />
            </LayoutShell>
        </MunicipalityProvider>
    );
}
