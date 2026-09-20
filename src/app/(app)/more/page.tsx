"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { moreNav } from "@/components/layout/nav-items";

// This route only exists for the mobile bottom nav's "More" tab — on
// desktop everything here is already in the sidebar, so a stray direct
// visit gets a short fallback instead of blank space.
export default function MorePage() {
  return (
    <>
      <div className="wl-mobile -mx-4 -mt-5 min-h-svh bg-wl-canvas px-6 pt-3 pb-6 lg:hidden">
        <h1 className="text-[28px] font-semibold leading-[36px] tracking-[-1.12px] text-wl-ink">More</h1>
        <div className="mt-3 flex flex-col">
          {moreNav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={i > 0 ? "flex h-[60px] items-center justify-between border-t border-wl-border" : "flex h-[60px] items-center justify-between"}
            >
              <span className="text-[16px] font-semibold leading-[24px] tracking-[-0.32px] text-wl-ink">{item.title}</span>
              <ChevronRight className="size-[18px] text-wl-muted" />
            </Link>
          ))}
        </div>
      </div>
      <div className="hidden p-8 text-sm text-muted-foreground lg:block">
        Everything here is already in the sidebar.{" "}
        <Link href="/overview" className="text-primary hover:underline">
          Back to Overview
        </Link>
      </div>
    </>
  );
}
