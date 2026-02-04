import { LucideIcon, Folders, House, Phone, MapPinned, Landmark, ShieldCheck } from "lucide-react";
import { travel, home, government, executiveOrders, contact } from '@/routes';
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
];