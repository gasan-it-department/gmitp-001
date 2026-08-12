import { Content } from '@/components/Content';
import { LayoutHeader } from '@/components/LayoutHeader';
import LayoutShell from '@/components/LayoutShell';
import Footer from '@/components/Public/Footer';
import PublicSeo, { StructuredData } from '@/components/Seo/PublicSeo';
import { MunicipalityProvider } from '@/Core/Context/MunicipalityContext';
import { ReactNode } from 'react';

interface PublicLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
    canonicalUrl?: string;
    imageUrl?: string;
    type?: 'website' | 'article';
    noIndex?: boolean;
    structuredData?: StructuredData | StructuredData[];
}

export default function PublicLayout({
    children,
    title = 'Citizen Portal',
    description,
    canonicalUrl,
    imageUrl,
    type,
    noIndex,
    structuredData,
}: PublicLayoutProps) {
    return (
        <MunicipalityProvider>
            <PublicSeo
                title={title}
                description={description}
                canonicalUrl={canonicalUrl}
                imageUrl={imageUrl}
                type={type}
                noIndex={noIndex}
                structuredData={structuredData}
            />

            <LayoutShell variant="header">
                <LayoutHeader />

                <Content>{children}</Content>

                <Footer />
            </LayoutShell>
        </MunicipalityProvider>
    );
}
