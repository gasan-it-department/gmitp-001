import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { SidebarProvider } from './ui/sidebar';

interface LayoutShellProps {
    children: React.ReactNode;
    variant: 'header' | 'sidebar';
    //later add the admin, super admin, and public for reusable
}

export default function LayoutShell({ children, variant = 'header' }: LayoutShellProps) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;

    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{children}</div>;
    }
    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
