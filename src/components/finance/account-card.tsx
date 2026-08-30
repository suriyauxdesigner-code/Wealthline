import { Banknote, CreditCard, Landmark, LineChart, PiggyBank } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/calculations";
import type { Account, AccountGroup } from "@/lib/types";

const GROUP_ICON: Record<AccountGroup, typeof Banknote> = {
  cash: Banknote,
  bank: Landmark,
  credit: CreditCard,
  investment: LineChart,
  other: PiggyBank,
};

const GROUP_LABEL: Record<AccountGroup, string> = {
  cash: "Cash",
  bank: "Bank",
  credit: "Credit",
  investment: "Investments",
  other: "Other",
};

export function AccountCard({ account }: { account: Account }) {
  const Icon = GROUP_ICON[account.group];

  return (
    <Card className="gap-3 py-4">
      <div className="flex items-start justify-between px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">{account.name}</p>
            <p className="text-xs text-muted-foreground">{account.institution}</p>
          </div>
        </div>
        <Badge variant="outline">{GROUP_LABEL[account.group]}</Badge>
      </div>
      <div className="px-5">
        <p className={`text-xl font-semibold tabular-nums ${account.isLiabilityAccount ? "text-negative" : ""}`}>
          {account.isLiabilityAccount ? "-" : ""}
          {formatINR(account.balance)}
        </p>
        {account.last4 && <p className="text-xs text-muted-foreground">•••• {account.last4}</p>}
      </div>
    </Card>
  );
}
