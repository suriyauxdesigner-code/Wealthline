"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { mobileMoreTab, mobilePrimaryNav } from "./nav-items";

export function MobileNav() {
  const pathname = usePathname();
  const moreActive = !mobilePrimaryNav.some((i) => pathname.startsWith(i.href));
  const tabs = [...mobilePrimaryNav, mobileMoreTab];

  return (
    <nav className="wl-mobile fixed inset-x-0 bottom-0 z-40 flex h-20 items-center gap-3 border-t border-wl-border bg-wl-surface px-2 py-3 lg:hidden">
      {tabs.map((item) => {
        const active = item === mobileMoreTab ? moreActive : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-[12px] tracking-[-0.48px]",
              active ? "text-wl-accent-text" : "text-wl-muted"
            )}
          >
            <item.icon className="size-[22px]" strokeWidth={active ? 2.25 : 1.75} />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
