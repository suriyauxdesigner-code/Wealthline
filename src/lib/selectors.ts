// Pure selector/aggregation helpers over the raw entity arrays. UI
// components should read data through these rather than looping over
// `transactions` directly, so aggregation logic lives in one place.

import type { Budget, Category, Transaction } from "./types";
import { calcCashFlow, type CashFlowSummary } from "./calculations";

const FALLBACK_CATEGORY: Category = {
  id: "",
  name: "Other",
  kind: "expense",
  icon: "MoreHorizontal",
  color: "chart-9",
};

function resolveCategory(categories: Category[], id: string): Category {
  return categories.find((c) => c.id === id) ?? FALLBACK_CATEGORY;
}

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

// The single source of truth for "what month is it right now" — every page
// that needs "this month" must derive it from here (i.e. from the real
// clock), never hardcode a literal. A hardcoded month silently drifts stale
// the moment the calendar turns over, which is exactly what happened before
// this existed (Overview/Budget/FIRE/Reports all pinned to a fixed month).
export function getCurrentMonthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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

export function monthKeyToRange(monthKey: string): { start: Date; end: Date } {
  const [y, m] = monthKey.split("-").map(Number);
  return { start: new Date(y, m - 1, 1), end: new Date(y, m, 0, 23, 59, 59, 999) };
}

function quarterRange(today: Date): { start: Date; end: Date } {
  const q = Math.floor(today.getMonth() / 3);
  return { start: new Date(today.getFullYear(), q * 3, 1), end: new Date(today.getFullYear(), q * 3 + 3, 0, 23, 59, 59, 999) };
}

function yearRange(today: Date): { start: Date; end: Date } {
  return { start: new Date(today.getFullYear(), 0, 1), end: new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999) };
}

function rangeLabel(start: Date, end: Date): string {
  const sameYear = start.getFullYear() === end.getFullYear();
  const startLabel = start.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: sameYear ? undefined : "numeric" });
  const endLabel = end.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

export type RangeOption = "this-month" | "last-month" | "this-quarter" | "this-year" | "custom";

export interface ResolvedPeriod {
  start: Date;
  end: Date;
  label: string;
  /** Set only for the two month-aligned options — lets callers keep using the monthKey-based selectors below. */
  monthKey?: string;
}

// Single source of truth for turning a RangeOption (plus, for "custom", a
// user-picked start/end) into an actual date window and a human label —
// used by both the period Select (to show real resolved labels like
// "September 2026" instead of a vague "This month") and Overview's data
// filtering, so the label and the data always agree.
export function resolvePeriod(option: RangeOption, today: Date, custom?: { start: Date; end: Date }): ResolvedPeriod {
  if (option === "custom") {
    const start = custom?.start ?? today;
    const end = custom?.end ?? today;
    return { start, end, label: rangeLabel(start, end) };
  }
  if (option === "last-month") {
    const monthKey = previousMonthKeys(getCurrentMonthKey(today), 1)[0];
    const { start, end } = monthKeyToRange(monthKey);
    return { start, end, label: monthLabel(monthKey), monthKey };
  }
  if (option === "this-quarter") {
    const { start, end } = quarterRange(today);
    const label = `${start.toLocaleDateString("en-IN", { month: "short" })} – ${end.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`;
    return { start, end, label };
  }
  if (option === "this-year") {
    const { start, end } = yearRange(today);
    return { start, end, label: String(today.getFullYear()) };
  }
  const monthKey = getCurrentMonthKey(today);
  const { start, end } = monthKeyToRange(monthKey);
  return { start, end, label: monthLabel(monthKey), monthKey };
}

export interface CategorySpend {
  category: Category;
  total: number;
  pctOfTotal: number;
}

export function spendByCategoryForRange(transactions: Transaction[], categories: Category[], start: Date, end: Date): CategorySpend[] {
  const rangeTx = transactions.filter((t) => t.type === "expense" && isInRange(t, start, end));
  const totals = new Map<string, number>();
  for (const t of rangeTx) {
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount);
  }
  const grandTotal = rangeTx.reduce((s, t) => s + t.amount, 0);
  return Array.from(totals.entries())
    .map(([categoryId, total]) => ({
      category: resolveCategory(categories, categoryId),
      total,
      pctOfTotal: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function spendByCategory(transactions: Transaction[], categories: Category[], monthKey: string): CategorySpend[] {
  const { start, end } = monthKeyToRange(monthKey);
  return spendByCategoryForRange(transactions, categories, start, end);
}

export function totalSpendForMonth(transactions: Transaction[], monthKey: string): number {
  return transactions
    .filter((t) => t.type === "expense" && isInMonth(t, monthKey))
    .reduce((s, t) => s + t.amount, 0);
}

export function cashFlowForRange(transactions: Transaction[], start: Date, end: Date): CashFlowSummary {
  return calcCashFlow(transactions.filter((t) => isInRange(t, start, end)));
}

export function cashFlowForMonth(transactions: Transaction[], monthKey: string): CashFlowSummary {
  const { start, end } = monthKeyToRange(monthKey);
  return cashFlowForRange(transactions, start, end);
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

export function budgetLinesForMonth(
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
  monthKey: string
): BudgetLine[] {
  const spend = spendByCategory(transactions, categories, monthKey);
  const spendMap = new Map(spend.map((s) => [s.category.id, s.total]));
  return budgets
    .filter((b) => b.month === monthKey)
    .map((b) => {
      const spent = spendMap.get(b.categoryId) ?? 0;
      const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      return {
        budget: b,
        category: resolveCategory(categories, b.categoryId),
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
