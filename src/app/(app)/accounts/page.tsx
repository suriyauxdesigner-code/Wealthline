"use client";

import { AddAccountDialog } from "@/components/add-account-dialog";
import { AccountCard } from "@/components/finance/account-card";
import { useAppStore } from "@/lib/store";
import { formatINR } from "@/lib/calculations";
import type { AccountGroup } from "@/lib/types";

const GROUP_ORDER: AccountGroup[] = ["cash", "bank", "credit", "investment", "other"];
const GROUP_TITLE: Record<AccountGroup, string> = {
  cash: "Cash",
  bank: "Bank",
  credit: "Credit",
  investment: "Investments",
  other: "Other",
};

export default function AccountsPage() {
  const accounts = useAppStore((s) => s.accounts);

  return (
    <div className="space-y-8">
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
  );
}
