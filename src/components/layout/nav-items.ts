import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  LineChart,
  Landmark,
  CreditCard,
  Flame,
  Target,
  FileBarChart,
  Settings,
  Layers,
  House,
  ChartNoAxesColumn,
  MoreHorizontal,
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
  { title: "Debts", href: "/debts", icon: CreditCard },
  { title: "FIRE", href: "/fire", icon: Flame },
  { title: "Goals", href: "/goals", icon: Target },
  { title: "Reports", href: "/reports", icon: FileBarChart },
  { title: "Accounts", href: "/accounts", icon: Layers },
];

// The mobile bottom tab bar (see mobile-nav.tsx) — Home/Activity/Budget are
// direct tabs; everything else lives on /more (see moreNav below).
export const mobilePrimaryNav: NavItem[] = [
  { title: "Home", href: "/overview", icon: House },
  { title: "Activity", href: "/transactions", icon: ChartNoAxesColumn },
  { title: "Budget", href: "/budget", icon: Wallet },
];

export const mobileMoreTab: NavItem = { title: "More", href: "/more", icon: MoreHorizontal };

// The /more page's list (mobile) — every primaryNav item not already a
// bottom tab, plus Settings.
export const moreNav: NavItem[] = [
  { title: "Investments", href: "/investments", icon: LineChart },
  { title: "Net Worth", href: "/net-worth", icon: Landmark },
  { title: "Debts", href: "/debts", icon: CreditCard },
  { title: "Goals", href: "/goals", icon: Target },
  { title: "FIRE planner", href: "/fire", icon: Flame },
  { title: "Reports", href: "/reports", icon: FileBarChart },
  { title: "Accounts", href: "/accounts", icon: Layers },
  { title: "Settings", href: "/settings", icon: Settings },
];

export const bottomNav: NavItem[] = [{ title: "Settings", href: "/settings", icon: Settings }];
