"use client";

import { usePathname } from "next/navigation";

import { ModeToggle } from "@/components/mode-toggle";
import { primaryNav } from "./nav-items";

export function Topbar() {
  const pathname = usePathname();
  const current = primaryNav.find((i) => pathname.startsWith(i.href));

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/70 bg-background/95 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="text-sm font-semibold">{current?.title ?? "Wealthline"}</span>
      </div>
      <div className="hidden lg:block" />
      <ModeToggle />
    </header>
  );
}
