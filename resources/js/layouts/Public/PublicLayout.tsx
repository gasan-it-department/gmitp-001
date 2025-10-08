import { Content } from '@/components/Content';
import { LayoutHeader } from '@/components/LayoutHeader';
import LayoutShell from '@/components/LayoutShell';
import Footer from '@/pages/Public/Home/Components/Footer';

interface PublicLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
}

export default function PublicLayoutTemplate({ children }: PublicLayoutProps) {
    return (
        <LayoutShell variant="header">
            <LayoutHeader />
            <Content>{children}</Content>
            <Footer/>
        </LayoutShell>
    );
}
