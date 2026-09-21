"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Reveal } from "cube-motion/react";

import { AddAccountDialog } from "@/components/add-account-dialog";
import { MobileAddAccountSheet } from "@/components/mobile/add-account-sheet";
import { AccountCard } from "@/components/finance/account-card";
import { useAppStore } from "@/lib/store";
import { formatINR } from "@/lib/calculations";
import type { Account, AccountGroup } from "@/lib/types";

const GROUP_ORDER: AccountGroup[] = ["cash", "bank", "credit", "investment", "other"];
const GROUP_TITLE: Record<AccountGroup, string> = {
  cash: "Cash",
  bank: "Bank",
  credit: "Credit",
  investment: "Investments",
  other: "Other",
};
const MOBILE_GROUP_TITLE: Record<AccountGroup, string> = {
  cash: "Cash",
  bank: "Bank accounts",
  credit: "Credit",
  investment: "Investment accounts",
  other: "Other",
};

export default function AccountsPage() {
  const accounts = useAppStore((s) => s.accounts);
  const [mobileCreateOpen, setMobileCreateOpen] = React.useState(false);
  const [mobileEditing, setMobileEditing] = React.useState<Account | null>(null);
  const cashAndBank = accounts
    .filter((a) => a.group === "cash" || a.group === "bank")
    .reduce((s, a) => s + a.balance, 0);

  return (
    <>
      <div className="wl-mobile -mx-4 -mt-5 min-h-svh bg-wl-canvas px-6 pt-3 pb-6 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[28px] font-semibold leading-9 tracking-[-1.12px] text-wl-ink">Accounts</p>
          <button
            onClick={() => setMobileCreateOpen(true)}
            className="flex size-11 items-center justify-center rounded-lg bg-wl-surface"
          >
            <Plus className="size-[22px] text-wl-ink" strokeWidth={1.75} />
          </button>
        </div>

        {accounts.length === 0 ? (
          <p className="mt-6 text-center text-[14px] font-medium text-wl-muted">No accounts yet — tap + to add one.</p>
        ) : (
          <>
            <p className="mt-3 text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-muted">Cash &amp; bank balance</p>
            <p className="text-[48px] font-semibold leading-[56px] tracking-[-3.84px] text-wl-ink">{formatINR(cashAndBank)}</p>
            <p className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Across {accounts.length} accounts</p>

            <Reveal as="div" targets="children" className="mt-3 flex flex-col gap-3">
              {GROUP_ORDER.map((group) => {
                const groupAccounts = accounts.filter((a) => a.group === group);
                if (groupAccounts.length === 0) return null;
                return (
                  <div key={group} className="flex flex-col gap-3 rounded-lg bg-wl-surface p-4">
                    <p className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">{MOBILE_GROUP_TITLE[group]}</p>
                    {groupAccounts.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setMobileEditing(a)}
                        className="flex items-center justify-between text-left"
                      >
                        <span className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">{a.name}</span>
                        <span className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">
                          {a.isLiabilityAccount && a.balance > 0 ? "−" : ""}
                          {formatINR(a.balance)}
                        </span>
                      </button>
                    ))}
                    {group === "investment" && (
                      <p className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Included in your portfolio value.</p>
                    )}
                  </div>
                );
              })}
            </Reveal>
          </>
        )}
      </div>

      {mobileCreateOpen && <MobileAddAccountSheet open={mobileCreateOpen} onOpenChange={setMobileCreateOpen} />}
      {mobileEditing && (
        <MobileAddAccountSheet open={!!mobileEditing} onOpenChange={(v) => !v && setMobileEditing(null)} editAccount={mobileEditing} />
      )}

      <div className="hidden space-y-8 lg:block">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Accounts</h1>
          <p className="text-sm text-muted-foreground">{accounts.length} accounts across cash, bank, credit and investments</p>
        </div>
        <AddAccountDialog />
      </div>

      {GROUP_ORDER.map((group) => {
        const groupAccounts = accounts.filter((a) => a.group === group);
        if (groupAccounts.length === 0) return null;
        const total = groupAccounts.reduce((s, a) => s + (a.isLiabilityAccount ? -a.balance : a.balance), 0);

        return (
          <div key={group} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">{GROUP_TITLE[group]}</h2>
              <span className="text-sm font-medium tabular-nums">{formatINR(total, { compact: true })}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groupAccounts.map((a) => (
                <AccountCard key={a.id} account={a} />
              ))}
            </div>
          </div>
        );
      })}
      </div>
    </>
  );
}
