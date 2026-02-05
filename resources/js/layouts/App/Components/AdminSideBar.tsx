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
    FileInput,
    Flower,
    Gavel,
    Grid3X3,
    Landmark, // Represents Cemetery/Memorial
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
        if (!permission) return true; // No permission required = visible to all
        if (auth.roles?.isSuperAdmin) return true; // Super Admin sees everything
        return auth.user?.all_permission?.includes(permission);
    };

    // 2. DATA: Add 'permission' keys to your items
    const RawSidebarItems = [
        {
            title: 'CITIZEN SERVICES', // More descriptive than "Action Center"
            icon: ClipboardList,
            items: [
                {
                    title: 'Service Requests', // Clearer than just "Requests"
                    url: actionCenter.admin.index.url({ municipality: currentMunicipality.slug }),
                    icon: FileInput, // Represents submitting a form/request
                    permission: 'action_center.access',
                },
            ],
        },
        {
            title: 'COMMUNICATION', // Broader coverage for notices, events, and reports
            icon: Megaphone,
            items: [
                {
                    title: 'Announcements', // Pluralized
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
                    title: 'Citizen Feedback', // "Feedbacks" is grammatically incorrect
                    url: feedback.admin.index.url({ municipality: currentMunicipality.slug }),
                    icon: MessageSquareText,
                    permission: 'feedback.access',
                },
                {
                    title: 'Incident Reports', // "Community Reports" is vague; Incident implies action needed
                    url: communityReport.page.url({ municipality: currentMunicipality.slug }),
                    icon: Siren, // Represents alert/emergency/report
                    permission: 'community_report.access',
                },
            ],
        },
        {
            title: 'TOURISM & CONTENT', // Replaces "Promotions"
            icon: Palmtree,
            items: [
                {
                    title: 'Site Pages (CMS)',
                    url: municipality.admin.page.url({ municipality: currentMunicipality.slug }),
                    icon: LayoutTemplate, // Represents web layout
                    permission: 'municipality_settings.access',
                },
                {
                    title: 'Tourism Spots', // "Travel Editor" is a tool name; "Tourism Spots" is the object managed
                    url: travelEditor.page.url({ municipality: currentMunicipality.slug }),
                    icon: Palmtree,
                    permission: 'tourism.access',
                },
            ],
        },
        {
            title: 'PROCUREMENT', // Standard government term for Bids & Awards
            icon: Gavel, // Represents bidding/auction
            items: [
                {
                    title: 'Bid Opportunities', // More professional than "Biddings"
                    url: procurement.admin.page.url({ municipality: currentMunicipality.slug }),
                    icon: ScrollText, // Represents legal documents/contracts
                    permission: 'public_information.access',
                },
            ],
        },
        {
            title: 'GOVERNANCE',
            icon: Landmark, // 'Landmark' represents the institution/government building better than 'Users'
            items: [
                {
                    title: 'Terms of Office', // Clearer than "Roster History". Implies managing year ranges (e.g. 2025-2028).
                    url: government.admin.terms.page.url({ municipality: currentMunicipality.slug }),
                    icon: CalendarRange, // Visually represents a start and end date/period.
                    permission: 'government.access',
                },
                // {
                //     title: 'Officials Directory', // More professional than "Officials List". Implies a structured record of people.
                //     url: officialsEditor.page.url({ municipality: currentMunicipality.slug }),
                //     icon: Contact, // Represents a directory/address book. Alternatively use 'UserCheck'.
                //     permission: 'public_information.access',
                // },
            ],
        },
        {
            title: 'CEMETERY OPERATIONS',
            icon: Flower, // A respectful icon for cemetery management
            items: [
                {
                    title: 'Overview',
                    url: cemetery.admin.dashboard.url({ municipality: currentMunicipality.slug }),
                    icon: LayoutDashboard,
                    permission: 'cemetery.access',
                },
                {
                    title: 'Burial Records', // Replaces "Interments" (easier to read)
                    url: cemetery.admin.dashboard.url({ municipality: currentMunicipality.slug }),
                    icon: BookOpen, // Represents a registry
                    permission: 'cemetery.access',
                },
                {
                    title: 'Plot Mapping',
                    url: cemetery.admin.dashboard.url({ municipality: currentMunicipality.slug }),
                    icon: MapPinned,
                    permission: 'cemetery.access',
                },
                {
                    title: 'Niches & Mausoleums', // "Apartments" is colloquial; Niches is technical
                    url: cemetery.admin.dashboard.url({ municipality: currentMunicipality.slug }),
                    icon: Grid3X3, // Represents the structure of niches
                    permission: 'cemetery.access',
                },
            ],
        },
    ];

    // 3. LOGIC: Filter the groups
    const VisibleSidebarItems = RawSidebarItems.map((group) => {
        // Filter the children items first
        const visibleSubItems = group.items.filter((item) => hasPermission(item.permission));

        // Return the group with only visible children
        return { ...group, items: visibleSubItems };
    })
        // Remove the group entirely if it has no children left
        .filter((group) => group.items.length > 0);

    return (
        <Sidebar {...props} className="border-r border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-sm">
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

            <SidebarContent className="py-4">
                <SidebarGroup>
                    <SidebarMenu className="space-y-5">
                        {/* 4. RENDER: Use the filtered list */}
                        {VisibleSidebarItems.map((group) => (
                            <SidebarMenuItem key={group.title}>
                                <div className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                    <group.icon size={14} className="text-orange-500" />
                                    {group.title}
                                </div>

                                <SidebarMenuSub className="space-y-1 border-l border-gray-100 pl-4">
                                    {group.items.map((sub) => {
                                        const SubIcon = sub.icon;
                                        const isActive = isRouteActive(sub.url);

                                        return (
                                            <SidebarMenuSubItem key={sub.title} ref={isActive ? activeItemRef : null}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    className={`group flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-out ${
                                                        isActive
                                                            ? 'bg-orange-100 font-semibold text-orange-700 shadow-sm'
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

            {/* Footer remains unchanged... */}
            <div className="mt-auto border-t border-gray-100 px-3 py-3">
                {/* ... Exit Button ... */}
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
                // ... props
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
