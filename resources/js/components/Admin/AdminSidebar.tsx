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

    const filteredNav = userRole === 1 ? adminNavMain.filter((item) => item.title === 'Action Center') : adminNavMain;

    return (
        <Sidebar {...props} className="border-r border-gray-200 bg-gradient-to-b from-white to-gray-50">
            {/* HEADER */}
            <SidebarHeader className="border-b border-gray-100 pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="w-full rounded-xl pt-8 pb-8 transition-colors hover:bg-gray-100">
                            <a href="#" className="flex items-center gap-3">
                                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                                    <span className="text-lg font-semibold">
                                        {auth.user?.first_name?.[0]}
                                        {auth.user?.last_name?.[0]}
                                    </span>
                                </div>
                                <div className="flex flex-col leading-none">
                                    <span className="font-medium text-gray-900">
                                        {auth.user?.first_name} {auth.user?.last_name}
                                    </span>
                                    <span className="mt-1 mb-1 text-xs text-gray-500">{userRole === 1 ? 'Action Center' : 'Administrator'}</span>
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
                                <SidebarMenuButton className="flex w-full items-center justify-between rounded-lg px-3 py-2 font-medium text-gray-700 transition-all hover:bg-gray-100 hover:text-gray-900">
                                    <span>{item.title}</span>
                                </SidebarMenuButton>

                                {item.items?.length ? (
                                    <SidebarMenuSub className="mt-1 space-y-1 border-l border-gray-100 pl-4">
                                        {item.items.map((sub) => (
                                            <SidebarMenuSubItem key={sub.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    className="rounded-md px-3 py-1.5 text-sm text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900"
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
            <SidebarRail className="mt-auto border-t border-gray-100" />
        </Sidebar>
    );
}
