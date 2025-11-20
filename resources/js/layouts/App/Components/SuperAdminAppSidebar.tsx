import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import {
    Building,
    FileText,
    LogOut,
    Map,
    Settings,
    User,
    Users,
} from 'lucide-react';
import * as React from 'react';

// -------------------------
// TYPES
// -------------------------
type SidebarSubItem = {
    title: string;
    url: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
};

type SidebarGroupType = {
    title: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    items: SidebarSubItem[];
};

// -------------------------
// COMPONENT
// -------------------------
export function SuperAdminAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth, url } = usePage<SharedData>().props;
    const userRole = auth.roles;
    const [classicDialog, setClassicDialog] = React.useState({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: 'Ok',
        negativeButtonText: 'Cancel',
        isNegativeButtonHidden: true,
        action: '',
    });

    const cachedUrl =
        typeof window !== 'undefined'
            ? localStorage.getItem('activeSidebarUrl') || String(url)
            : String(url);

    const SuperAdminSidebarItems: SidebarGroupType[] = [
        {
            title: 'USERS',
            icon: Users,
            items: [{ title: 'Administrators', url: '/super-admin/dashboard', icon: User }],
        },
        {
            title: 'LOCAL GOVERNMENTS',
            icon: Building,
            items: [{ title: 'Municipalities', url: '/municipality/super-admin', icon: Map }],
        },
        {
            title: 'LOGS',
            icon: FileText,
            items: [{ title: 'Audit Logs', url: '/admin/logs', icon: FileText }],
        },
        {
            title: 'SETTINGS',
            icon: Settings,
            items: [{ title: 'System Settings', url: '/admin/settings', icon: Settings }],
        },
    ];

    // -------------------------
    // HELPERS
    // -------------------------
    const isRouteActive = (pattern: string) => {
        if (!pattern) return false;
        return (
            cachedUrl === pattern ||
            cachedUrl.startsWith(pattern + '/') ||
            cachedUrl.startsWith(pattern + '?') ||
            cachedUrl.includes(pattern)
        );
    };

    const handleLinkClick = (linkUrl: string) => {
        localStorage.setItem('activeSidebarUrl', linkUrl);
        router.visit(linkUrl);
    };

    const handleExitAdminClick = () => {
        setClassicDialog({
            ...classicDialog,
            isOpen: true,
            title: 'Exit admin panel',
            message: 'Are you sure you want to exit the admin panel?',
            positiveButtonText: 'Exit',
            negativeButtonText: 'Cancel',
            isNegativeButtonHidden: false,
            action: 'exit',
        });
    };

    // -------------------------
    // RENDER
    // -------------------------
    return (
        <Sidebar {...props} className="border-r border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-sm">

            {/* HEADER */}
            <SidebarHeader className="border-b border-gray-100 pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="w-full rounded-xl pt-8 pb-8 hover:bg-orange-50">
                            <a href="#" className="flex items-center gap-3">
                                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md">
                                    <span className="text-lg font-semibold">
                                        {auth.user?.first_name?.[0]}
                                        {auth.user?.last_name?.[0]}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">
                                        {auth.user?.first_name} {auth.user?.last_name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {userRole?.isAdmin
                                            ? 'Administrator'
                                            : userRole?.isSuperAdmin
                                                ? 'Super-Admin'
                                                : 'User'}
                                    </span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* NAVIGATION */}
            <SidebarContent className="py-4">
                <SidebarGroup>
                    <SidebarMenu className="space-y-5">
                        {SuperAdminSidebarItems.map((group) => (
                            <SidebarMenuItem key={group.title}>
                                {/* SECTION TITLE */}
                                <div className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold text-gray-500 uppercase">
                                    <group.icon size={14} className="text-orange-500" />
                                    {group.title}
                                </div>

                                <SidebarMenuSub className="space-y-1 border-l border-gray-100 pl-4">
                                    {group.items.map((sub) => {
                                        const SubIcon = sub.icon;
                                        const active = isRouteActive(sub.url);

                                        return (
                                            <SidebarMenuSubItem key={sub.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    className={`group flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium
                                                    ${active
                                                            ? 'border-l-4 border-orange-500 bg-orange-100 text-orange-700 shadow-sm'
                                                            : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                                                        }`}
                                                >
                                                    <a onClick={() => handleLinkClick(sub.url)} className="flex w-full items-center gap-2 cursor-pointer">
                                                        <SubIcon
                                                            size={14}
                                                            className={`${active ? 'stroke-orange-600 text-orange-600' : 'stroke-orange-500 text-orange-500'}`}
                                                        />
                                                        <span>{sub.title}</span>
                                                    </a>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        );
                                    })}
                                </SidebarMenuSub>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            {/* FOOTER */}
            <div className="mt-auto border-t border-gray-100 px-3 py-3">
                <Button
                    onClick={handleExitAdminClick}
                    className="w-full flex items-center gap-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white"
                >
                    <LogOut size={18} />
                    <span>Exit Admin</span>
                </Button>
            </div>
        </Sidebar>
    );
}
