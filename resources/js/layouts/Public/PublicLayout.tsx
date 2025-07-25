import { Content } from '@/components/Content';
import { LayoutHeader } from '@/components/LayoutHeader';
import LayoutShell from '@/components/LayoutShell';

interface PublicLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
}

export default function PublicLayoutTemplate({ children, title, description }: PublicLayoutProps) {
    return (
        <LayoutShell variant="header">
            <LayoutHeader />
            <Content>{children}</Content>
        </LayoutShell>
    );
}
