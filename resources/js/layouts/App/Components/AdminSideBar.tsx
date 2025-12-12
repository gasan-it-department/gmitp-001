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
import awardsAdminPage from '@/routes/awardsAdminPage';
import biddingAdminPage from '@/routes/biddingAdminPage';
import bulletinBoard from '@/routes/bulletin-board';
import citizenCharter from '@/routes/citizenCharter';
import communityReport from '@/routes/communityReport';
import executiveOrders from '@/routes/executiveOrders';
import feedback from '@/routes/feedback';
import municipality from '@/routes/municipality';
import officialsEditor from '@/routes/officialsEditor';
import travelEditor from '@/routes/travelEditor';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    Building2,
    CalendarDays,
    ClipboardList,
    FileSignature,
    FileText,
    FlagIcon,
    Hand,
    Info,
    Landmark,
    LogOut,
    Medal,
    Megaphone,
    MessageCircleIcon,
    Plane,
    Sparkle,
    Trophy,
    User,
    UsersIcon,
} from 'lucide-react';
import * as React from 'react';
import { useRef, useEffect } from 'react';

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
        console.log("Active URL: ", linkUrl);
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

    const AdminSidebarItems = [
        {
            title: 'ACTION CENTER',
            icon: ClipboardList,
            items: [

                {
                    title: 'Requests',
                    url: actionCenter.admin.index.url({ municipality: currentMunicipality.slug }),
                    icon: FileText
                },
            ],
        },
        {
            title: 'NOTICES & ADVISORIES',
            icon: Info,
            items: [
                {
                    title: 'Announcement',
                    url: bulletinBoard.announcement.admin.index.url({ municipality: currentMunicipality.slug }),
                    icon: Megaphone,
                },
                {
                    title: 'Events',
                    url: bulletinBoard.events.admin.index.url({ municipality: currentMunicipality.slug }),
                    icon: CalendarDays
                },
                {
                    title: 'Feedbacks',
                    url: feedback.admin.index.url({ municipality: currentMunicipality.slug }),
                    icon: MessageCircleIcon
                },
                {
                    title: 'Comunity Reports',
                    url: communityReport.page.url({ municipality: currentMunicipality.slug }),
                    icon: UsersIcon
                },
            ],
        },
        {
            title: 'PROMOTIONS',
            icon: Sparkle,
            items: [
                {
                    title: 'CMS',
                    url: municipality.admin.page.url({ municipality: currentMunicipality.slug }),
                    icon: FlagIcon
                },
                {
                    title: 'Travel Editor',
                    url: travelEditor.page.url({ municipality: currentMunicipality.slug }),
                    icon: Plane
                },
            ],
        },
        {
            title: 'BIDS AND AWARDS',
            icon: Medal,
            items: [
                {
                    title: 'Invitation to Bid',
                    url: biddingAdminPage.page.url({ municipality: currentMunicipality.slug }),
                    icon: Hand,
                },
                {
                    title: 'Awards',
                    url: awardsAdminPage.page.url({ municipality: currentMunicipality.slug }),
                    icon: Trophy,
                },
                {
                    title: "Citizen's Charter",
                    url: citizenCharter.page.url({ municipality: currentMunicipality.slug }),
                    icon: User,
                },
            ],
        },
        {
            title: 'LOCAL GOVERNMENT',
            icon: Landmark,
            items: [
                {
                    title: 'Executive Orders',
                    url: executiveOrders.page.url({ municipality: currentMunicipality.slug }),
                    icon: FileSignature,
                },
                {
                    title: 'Officials',
                    url: officialsEditor.page.url({ municipality: currentMunicipality.slug }),
                    icon: BadgeCheck,
                },
                // {
                //     title: 'Offices',
                //     url: officesAdmin.page.url({ municipality: currentMunicipality.slug }),
                //     icon: Building2,
                // },
            ],
        },
    ];

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
                        {AdminSidebarItems.map((group) => (
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
                                        const isActive = isRouteActive(sub.url);

                                        return (
                                            <SidebarMenuSubItem
                                                key={sub.title}
                                                // 3. Attach the ref to the active item's container
                                                ref={isActive ? activeItemRef : null}
                                            >
                                                <SidebarMenuSubButton
                                                    asChild
                                                    className={`group flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-out ${isActive
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
                                                            className={`transition-all duration-200 ease-out ${isActive
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