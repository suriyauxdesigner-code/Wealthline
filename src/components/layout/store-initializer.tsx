"use client";

import * as React from "react";

import { useAppStore } from "@/lib/store";

// Fetches Supabase-backed store data (accounts, transactions, categories)
// once the shell mounts, and again whenever the tab regains focus — this is
// what makes "add a transaction on one device, see it on another" work: a
// refetch on focus, per the product spec's own "or after refresh" allowance,
// rather than a realtime subscription (a later-phase enhancement).
export function StoreInitializer() {
  React.useEffect(() => {
    useAppStore.getState().init();

    function handleFocus() {
      useAppStore.getState().refresh();
    }

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return null;
}
