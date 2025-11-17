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
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { home } from '@/routes';
import actionCenter from '@/routes/actionCenter';
import bulletinBoard from '@/routes/bulletin-board';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import {
    Building,
    CalendarDays,
    ClipboardList,
    FileText,
    LayoutDashboard,
    LogOut,
    Map,
    Megaphone,
    MessageCircleIcon,
    Settings,
    User,
    Users,
    UsersIcon,
} from 'lucide-react';
import * as React from 'react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth, url } = usePage<SharedData>().props;
    const userRole = auth.roles;
    const { currentMunicipality } = useMunicipality();
    const [classicDialog, setClassicDialog] = React.useState({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: 'Ok',
        negativeButtonText: 'Cancel',
        isNegativeButtonHidden: true,
        action: '',
    });
    const cachedUrl = typeof window !== 'undefined' ? localStorage.getItem('activeSidebarUrl') || String(url) : String(url);

    const isRouteActive = (pattern: string) => {
        if (!pattern) return false;
        return cachedUrl === pattern || cachedUrl.startsWith(pattern + '/') || cachedUrl.startsWith(pattern + '?') || cachedUrl.includes(pattern);
    };

    const handleLinkClick = (linkUrl: string) => {
        localStorage.setItem('activeSidebarUrl', linkUrl);
        router.visit(linkUrl);
    };

    const handleExitAdminClick = () => {
        setClassicDialog((prev) => ({
            ...prev,
            isOpen: true,
            title: 'Exit admin panel',
            message: 'Are you sure you want to exit the admin panel?',
            positiveButtonText: 'Exit',
            negativeButtonText: 'Cancel',
            isNegativeButtonHidden: false,
            action: 'exit',
        }));
    };

    console.log(currentMunicipality.slug);
    const AdminSidebarItems = [
        {
            title: 'ACTION CENTER',
            icon: ClipboardList,
            items: [
                { title: 'Dashboard', url: actionCenter.admin.index.url({ municipality: currentMunicipality.slug }), icon: LayoutDashboard },
                { title: 'Requests', url: '/action-center/admin/request-list', icon: FileText },
            ],
        },
        {
            title: 'PUBLIC INFORMATION',
            icon: FileText,
            items: [
                {
                    title: 'Announcement',
                    url: bulletinBoard.announcement.admin.index.url({ municipality: currentMunicipality.slug }),
                    icon: Megaphone,
                },
                { title: 'Events', url: bulletinBoard.events.admin.index.url({ municipality: currentMunicipality.slug }), icon: CalendarDays },
                { title: 'Feedbacks', url: '', icon: MessageCircleIcon },
                { title: 'Comunity Reports', url: '', icon: UsersIcon },
            ],
        },

        {
            title: 'TOURISM',
            icon: Map,
            items: [{ title: 'Routing', url: '#', icon: Map }],
        },
    ];

    const SuperAdminSidebarItems = [
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

    const filteredNav = userRole?.isAdmin ? AdminSidebarItems : SuperAdminSidebarItems;

    const handleLogout = () => {
        localStorage.removeItem('activeSidebarUrl');
        router.visit(route(home.url({ municipality: currentMunicipality.slug })));
    };

    return (
        <Sidebar {...props} className="border-r border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-sm">
            {/* HEADER */}
            <SidebarHeader className="border-b border-gray-100 pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="w-full rounded-xl pt-8 pb-8 transition-colors hover:bg-orange-50">
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
                                        {userRole?.isAdmin ? 'Administrator' : userRole?.isSuperAdmin ? 'Super-Admin' : 'User'}
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
                                <div className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                    <group.icon size={14} className="text-orange-500" />
                                    {group.title}
                                </div>

                                {/* SUBMENU */}
                                <SidebarMenuSub className="space-y-1 border-l border-gray-100 pl-4">
                                    {group.items.map((sub) => {
                                        const SubIcon = sub.icon;
                                        const isActive = isRouteActive(sub.title);

                                        return (
                                            <SidebarMenuSubItem key={sub.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    className={`group flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-out ${
                                                        isActive
                                                            ? 'border-l-4 border-orange-500 bg-orange-100 text-orange-700 shadow-sm'
                                                            : 'text-gray-700 hover:translate-x-[2px] hover:bg-gradient-to-r hover:from-orange-100 hover:to-orange-50 hover:text-orange-700 hover:shadow-md'
                                                    }`}
                                                >
                                                    <a
                                                        onClick={() => handleLinkClick(sub.url)}
                                                        className="flex w-full cursor-pointer items-center gap-2"
                                                    >
                                                        <SubIcon
                                                            size={14}
                                                            className={`transition-all duration-200 ease-out ${
                                                                isActive
                                                                    ? 'scale-110 stroke-orange-600 text-orange-600'
                                                                    : 'stroke-orange-500 text-orange-500 group-hover:scale-110 group-hover:stroke-orange-600'
                                                            }`}
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
                    variant="default"
                    onClick={handleExitAdminClick}
                    className="flex w-full items-center justify-start gap-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md transition-all duration-200 hover:from-orange-600 hover:to-red-600 hover:shadow-lg"
                >
                    <LogOut size={18} className="flex-shrink-0" />
                    <span className="font-medium">Exit Admin</span>
                </Button>
            </div>

            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                open={classicDialog.isOpen}
                positiveButtonText={classicDialog.positiveButtonText}
                negativeButtonText={classicDialog.negativeButtonText}
                hideNegativeButton={classicDialog.isNegativeButtonHidden}
                onPositiveClick={() => {
                    setClassicDialog((prev) => ({
                        ...prev,
                        isOpen: false,
                    }));

                    switch (classicDialog.action) {
                        case 'exit':
                            router.visit(home.url({ municipality: currentMunicipality.slug }));
                            break;
                    }
                }}
                onNegativeClick={() => {
                    setClassicDialog((prev) => ({
                        ...prev,
                        isOpen: false,
                    }));
                }}
            />
        </Sidebar>
    );
}
