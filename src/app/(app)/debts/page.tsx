"use client";

import * as React from "react";
import { CreditCard, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AddLiabilityDialog } from "@/components/add-liability-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/finance/empty-state";
import { MetricCard } from "@/components/finance/metric-card";
import { useAppStore } from "@/lib/store";
import { formatINR, formatPercent } from "@/lib/calculations";
import type { Liability } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  credit_card: "Credit card",
  personal_loan: "Personal loan",
  vehicle_loan: "Vehicle loan",
  home_loan: "Home loan",
  education_loan: "Education loan",
  other: "Other debt",
};

export default function DebtsPage() {
  const { liabilities, deleteLiability } = useAppStore();
  const [editing, setEditing] = React.useState<Liability | null>(null);

  const totalOutstanding = liabilities.reduce((s, l) => s + l.outstanding, 0);
  const totalMonthlyPayment = liabilities.reduce((s, l) => s + l.monthlyPayment, 0);
  const totalPrincipal = liabilities.reduce((s, l) => s + l.principal, 0);
  const weightedRate =
    totalOutstanding > 0
      ? liabilities.reduce((s, l) => s + l.interestRate * l.outstanding, 0) / totalOutstanding
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Debts</h1>
          <p className="text-sm text-muted-foreground">{liabilities.length} debts tracked</p>
        </div>
        <AddLiabilityDialog />
      </div>

      {liabilities.length > 0 && (
        <Card className="py-5">
          <CardContent className="grid grid-cols-2 gap-6 px-5 sm:grid-cols-4 sm:px-6">
            <MetricCard label="Total debt" value={formatINR(totalOutstanding, { compact: true })} size="lg" />
            <MetricCard label="Monthly payments" value={formatINR(totalMonthlyPayment, { compact: true })} size="lg" />
            <MetricCard label="Blended interest rate" value={formatPercent(weightedRate, 1)} size="lg" />
            <MetricCard label="Debts tracked" value={String(liabilities.length)} size="lg" />
          </CardContent>
        </Card>
      )}

      {liabilities.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={CreditCard}
              title="No debts yet"
              description="Add a loan or credit card to start tracking what you owe — and to link payments to it from Transactions."
              action={<AddLiabilityDialog />}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {liabilities.map((l) => {
            const paidOffPct = l.principal > 0 ? Math.min(100, ((l.principal - l.outstanding) / l.principal) * 100) : 0;
            return (
              <Card key={l.id} className="gap-3 py-4">
                <CardContent className="space-y-3 px-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium leading-tight">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{TYPE_LABEL[l.type] ?? l.type}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing(l)}>
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            deleteLiability(l.id);
                            toast.success("Debt removed");
                          }}
                        >
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-semibold tabular-nums">{formatINR(l.outstanding, { compact: true })}</span>
                    <span className="text-xs text-muted-foreground">of {formatINR(l.principal, { compact: true })}</span>
                  </div>
                  <Progress value={paidOffPct} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{paidOffPct.toFixed(0)}% paid off</span>
                    <span>{formatPercent(l.interestRate, 1)} interest</span>
                  </div>
                  <div className="border-t border-border/70 pt-2 text-xs text-muted-foreground">
                    Monthly payment: <span className="font-medium text-foreground">{formatINR(l.monthlyPayment, { compact: true })}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {liabilities.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Total original principal across all debts: {formatINR(totalPrincipal, { compact: true })}. Log a payment
          from <span className="font-medium text-foreground">Transactions → Add transaction</span> and pick this
          debt to reduce its balance automatically.
        </p>
      )}

      {editing && (
        <AddLiabilityDialog
          trigger={null}
          editLiability={editing}
          open={!!editing}
          onOpenChange={(v) => !v && setEditing(null)}
        />
      )}
    </div>
  );
}
