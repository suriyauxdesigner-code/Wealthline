"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { mobilePrimaryNav, primaryNav } from "./nav-items";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const moreActive = !mobilePrimaryNav.some((i) => pathname.startsWith(i.href));

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-stretch border-t border-border bg-background/95 backdrop-blur lg:hidden">
        {mobilePrimaryNav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10.5px]",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="size-[19px]" strokeWidth={active ? 2.25 : 1.75} />
              {item.title}
            </Link>
          );
        })}
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10.5px]",
            moreActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <MoreHorizontal className="size-[19px]" strokeWidth={moreActive ? 2.25 : 1.75} />
          More
        </button>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-xl pb-8">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-2 px-4 pb-2">
            {primaryNav
              .filter((i) => !mobilePrimaryNav.some((m) => m.href === i.href))
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-border/70 px-2 py-3 text-xs hover:bg-accent"
                >
                  <item.icon className="size-5 text-muted-foreground" />
                  {item.title}
                </Link>
              ))}
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-border/70 px-2 py-3 text-xs hover:bg-accent"
            >
              Settings
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
