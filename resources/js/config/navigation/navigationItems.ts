import { LucideIcon, House, Phone, FolderKanban, Newspaper, Landmark, ShieldCheck } from "lucide-react";

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

export const useNavigation = (): NavigationItem[] => [
  {
    title: "Home",
    href: "/",
    icon: House,
  },
  {
    title: "Services",
    href: "/services",
    icon: FolderKanban,
  },
  {
    title: "Contact Us",
    href: "/contact-us",
    icon: Phone,
  },
  {
    title: "News & Events",
    href: "/news-events",
    icon: Newspaper,
  },
  {
    title: "Government",
    href: "/government",
    icon: Landmark,
  },
  {
    title: "transparency",
    href: "/transparency",
    icon: ShieldCheck,
  }

];
