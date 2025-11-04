import { Link, usePage, router } from '@inertiajs/react';
import * as React from 'react';
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
import { CalendarDays, ClipboardList, FileText, LayoutDashboard, List, Megaphone, Settings, Users, Map, LogOut } from 'lucide-react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth, url } = usePage<SharedData>().props;
    const userRole = auth.roles;

    const AdminSidebarItems = [
        {
            title: 'Action Center',
            icon: ClipboardList,
            items: [
                { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
                { title: 'Requests', url: '/action-center/admin/request-list', icon: FileText },
            ],
        },
        {
            title: 'Tourism',
            icon: Map,
            items: [{ title: 'Routing', url: '/admin/travels/routing', icon: Map }],
        },
        {
            title: 'Bulletin',
            icon: Megaphone,
            items: [
                { title: 'Announcement', url: '/bulletin-board/announcement/admin', icon: Megaphone },
                { title: 'Events', url: '/bulletin-board/events/admin', icon: CalendarDays },
            ],
        },
    ];

    const SuperAdminSidebarItems = [
        {
            title: 'Users',
            icon: Users,
            items: [
                { title: 'Dashboard', url: '/super-admin/dashboard', icon: LayoutDashboard },
                { title: 'Requests', url: '/action-center/admin/request-list', icon: FileText },
            ],
        },
        {
            title: 'Municipalities',
            icon: List,
            items: [{ title: 'List', url: '/super-admin/municipality', icon: Map }],
        },
        {
            title: 'Reports',
            icon: FileText,
            items: [
                { title: 'Announcement', url: '/bulletin-board/announcement/admin', icon: Megaphone },
                { title: 'Events', url: '/bulletin-board/events/admin', icon: CalendarDays },
            ],
        },
        {
            title: 'Logs',
            icon: FileText,
            items: [{ title: 'Audit Logs', url: '/admin/logs', icon: FileText }],
        },
        {
            title: 'Settings',
            icon: Settings,
            items: [{ title: 'System Settings', url: '/admin/settings', icon: Settings }],
        },
    ];

    const filteredNav = userRole?.isAdmin ? AdminSidebarItems : SuperAdminSidebarItems;
    const handleLogout = () => router.post('/logout');

    return (
        <Sidebar
            {...props}
            className="border-r border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-sm"
        >
            {/* HEADER */}
            <SidebarHeader className="border-b border-gray-100 pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="w-full rounded-xl pt-8 pb-8 hover:bg-orange-50 transition-colors"
                        >
                            <a href="#" className="flex items-center gap-3">
                                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md">
                                    <span className="text-lg font-semibold">
                                        {auth.user?.first_name?.[0]}
                                        {auth.user?.last_name?.[0]}
                                    </span>
                                </div>
                                <div className="flex flex-col leading-none">
                                    <span className="font-medium text-gray-900">
                                        {auth.user?.first_name} {auth.user?.last_name}
                                    </span>
                                    <span className="mt-1 mb-1 text-xs text-gray-500">
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
                        {filteredNav.map((group) => (
                            <SidebarMenuItem key={group.title}>
                                {/* SECTION TITLE */}
                                <div className="flex items-center gap-2 px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <group.icon size={14} className="text-orange-500" />
                                    {group.title}
                                </div>

                                {/* SUBMENU ITEMS with improved hover effect */}
                                <SidebarMenuSub className="space-y-1 pl-4 border-l border-gray-100">
                                    {group.items.map((sub) => {
                                        const SubIcon = sub.icon;
                                        const isActive = url === sub.url;

                                        return (
                                            <SidebarMenuSubItem key={sub.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    className={`group flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-out
                                                        ${isActive
                                                            ? 'bg-orange-100 text-orange-700 shadow-sm border-l-4 border-orange-500'
                                                            : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-white hover:text-orange-700 hover:shadow-sm hover:translate-x-[2px]'
                                                        }`}
                                                >
                                                    <Link href={sub.url} className="flex items-center gap-2 w-full">
                                                        <SubIcon
                                                            size={14}
                                                            className={`transition-all duration-200 ease-out 
                                                                ${isActive
                                                                    ? 'stroke-orange-600 text-orange-600 scale-110'
                                                                    : 'stroke-orange-500 text-orange-500 group-hover:scale-110 group-hover:stroke-orange-600'
                                                                }`}
                                                        />
                                                        <span>{sub.title}</span>
                                                    </Link>
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
            <div className="mt-auto border-t border-gray-100 py-3">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 hover:text-white transition-all"
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </Sidebar>
    );
}
