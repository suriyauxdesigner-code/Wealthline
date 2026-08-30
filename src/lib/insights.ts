// Deterministic financial insights.
//
// Every insight below is derived from a plain calculation over the same
// data the rest of the app reads — nothing here is hand-written copy tied
// to the seed data. This keeps the module swappable later: an AI layer
// could generate additional narrative insights or rank these, but the
// underlying signals (spend deltas, budget overage, net worth deltas, FIRE
// sensitivity) stay the same deterministic functions.

import type { Budget, FIREProfile, NetWorthSnapshot, Transaction } from "./types";
import {
  budgetLinesForMonth,
  monthKeyOf,
  previousMonthKeys,
  spendByCategory,
  totalSpendForMonth,
} from "./selectors";
import { calcCashFlow, calcNetWorth, formatINR, formatPercent, projectFire } from "./calculations";
import type { Insight } from "./types";

export function generateInsights(params: {
  transactions: Transaction[];
  budgets: Budget[];
  netWorthHistory: NetWorthSnapshot[];
  fireProfile: FIREProfile;
  currentPortfolioValue: number;
  currentMonthKey: string;
}): Insight[] {
  const { transactions, budgets, netWorthHistory, fireProfile, currentPortfolioValue, currentMonthKey } = params;
  const insights: Insight[] = [];

  // 1. Category spend spike vs trailing 3-month average
  const priorMonths = previousMonthKeys(currentMonthKey, 3);
  const currentSpend = spendByCategory(transactions, currentMonthKey);
  for (const entry of currentSpend.slice(0, 3)) {
    const priorTotals = priorMonths.map(
      (m) => spendByCategory(transactions, m).find((s) => s.category.id === entry.category.id)?.total ?? 0
    );
    const validPrior = priorTotals.filter((v) => v > 0);
    if (validPrior.length === 0) continue;
    const avg = validPrior.reduce((a, b) => a + b, 0) / validPrior.length;
    const deltaPct = ((entry.total - avg) / avg) * 100;
    if (deltaPct >= 20) {
      insights.push({
        id: `insight_spend_${entry.category.id}`,
        severity: deltaPct >= 40 ? "action" : "warning",
        title: `${entry.category.name} spending is up`,
        description: `${entry.category.name} spending increased ${formatPercent(deltaPct, 0)} compared with your 3-month average (${formatINR(avg, { compact: true })}).`,
      });
    }
  }

  // 2. Investment rate this month
  const cashFlow = calcCashFlow(transactions.filter((t) => monthKeyOf(t.date) === currentMonthKey));
  if (cashFlow.income > 0) {
    const investmentRate = (cashFlow.investments / cashFlow.income) * 100;
    if (investmentRate >= 20) {
      insights.push({
        id: "insight_investment_rate",
        severity: "positive",
        title: "Strong investment rate",
        description: `You invested ${formatPercent(investmentRate, 0)} of your income this month — ${formatINR(cashFlow.investments, { compact: true })} across your SIPs.`,
      });
    }
  }

  // 3. Net worth change this month
  if (netWorthHistory.length >= 2) {
    const last = netWorthHistory[netWorthHistory.length - 1];
    const prev = netWorthHistory[netWorthHistory.length - 2];
    const change = calcNetWorth(last.assets, last.liabilities) - calcNetWorth(prev.assets, prev.liabilities);
    insights.push({
      id: "insight_net_worth_change",
      severity: change >= 0 ? "positive" : "warning",
      title: change >= 0 ? "Net worth grew this month" : "Net worth dipped this month",
      description: `Your net worth ${change >= 0 ? "increased" : "decreased"} ${formatINR(Math.abs(change), { compact: true })} this month.`,
    });
  }

  // 4. Budget overage
  const budgetLines = budgetLinesForMonth(budgets, transactions, currentMonthKey);
  const overBudget = budgetLines.filter((b) => b.status === "over").sort((a, b) => b.spent - b.remaining - (a.spent - a.remaining));
  if (overBudget.length > 0) {
    const worst = overBudget[0];
    insights.push({
      id: `insight_over_budget_${worst.category.id}`,
      severity: "action",
      title: `Over budget on ${worst.category.name}`,
      description: `You're spending ${formatINR(Math.abs(worst.remaining), { compact: true })} more than your monthly ${worst.category.name} budget.`,
    });
  }

  // 5. Total spend vs total budget
  const totalBudget = budgetLines.reduce((s, b) => s + b.budget.limit, 0);
  const totalSpent = totalSpendForMonth(transactions, currentMonthKey);
  if (totalBudget > 0 && totalSpent > totalBudget) {
    insights.push({
      id: "insight_total_over_budget",
      severity: "warning",
      title: "Total spending above budget",
      description: `You are currently spending ${formatINR(totalSpent - totalBudget, { compact: true })} more than your combined monthly budget.`,
    });
  }

  // 6. FIRE sensitivity — what a higher SIP would do to the FIRE date
  const baseline = projectFire(fireProfile, currentPortfolioValue);
  const bumped = projectFire(
    { ...fireProfile, monthlyInvestment: fireProfile.monthlyInvestment + 5000 },
    currentPortfolioValue
  );
  if (baseline.fireAge && bumped.fireAge && bumped.fireAge < baseline.fireAge) {
    const yearsSaved = baseline.fireAge - bumped.fireAge;
    insights.push({
      id: "insight_fire_sensitivity",
      severity: "info",
      title: "A higher SIP moves your FIRE date forward",
      description: `Increasing your monthly investment by ${formatINR(5000, { compact: true })} could move your estimated FIRE age forward by ${yearsSaved} year${yearsSaved === 1 ? "" : "s"}.`,
    });
  }

  return insights;
}
