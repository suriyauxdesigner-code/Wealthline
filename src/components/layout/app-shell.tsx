import type { ReactNode } from "react";

import { AppSidebar } from "./app-sidebar";
import { MobileNav } from "./mobile-nav";
import { StoreInitializer } from "./store-initializer";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <StoreInitializer />
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 pb-20 pt-5 lg:px-8 lg:pb-10 lg:pt-6">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
