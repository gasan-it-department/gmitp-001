import { SidebarProvider } from '@/components/ui/sidebar';

interface AdminProps {
    children: React.ReactNode;
}
export function AppShell({ children }: AdminProps) {
    return <SidebarProvider>{children}</SidebarProvider>;
}
