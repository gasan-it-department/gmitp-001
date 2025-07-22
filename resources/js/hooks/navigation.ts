import { NavigationItem } from "@/types/navigationItems";
import { LayoutGrid, Folder } from "lucide-react";

export const useNavigation = (): NavigationItem[] => [
    {
        title: "Home",
        href: "/",
        icon: LayoutGrid,
    },
    {
        title: "Services",
        href: "/services",
    },
    {
        title: "Contact Us",
        href: "/contact-us",
        icon: Folder,
    },

];
