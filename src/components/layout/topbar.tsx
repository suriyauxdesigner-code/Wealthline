"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { primaryNav } from "./nav-items";

// Pages redesigned for the mobile shell (see .wl-mobile) render their own
// inline header (wordmark + profile) and have no dark mode, so this bar
// only needs to exist for them on desktop — everywhere else keeps it on
// mobile too until redesigned. Every (app) route has its own mobile branch
// now, so this covers all of them.
const MOBILE_REDESIGNED_PATHS = [
  "/overview",
  "/transactions",
  "/more",
  "/budget",
  "/net-worth",
  "/debts",
  "/goals",
  "/accounts",
  "/fire",
  "/reports",
  "/settings",
  "/investments",
];

export function Topbar() {
  const pathname = usePathname();
  const current = primaryNav.find((i) => pathname.startsWith(i.href));
  const isMobileRedesigned = MOBILE_REDESIGNED_PATHS.some((p) => pathname.startsWith(p));

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-14 items-center justify-between border-b border-border/70 bg-background/95 px-4 backdrop-blur lg:px-8",
        isMobileRedesigned ? "hidden lg:flex" : "flex"
      )}
    >
      <div className="flex items-center gap-2 lg:hidden">
        <span className="text-sm font-semibold">{current?.title ?? "Wealthline"}</span>
      </div>
      <div className="hidden lg:block" />
      <ModeToggle />
    </header>
  );
}
