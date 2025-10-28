import { adminNavMain } from '@/features/navigation/admin/navigationItems';
import { Link, usePage } from '@inertiajs/react';
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
    SidebarRail,
} from '@/components/ui/sidebar';
import { SharedData } from '@/types';

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user?.role;

    console.log('Auth User in AdminSidebar:', auth.user);
    console.log('Admin type:', userRole);
    
    const filteredNav =
        userRole === 1
            ? adminNavMain.filter((item) => item.title === 'Action Center')
            : adminNavMain;

    return (
        <Sidebar
            {...props}
            className="bg-gradient-to-b from-white to-gray-50 border-r border-gray-200"
        >
            {/* HEADER */}
            <SidebarHeader className="border-b border-gray-100 pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="hover:bg-gray-100 rounded-xl transition-colors pt-8 pb-8 w-full"
                        >
                            <a href="#" className="flex items-center gap-3">
                                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                                    <span className="font-semibold text-lg">
                                        {auth.user?.first_name?.[0]}
                                        {auth.user?.last_name?.[0]}
                                    </span>
                                </div>
                                <div className="flex flex-col leading-none">
                                    <span className="font-medium text-gray-900">
                                        {auth.user?.first_name} {auth.user?.last_name}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1 mb-1">
                                        {userRole === 1 ? 'Action Center' : 'Administrator'}
                                    </span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* NAVIGATION CONTENT */}
            <SidebarContent className="py-4">
                <SidebarGroup>
                    <SidebarMenu className="space-y-1">
                        {filteredNav.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton className="w-full flex items-center justify-between text-gray-700 font-medium hover:bg-gray-100 hover:text-gray-900 rounded-lg px-3 py-2 transition-all">
                                    <span>{item.title}</span>
                                </SidebarMenuButton>

                                {item.items?.length ? (
                                    <SidebarMenuSub className="pl-4 mt-1 space-y-1 border-l border-gray-100">
                                        {item.items.map((sub) => (
                                            <SidebarMenuSubItem key={sub.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md px-3 py-1.5 transition-all"
                                                >
                                                    <Link href={sub.url}>{sub.title}</Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                ) : null}
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            {/* FOOTER RAIL */}
            <SidebarRail className="border-t border-gray-100 mt-auto" />
        </Sidebar>
    );
}

