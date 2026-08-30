"use client";

import * as React from "react";
import { Download, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/finance/empty-state";
import { FilterBar } from "@/components/finance/filter-bar";
import { resolveIcon } from "@/components/finance/icon-map";
import { categories, getAccount, getCategory } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { formatINR } from "@/lib/calculations";
import type { Transaction, TransactionType } from "@/lib/types";
import { ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";

const TYPE_BADGE: Record<TransactionType, "default" | "positive" | "secondary"> = {
  expense: "secondary",
  income: "positive",
  transfer: "default",
  investment: "default",
};

const PAGE_SIZE = 12;

export default function TransactionsPage() {
  const { transactions, accounts, deleteTransaction, deleteTransactions } = useAppStore();

  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState<string>("all");
  const [categoryId, setCategoryId] = React.useState<string>("all");
  const [accountId, setAccountId] = React.useState<string>("all");
  const [minAmount, setMinAmount] = React.useState("");
  const [maxAmount, setMaxAmount] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(1);
  const [editing, setEditing] = React.useState<Transaction | null>(null);

  const activeCount = [type !== "all", categoryId !== "all", accountId !== "all", !!minAmount, !!maxAmount].filter(
    Boolean
  ).length;

  const filtered = React.useMemo(() => {
    return transactions
      .filter((t) => (type === "all" ? true : t.type === type))
      .filter((t) => (categoryId === "all" ? true : t.categoryId === categoryId))
      .filter((t) => (accountId === "all" ? true : t.accountId === accountId || t.toAccountId === accountId))
      .filter((t) => (minAmount ? t.amount >= Number(minAmount) : true))
      .filter((t) => (maxAmount ? t.amount <= Number(maxAmount) : true))
      .filter((t) =>
        search
          ? t.merchant.toLowerCase().includes(search.toLowerCase()) ||
            t.notes?.toLowerCase().includes(search.toLowerCase())
          : true
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, type, categoryId, accountId, minAmount, maxAmount]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  React.useEffect(() => setPage(1), [search, type, categoryId, accountId, minAmount, maxAmount]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.size === pageItems.length ? new Set() : new Set(pageItems.map((t) => t.id))));
  }

  function exportCsv(rows: Transaction[]) {
    const header = ["Date", "Merchant", "Category", "Account", "Type", "Amount"];
    const lines = rows.map((t) => {
      const category = getCategory(t.categoryId);
      const account = getAccount(t.accountId);
      return [t.date, t.merchant, category.name, account?.name ?? "", t.type, t.amount].join(",");
    });
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} transaction${rows.length === 1 ? "" : "s"}`);
  }

  function handleBulkDelete() {
    deleteTransactions(Array.from(selected));
    toast.success(`Deleted ${selected.size} transaction${selected.size === 1 ? "" : "s"}`);
    setSelected(new Set());
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} transactions</p>
        </div>
        <AddTransactionDialog />
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        activeCount={activeCount}
        onClearAll={() => {
          setType("all");
          setCategoryId("all");
          setAccountId("all");
          setMinAmount("");
          setMaxAmount("");
        }}
        right={
          <Button variant="outline" size="sm" onClick={() => exportCsv(filtered)}>
            <Download /> Export
          </Button>
        }
        filters={
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All accounts</SelectItem>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Min amount</Label>
                <Input value={minAmount} onChange={(e) => setMinAmount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Max amount</Label>
                <Input value={maxAmount} onChange={(e) => setMaxAmount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Any" />
              </div>
            </div>
          </>
        }
      />

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <Button variant="ghost" size="sm" onClick={() => exportCsv(filtered.filter((t) => selected.has(t.id)))}>
            <Download /> Export selected
          </Button>
          <Button variant="ghost" size="sm" className="text-negative" onClick={handleBulkDelete}>
            <Trash2 /> Delete
          </Button>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      <Card className="py-0">
        <CardContent className="px-0">
          {pageItems.length === 0 ? (
            <EmptyState icon={ArrowLeftRight} title="No transactions found" description="Try adjusting your filters or add a new transaction." />
          ) : (
            <>
            {/* Mobile: compact row list — a 6-column table doesn't fit small screens */}
            <div className="divide-y divide-border/70 md:hidden">
              {pageItems.map((t) => {
                const category = getCategory(t.categoryId);
                const account = getAccount(t.accountId);
                const Icon = resolveIcon(category.icon);
                const isPositive = t.type === "income";
                const sign = isPositive ? "+" : t.type === "expense" ? "-" : "";
                return (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <Checkbox checked={selected.has(t.id)} onCheckedChange={() => toggleSelect(t.id)} />
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.merchant}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {category.name} · {account?.name ?? "—"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-sm font-medium tabular-nums ${isPositive ? "text-positive" : ""}`}>
                        {sign}
                        {formatINR(t.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7 shrink-0">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing(t)}>
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            deleteTransaction(t.id);
                            toast.success("Transaction deleted");
                          }}
                        >
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>

            <Table wrapperClassName="hidden md:block">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 pl-4">
                    <Checkbox checked={selected.size > 0 && selected.size === pageItems.length} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((t) => {
                  const category = getCategory(t.categoryId);
                  const account = getAccount(t.accountId);
                  const Icon = resolveIcon(category.icon);
                  const isPositive = t.type === "income";
                  const sign = isPositive ? "+" : t.type === "expense" ? "-" : "";
                  return (
                    <TableRow key={t.id} data-state={selected.has(t.id) ? "selected" : undefined}>
                      <TableCell className="pl-4">
                        <Checkbox checked={selected.has(t.id)} onCheckedChange={() => toggleSelect(t.id)} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </TableCell>
                      <TableCell className="font-medium">{t.merchant}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Icon className="size-3.5" /> {category.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{account?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={TYPE_BADGE[t.type]} className="capitalize">{t.type}</Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium tabular-nums ${isPositive ? "text-positive" : ""}`}>
                        {sign}
                        {formatINR(t.amount)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-7">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditing(t)}>
                              <Pencil /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                deleteTransaction(t.id);
                                toast.success("Transaction deleted");
                              }}
                            >
                              <Trash2 /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {editing && (
        <AddTransactionDialog
          trigger={null}
          editTransaction={editing}
          open={!!editing}
          onOpenChange={(v) => !v && setEditing(null)}
        />
      )}
    </div>
  );
}
