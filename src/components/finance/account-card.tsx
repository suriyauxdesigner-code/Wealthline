"use client";

import * as React from "react";
import { Banknote, CreditCard, Landmark, LineChart, MoreHorizontal, Pencil, PiggyBank, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AddAccountDialog } from "@/components/add-account-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/lib/store";
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
  const deleteAccount = useAppStore((s) => s.deleteAccount);
  const [editOpen, setEditOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  async function handleDelete() {
    await deleteAccount(account.id);
    toast.success("Account deleted", { description: account.name });
    setConfirmOpen(false);
  }

  return (
    <Card className="gap-3 py-4">
      <div className="flex items-start justify-between px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">{account.name}</p>
            {account.institution && account.institution !== "—" && (
              <p className="text-xs text-muted-foreground">{account.institution}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline">{GROUP_LABEL[account.group]}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-6 text-muted-foreground">
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="px-5">
        <p className={`text-xl font-semibold tabular-nums ${account.isLiabilityAccount ? "text-negative" : ""}`}>
          {account.isLiabilityAccount ? "-" : ""}
          {formatINR(account.balance)}
        </p>
        {account.last4 && <p className="text-xs text-muted-foreground">•••• {account.last4}</p>}
      </div>

      {editOpen && (
        <AddAccountDialog editAccount={account} trigger={null} open={editOpen} onOpenChange={setEditOpen} />
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {account.name}?</DialogTitle>
            <DialogDescription>
              This also permanently deletes every transaction recorded against this account. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
