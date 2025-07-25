import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Home, Landmark, Newspaper, Phone, Receipt, ShieldCheck } from 'lucide-react';
import { RouteNames } from '../Utility/RouteNames';

interface ClickEvent {
    itemClicked: (itemName: string) => void;
}

const items = [
    {
        title: 'Home',
        id: RouteNames.Home,
        icon: Home,
    },
    {
        title: 'Government',
        id: RouteNames.Government,
        icon: Landmark,
    },
    {
        title: 'Services',
        id: RouteNames.Services,
        icon: Receipt,
    },
    {
        title: 'Executive Orders',
        id: RouteNames.ExecutiveOrders,
        icon: Receipt,
    },
    {
        title: 'News & Events',
        id: RouteNames.NewsAndEventsPage,
        icon: Newspaper,
    },
    {
        title: 'Transparency',
        id: RouteNames.TransparencyPage,
        icon: ShieldCheck,
    },
    {
        title: 'Contact Us',
        id: RouteNames.ContactUs,
        icon: Phone,
    },
];

export default function AppSidebarMenu({ itemClicked }: ClickEvent) {
    const handleItemClick = (id: string) => {
        itemClicked(id);
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a
                                                className="flex items-center gap-6 p-6"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleItemClick(item.id);
                                                }}
                                            >
                                                <item.icon className="h-6 w-6" />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </SidebarHeader>
        </Sidebar>
    );
}
