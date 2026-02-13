import { LucideIcon, Folders, House, Phone, MapPinned, Landmark, ShieldCheck } from "lucide-react";
import { travel, home, government, executiveOrders, contact } from '@/routes';
import transparency from "@/routes/transparency";

export type NavigationItem = {
  title: string;
  route: ((args: { municipality: string | number }) => { url: string; method: string }) | string;
  icon?: LucideIcon;
  isActive?: boolean;
  id: string
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
    id: "home"
  },
  {
    title: "Travel",
    route: travel,
    icon: MapPinned,
    id: "travel"
  },
  {
    title: "Government",
    route: government,
    icon: Landmark,
    id: "government"
  },
  {
    title: "Transparency",
    route: transparency.index,
    icon: ShieldCheck,
    id: "transparency"
  },
  {
    title: "Executive Orders",
    route: executiveOrders,
    icon: Folders,
    id: "executive-orders"
  },
];