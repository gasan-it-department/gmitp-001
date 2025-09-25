import { SidebarInset } from '@/components/ui/sidebar';
import type { ComponentProps, PropsWithChildren } from 'react';

type AdminContentProps = ComponentProps<'main'>;

export function AppContent({ children, ...props }: PropsWithChildren<AdminContentProps>) {
    return <SidebarInset {...props}>{children}</SidebarInset>;
}
