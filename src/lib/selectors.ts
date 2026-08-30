// Pure selector/aggregation helpers over the raw entity arrays. UI
// components should read data through these rather than looping over
// `transactions` directly, so aggregation logic lives in one place.

import { getCategory } from "./mock-data";
import type { Budget, Category, Transaction } from "./types";
import { calcCashFlow, type CashFlowSummary } from "./calculations";

export function monthKeyOf(dateIso: string): string {
  return dateIso.slice(0, 7);
}

export function isInMonth(t: Transaction, monthKey: string): boolean {
  return monthKeyOf(t.date) === monthKey;
}

export function isInRange(t: Transaction, start: Date, end: Date): boolean {
  const d = new Date(t.date).getTime();
  return d >= start.getTime() && d <= end.getTime();
}

export function previousMonthKeys(fromMonthKey: string, count: number): string[] {
  const [y, m] = fromMonthKey.split("-").map(Number);
  const out: string[] = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date(y, m - 1 - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export interface CategorySpend {
  category: Category;
  total: number;
  pctOfTotal: number;
}

export function spendByCategory(transactions: Transaction[], monthKey: string): CategorySpend[] {
  const monthTx = transactions.filter((t) => t.type === "expense" && isInMonth(t, monthKey));
  const totals = new Map<string, number>();
  for (const t of monthTx) {
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount);
  }
  const grandTotal = monthTx.reduce((s, t) => s + t.amount, 0);
  return Array.from(totals.entries())
    .map(([categoryId, total]) => ({
      category: getCategory(categoryId),
      total,
      pctOfTotal: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function totalSpendForMonth(transactions: Transaction[], monthKey: string): number {
  return transactions
    .filter((t) => t.type === "expense" && isInMonth(t, monthKey))
    .reduce((s, t) => s + t.amount, 0);
}

export function cashFlowForMonth(transactions: Transaction[], monthKey: string): CashFlowSummary {
  return calcCashFlow(transactions.filter((t) => isInMonth(t, monthKey)));
}

export type BudgetStatus = "healthy" | "near" | "over";

export interface BudgetLine {
  budget: Budget;
  category: Category;
  spent: number;
  remaining: number;
  pct: number;
  status: BudgetStatus;
}

export function budgetStatusFor(pct: number): BudgetStatus {
  if (pct >= 100) return "over";
  if (pct >= 85) return "near";
  return "healthy";
}

export function budgetLinesForMonth(budgets: Budget[], transactions: Transaction[], monthKey: string): BudgetLine[] {
  const spend = spendByCategory(transactions, monthKey);
  const spendMap = new Map(spend.map((s) => [s.category.id, s.total]));
  return budgets
    .filter((b) => b.month === monthKey)
    .map((b) => {
      const spent = spendMap.get(b.categoryId) ?? 0;
      const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      return {
        budget: b,
        category: getCategory(b.categoryId),
        spent,
        remaining: b.limit - spent,
        pct,
        status: budgetStatusFor(pct),
      };
    })
    .sort((a, b) => b.pct - a.pct);
}

export function daysElapsedInMonth(monthKey: string, today: Date): number {
  const [y, m] = monthKey.split("-").map(Number);
  const isCurrentMonth = today.getFullYear() === y && today.getMonth() + 1 === m;
  if (isCurrentMonth) return today.getDate();
  return new Date(y, m, 0).getDate(); // full days in that month
}
