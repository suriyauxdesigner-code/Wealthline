import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  LineChart,
  Landmark,
  Flame,
  Target,
  FileBarChart,
  Settings,
  Layers,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const primaryNav: NavItem[] = [
  { title: "Overview", href: "/overview", icon: LayoutDashboard },
  { title: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { title: "Budget", href: "/budget", icon: Wallet },
  { title: "Investments", href: "/investments", icon: LineChart },
  { title: "Net Worth", href: "/net-worth", icon: Landmark },
  { title: "FIRE", href: "/fire", icon: Flame },
  { title: "Goals", href: "/goals", icon: Target },
  { title: "Reports", href: "/reports", icon: FileBarChart },
  { title: "Accounts", href: "/accounts", icon: Layers },
];

export const mobilePrimaryNav: NavItem[] = [
  { title: "Overview", href: "/overview", icon: LayoutDashboard },
  { title: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { title: "Budget", href: "/budget", icon: Wallet },
  { title: "Investments", href: "/investments", icon: LineChart },
];

export const bottomNav: NavItem[] = [{ title: "Settings", href: "/settings", icon: Settings }];
