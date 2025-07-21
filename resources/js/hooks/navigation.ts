import { NavigationItem } from "@/types/navigationItems";
import { LayoutGrid, Folder } from "lucide-react";

export const useNavigation = (): NavigationItem[] => [
    {
        title: "Home",
        href: "/dashboard",
        icon: LayoutGrid,
    },
    {
        title: "Services",
        href: "/services",
    },
    {
        title: "About Us",
        href: "/projects",
        icon: Folder,
    },
    {
        title: "Contact Us",
        href: "/contact-us",
        icon: Folder,
    },

];
