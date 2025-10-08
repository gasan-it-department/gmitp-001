import { LucideIcon, House, Phone, FolderKanban, Newspaper, MapPinned, Landmark, ShieldCheck } from "lucide-react";

export type NavigationItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  isActive?: boolean;
  children?: {
    label: string;
    href: string;
  }[];
};

// export type NavigationItem = {
//   title: string;
//   href: string;
//   icon?: LucideIcon;
//   isActive?: boolean;
//   children?: {
//     label: string;
//     href: string;
//   }[];
// };

export const useNavigation = (): NavigationItem[] => [
  {
    title: "Home",
    href: "/home",
    icon: House,
  },
  {
    title: "Travel",
    href: "/tourism",
    icon: MapPinned,
  },
  {
    title: "Government",
    href: "/government",
    icon: Landmark,
  },
  {
    title: "Transparency",
    href: "/transparency",
    icon: ShieldCheck,
  },
  {
    title: "Contact Us",
    href: "/contact-us",
    icon: Phone,
  },
  
];
