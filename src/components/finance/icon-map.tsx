import {
  Home,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Clapperboard,
  Plane,
  Receipt,
  HeartPulse,
  MoreHorizontal,
  Wallet,
  Briefcase,
  ArrowLeftRight,
  TrendingUp,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  Home,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Clapperboard,
  Plane,
  Receipt,
  HeartPulse,
  MoreHorizontal,
  Wallet,
  Briefcase,
  ArrowLeftRight,
  TrendingUp,
  ShieldCheck,
};

export function resolveIcon(name: string): LucideIcon {
  return ICONS[name] ?? MoreHorizontal;
}
