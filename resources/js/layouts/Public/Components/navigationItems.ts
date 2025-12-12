import { LucideIcon, Folders, House, Phone, FolderKanban, Newspaper, MapPinned, Landmark, ShieldCheck, Heart } from "lucide-react";
import { travel, home, landing, government, executiveOrders, contact } from '@/routes';
import municipality from "@/routes/municipality";
import transparency from "@/routes/transparency";

export type NavigationItem = {
  title: string;
  route: ((args: { municipality: string | number }) => { url: string; method: string }) | string;
  icon?: LucideIcon;
  isActive?: boolean;
  children?: {
    label: string;
    href: string;
  }[];
};

// Returns a static array of nav items, route may be a Wayfinder function
export const useNavigation = (): NavigationItem[] => [
  {
    title: "Home",
    route: home,
    icon: House,
  },
  {
    title: "Travel",
    route: travel,
    icon: MapPinned,
  },
  {
    title: "Government",
    route: government,
    icon: Landmark,
  },
  {
    title: "Transparency",
    route: transparency.index,
    icon: ShieldCheck,
  },
  {
    title: "Executive Orders",
    route: executiveOrders,
    icon: Folders,
  },
  {
    title: "Contact Us",
    route: contact,
    icon: Phone,
  },
];