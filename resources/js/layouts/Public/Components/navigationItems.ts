import { LucideIcon, Folders, House, Phone, MapPinned, Landmark, ShieldCheck, Bug } from "lucide-react";
import { travel, home, executiveOrders, contact } from '@/routes';
import transparency from "@/routes/transparency";
import { roster } from "@/routes/government";
import supportTicket from "@/routes/supportTicket";

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
  disabled?: boolean;
  badge?: string;
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
    id: "travel",
    disabled: true,
    badge: "Coming Soon"
  },
  {
    title: "Government",
    route: roster,
    icon: Landmark,
    id: "government"
  },
  {
    title: "Transparency",
    route: transparency.index,
    icon: ShieldCheck,
    id: "transparency"
  },
  // {
  //   title: "Report a Bug",
  //   route: supportTicket.create,
  //   icon: Bug,
  //   id: "report"
  // },
  // {
  //   title: "Executive Orders",
  //   route: executiveOrders,
  //   icon: Folders,
  //   id: "executive-orders"
  // },
];