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
import cemetery from '@/routes/cemetery';
import communityReport from '@/routes/communityReport';
import feedback from '@/routes/feedback';
import government from '@/routes/government';
import municipality from '@/routes/municipality';
import procurement from '@/routes/procurement';
import travelEditor from '@/routes/travelEditor';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CalendarDays,
    CalendarRange,
    ClipboardList,
    Contact,
    FileInput,
    Flower,
    Gavel,
    Grid3X3,
    Landmark,
    LayoutDashboard,
    LayoutTemplate,
    LogOut,
    MapPinned,
    Megaphone,
    MessageSquareText,
    Palmtree,
    ScrollText,
    Siren,
} from 'lucide-react';
import * as React from 'react';
import { useEffect, useRef } from 'react';

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth, url } = usePage<SharedData>().props;
    const userRole = auth.roles;
    const { currentMunicipality } = useMunicipality();
    const activeItemRef = useRef<HTMLLIElement>(null);

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

    const isRouteActive = (linkUrl: string) => {
        if (!linkUrl) return false;
        return cachedUrl === linkUrl || cachedUrl.startsWith(linkUrl + '/') || cachedUrl.includes(linkUrl);
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

    useEffect(() => {
        if (activeItemRef.current) {
            activeItemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [url]);

    // 1. HELPER: Check if user has permission
    const hasPermission = (permission?: string) => {
        if (!permission) return true;
        if (auth.roles?.isSuperAdmin) return true;
        return auth.user?.all_permission?.includes(permission);
    };

    // 2. DATA
    const RawSidebarItems = [
        {
            title: 'CITIZEN SERVICES',
            icon: ClipboardList,
            items: [
                {
                    title: 'Service Requests',
                    url: actionCenter.admin.index.url({ municipality: currentMunicipality.slug }),
                    icon: FileInput,
                    permission: 'action_center.access',
                },
            ],
        },
        {
            title: 'COMMUNICATION',
            icon: Megaphone,
            items: [
                {
                    title: 'Announcements',
                    url: bulletinBoard.announcement.admin.index.url({ municipality: currentMunicipality.slug }),
                    icon: Megaphone,
                    permission: 'bulletin_board.access',
                },
                {
                    title: 'Events Calendar',
                    url: bulletinBoard.events.admin.index.url({ municipality: currentMunicipality.slug }),
                    icon: CalendarDays,
                    permission: 'bulletin_board.access',
                },
                {
                    title: 'Citizen Feedback',
                    url: feedback.admin.index.url({ municipality: currentMunicipality.slug }),
                    icon: MessageSquareText,
                    permission: 'feedback.access',
                },
                {
                    title: 'Incident Reports',
                    url: communityReport.page.url({ municipality: currentMunicipality.slug }),
                    icon: Siren,
                    permission: 'community_report.access',
                },
            ],
        },
        {
            title: 'TOURISM & CONTENT',
            icon: Palmtree,
            items: [
                {
                    title: 'Tourism Spots',
                    url: travelEditor.page.url({ municipality: currentMunicipality.slug }),
                    icon: Palmtree,
                    permission: 'tourism.access',
                },
            ],
        },
        {
            title: 'PROCUREMENT',
            icon: Gavel,
            items: [
                {
                    title: 'Bid Opportunities',
                    url: procurement.admin.page.url({ municipality: currentMunicipality.slug }),
                    icon: ScrollText,
                    permission: 'public_information.access',
                },
            ],
        },
        {
            title: 'GOVERNANCE',
            icon: Landmark,
            items: [
                {
                    title: 'Terms of Office',
                    url: government.admin.terms.page.url({ municipality: currentMunicipality.slug }),
                    icon: CalendarRange,
                    permission: 'government.access',
                },
                {
                    title: 'Officials Directory',
                    url: government.admin.officials.page.url({ municipality: currentMunicipality.slug }),
                    icon: Contact,
                    permission: 'public_information.access',
                },
                {
                    title: 'Site Pages (CMS)',
                    url: municipality.admin.page.url({ municipality: currentMunicipality.slug }),
                    icon: LayoutTemplate,
                    permission: 'municipality_settings.access',
                },
                {
                    title: 'Departments',
                    url: municipality.admin.page.url({ municipality: currentMunicipality.slug }),
                    icon: Landmark,
                    permission: 'municipality_settings.access',
                },
            ],
        },
        {
            title: 'CEMETERY OPERATIONS',
            icon: Flower,
            items: [
                {
                    title: 'Overview',
                    url: cemetery.admin.dashboard.url({ municipality: currentMunicipality.slug }),
                    icon: LayoutDashboard,
                    permission: 'cemetery.access',
                },
                {
                    title: 'Decedents Records',
                    url: cemetery.admin.decedents.list.page.url({ municipality: currentMunicipality.slug }),
                    icon: BookOpen,
                    permission: 'cemetery.access',
                },
                {
                    title: 'Plot Mapping',
                    url: cemetery.admin.dashboard.url({ municipality: currentMunicipality.slug }),
                    icon: MapPinned,
                    permission: 'cemetery.access',
                },
                {
                    title: 'Niches & Mausoleums',
                    url: cemetery.admin.dashboard.url({ municipality: currentMunicipality.slug }),
                    icon: Grid3X3,
                    permission: 'cemetery.access',
                },
            ],
        },
    ];

    // 3. LOGIC: Filter the groups
    const VisibleSidebarItems = RawSidebarItems.map((group) => {
        const visibleSubItems = group.items.filter((item) => hasPermission(item.permission));
        return { ...group, items: visibleSubItems };
    }).filter((group) => group.items.length > 0);

    return (
        // Theme Update: 'bg-sidebar', 'border-sidebar-border'
        <Sidebar {...props} className="border-r border-sidebar-border bg-sidebar shadow-none">
            <SidebarHeader className="border-b border-sidebar-border pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        {/* Hover state uses sidebar-accent variables */}
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="w-full rounded-xl pt-8 pb-8 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            <a href="#" className="flex items-center gap-3">
                                {/* Icon Box: Uses 'sidebar-primary' (Usually Dark/Black) */}
                                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                                    <span className="text-lg font-semibold">
                                        {auth.user?.first_name?.[0]}
                                        {auth.user?.last_name?.[0]}
                                    </span>
                                </div>
                                <div className="flex flex-col leading-none">
                                    {/* Text: Uses 'sidebar-foreground' */}
                                    <span className="font-semibold text-sidebar-foreground">
                                        {auth.user?.first_name} {auth.user?.last_name}
                                    </span>
                                    <span className="mt-1 mb-1 text-xs text-muted-foreground">
                                        {userRole?.isAdmin ? 'Administrator' : userRole?.isSuperAdmin ? 'Super-Admin' : 'User'}
                                    </span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="py-4">
                <SidebarGroup>
                    <SidebarMenu className="space-y-5">
                        {VisibleSidebarItems.map((group) => (
                            <SidebarMenuItem key={group.title}>
                                {/* Group Title: Muted foreground */}
                                <div className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold tracking-wide text-muted-foreground/70 uppercase">
                                    {/* Icon: Primary color */}
                                    <group.icon size={14} className="text-sidebar-primary" />
                                    {group.title}
                                </div>

                                <SidebarMenuSub className="space-y-1 border-l border-sidebar-border pl-4">
                                    {group.items.map((sub) => {
                                        const SubIcon = sub.icon;
                                        const isActive = isRouteActive(sub.url);

                                        return (
                                            <SidebarMenuSubItem key={sub.title} ref={isActive ? activeItemRef : null}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    // Active/Inactive Logic updated to Sidebar Theme
                                                    className={`group flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-out ${
                                                        isActive
                                                            ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-sm'
                                                            : 'text-sidebar-foreground/80 hover:translate-x-[2px] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
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
                                                                    ? 'scale-110 text-sidebar-primary'
                                                                    : 'text-muted-foreground group-hover:scale-110 group-hover:text-sidebar-primary'
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

            {/* Footer */}
            <div className="mt-auto border-t border-sidebar-border px-3 py-3">
                <Button
                    variant="default"
                    onClick={handleExitAdminClick}
                    // Uses 'primary' color from global theme (typically slate-900/black)
                    className="flex w-full items-center justify-start gap-3 rounded-lg bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90"
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
                    setClassicDialog((prev) => ({ ...prev, isOpen: false }));
                    if (classicDialog.action === 'exit') {
                        router.visit(home.url({ municipality: currentMunicipality.slug }));
                    }
                }}
                onNegativeClick={() => setClassicDialog((prev) => ({ ...prev, isOpen: false }))}
            />
        </Sidebar>
    );
}
