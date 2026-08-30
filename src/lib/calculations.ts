// Reusable financial calculation utilities.
// Nothing in this file touches the UI — every function is a pure, typed
// transform over primitives so it can be unit-tested and reused (Overview,
// Net Worth, FIRE, Reports, Financial Health all call into this module
// rather than re-deriving formulas inline).

import type { Account, Liability, Transaction, FIREProfile } from "./types";

// ---------- Net worth ----------

/** Net Worth = Total Assets − Total Liabilities */
export function calcNetWorth(totalAssets: number, totalLiabilities: number): number {
  return totalAssets - totalLiabilities;
}

export function calcTotalAssets(accounts: Account[]): number {
  return accounts.filter((a) => !a.isLiabilityAccount).reduce((sum, a) => sum + a.balance, 0);
}

export function calcTotalLiabilities(liabilities: Liability[]): number {
  return liabilities.reduce((sum, l) => sum + l.outstanding, 0);
}

/** Compound annual growth rate between two values over `years`. */
export function calcCAGR(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || years <= 0) return 0;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

// ---------- Cash flow / savings ----------

/** Savings Rate = (Income − Expenses) / Income × 100 */
export function calcSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  return ((income - expenses) / income) * 100;
}

/** Investment Rate = Investments / Income × 100 */
export function calcInvestmentRate(investments: number, income: number): number {
  if (income <= 0) return 0;
  return (investments / income) * 100;
}

export interface CashFlowSummary {
  income: number;
  expenses: number;
  investments: number;
  remaining: number;
}

export function calcCashFlow(transactions: Transaction[]): CashFlowSummary {
  let income = 0;
  let expenses = 0;
  let investments = 0;
  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    else if (t.type === "expense") expenses += t.amount;
    else if (t.type === "investment") investments += t.amount;
  }
  return { income, expenses, investments, remaining: income - expenses - investments };
}

// ---------- Investments ----------

export function calcInvestedValue(quantity: number, averageCost: number): number {
  return quantity * averageCost;
}

export function calcCurrentValue(quantity: number, currentPrice: number): number {
  return quantity * currentPrice;
}

export function calcReturnPct(invested: number, currentValue: number): number {
  if (invested <= 0) return 0;
  return ((currentValue - invested) / invested) * 100;
}

// ---------- FIRE ----------

/** FIRE Corpus = Annual retirement-year expenses ÷ withdrawal rate. */
export function calcFireCorpus(annualExpensesAtRetirement: number, withdrawalRatePct: number): number {
  if (withdrawalRatePct <= 0) return 0;
  return annualExpensesAtRetirement / (withdrawalRatePct / 100);
}

/** Future value of a single expense stream after inflation over `years`. */
export function calcFutureExpenses(currentAnnualExpenses: number, inflationPct: number, years: number): number {
  return currentAnnualExpenses * Math.pow(1 + inflationPct / 100, years);
}

/**
 * Future portfolio value from a current lump sum plus recurring monthly
 * contributions, compounded monthly at `annualReturnPct`.
 * Contributions are assumed to grow each year by `contributionGrowthPct`
 * (e.g. rising SIP as income grows) — pass 0 for a flat contribution.
 */
export function calcFuturePortfolioValue(params: {
  currentValue: number;
  monthlyContribution: number;
  annualReturnPct: number;
  years: number;
  contributionGrowthPct?: number;
}): number {
  const { currentValue, monthlyContribution, annualReturnPct, years, contributionGrowthPct = 0 } = params;
  const monthlyRate = annualReturnPct / 100 / 12;
  let value = currentValue;
  let contribution = monthlyContribution;
  const totalMonths = Math.round(years * 12);

  for (let m = 1; m <= totalMonths; m++) {
    value = value * (1 + monthlyRate) + contribution;
    // bump the contribution at each 12-month mark
    if (contributionGrowthPct > 0 && m % 12 === 0) {
      contribution = contribution * (1 + contributionGrowthPct / 100);
    }
  }
  return value;
}

export interface FireProjectionPoint {
  age: number;
  year: number;
  projectedValue: number;
  fireNumber: number;
}

export interface FireProjectionResult {
  points: FireProjectionPoint[];
  fireNumberToday: number;
  fireAge: number | null;
  yearsRemaining: number | null;
  currentFirePercent: number;
  requiredMonthlyInvestment: number;
}

/**
 * Builds a year-by-year projection from `currentAge` to `lifeExpectancy`
 * (or +40 years if unset), marking the first age at which the projected
 * portfolio value reaches or exceeds the (inflation-adjusted) FIRE number
 * for that year.
 *
 * Assumption labels (surfaced in the UI, never hidden):
 * - contributions grow yearly with `incomeGrowth`
 * - annual expenses (and therefore the FIRE number) grow yearly with `inflation`
 * - returns compound monthly at a flat `expectedReturn`
 */
export function projectFire(profile: FIREProfile, currentValue: number): FireProjectionResult {
  // Bound the simulation horizon: compounding a growing contribution for a
  // full 50+ year lifespan produces numbers so large they flatten the
  // interesting part of the chart (the accumulation years). Projecting ~35
  // years out is more than enough to find the FIRE crossing point for any
  // realistic input.
  const horizonAge = Math.min(profile.lifeExpectancy, Math.max(profile.targetAge + 1, profile.currentAge + 35));
  const totalYears = horizonAge - profile.currentAge;

  const fireNumberToday = calcFireCorpus(profile.annualExpenses, profile.withdrawalRate);
  const currentFirePercent = fireNumberToday > 0 ? Math.min(100, (currentValue / fireNumberToday) * 100) : 0;

  const points: FireProjectionPoint[] = [];
  let value = currentValue;
  let contribution = profile.monthlyInvestment;
  let fireAge: number | null = null;
  const thisYear = new Date().getFullYear();

  points.push({
    age: profile.currentAge,
    year: thisYear,
    projectedValue: value,
    fireNumber: fireNumberToday,
  });

  for (let y = 1; y <= totalYears; y++) {
    const monthlyRate = profile.expectedReturn / 100 / 12;
    for (let m = 0; m < 12; m++) {
      value = value * (1 + monthlyRate) + contribution;
    }
    contribution = contribution * (1 + profile.incomeGrowth / 100);

    const age = profile.currentAge + y;
    const futureExpenses = calcFutureExpenses(profile.annualExpenses, profile.inflation, y);
    const fireNumberThatYear = calcFireCorpus(futureExpenses, profile.withdrawalRate);

    if (fireAge === null && value >= fireNumberThatYear) {
      fireAge = age;
    }

    points.push({ age, year: thisYear + y, projectedValue: value, fireNumber: fireNumberThatYear });
  }

  const yearsRemaining = fireAge !== null ? fireAge - profile.currentAge : null;

  // Required monthly investment to hit the target retirement age exactly,
  // solved by binary search over the same monthly-compounding model.
  const yearsToTarget = profile.targetAge - profile.currentAge;
  const futureExpensesAtTarget = calcFutureExpenses(profile.annualExpenses, profile.inflation, yearsToTarget);
  const fireNumberAtTarget = calcFireCorpus(futureExpensesAtTarget, profile.withdrawalRate);

  let lo = 0;
  let hi = Math.max(profile.monthlyInvestment * 5, 500000);
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const fv = calcFuturePortfolioValue({
      currentValue,
      monthlyContribution: mid,
      annualReturnPct: profile.expectedReturn,
      years: Math.max(yearsToTarget, 0.1),
      contributionGrowthPct: profile.incomeGrowth,
    });
    if (fv < fireNumberAtTarget) lo = mid;
    else hi = mid;
  }
  const requiredMonthlyInvestment = Math.round(hi);

  // For display, truncate the chart to a bit past the FIRE crossing (or the
  // target age, if not on track) rather than the full simulation horizon —
  // keeps the accumulation years readable instead of compressed against a
  // multi-decade tail.
  const displayCapAge = (fireAge ?? profile.targetAge) + 10;
  const displayPoints = points.filter((p) => p.age <= displayCapAge);

  return {
    points: displayPoints.length >= 2 ? displayPoints : points,
    fireNumberToday,
    fireAge,
    yearsRemaining,
    currentFirePercent,
    requiredMonthlyInvestment,
  };
}

// ---------- Financial health score ----------

export interface FinancialHealthBreakdown {
  savingsRate: number;
  investmentRate: number;
  emergencyFund: number;
  debt: number;
  diversification: number;
}

export interface FinancialHealthResult {
  score: number;
  breakdown: FinancialHealthBreakdown;
  weakestFactor: keyof FinancialHealthBreakdown;
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Deterministic 0–100 score. Each factor is scored against a stated,
 * configurable benchmark rather than a hidden magic number:
 * - Savings rate: 0% → 0, 40%+ → 100
 * - Investment rate: 0% → 0, 30%+ → 100
 * - Emergency fund: months of expenses held in cash, 0 → 0, 6mo+ → 100
 * - Debt: liabilities as % of assets, 0% → 100, 80%+ → 0
 * - Diversification: 1 asset class → low score, 5+ well-spread classes → 100
 */
export function calcFinancialHealth(params: {
  savingsRatePct: number;
  investmentRatePct: number;
  emergencyFundMonths: number;
  debtToAssetPct: number;
  assetClassCount: number;
}): FinancialHealthResult {
  const savingsRate = clampScore((params.savingsRatePct / 40) * 100);
  const investmentRate = clampScore((params.investmentRatePct / 30) * 100);
  const emergencyFund = clampScore((params.emergencyFundMonths / 6) * 100);
  const debt = clampScore(100 - (params.debtToAssetPct / 80) * 100);
  const diversification = clampScore((params.assetClassCount / 5) * 100);

  const breakdown: FinancialHealthBreakdown = {
    savingsRate,
    investmentRate,
    emergencyFund,
    debt,
    diversification,
  };

  const weights: Record<keyof FinancialHealthBreakdown, number> = {
    savingsRate: 0.25,
    investmentRate: 0.25,
    emergencyFund: 0.2,
    debt: 0.15,
    diversification: 0.15,
  };

  const score = clampScore(
    Object.entries(breakdown).reduce(
      (sum, [key, value]) => sum + value * weights[key as keyof FinancialHealthBreakdown],
      0
    )
  );

  const weakestFactor = (Object.keys(breakdown) as (keyof FinancialHealthBreakdown)[]).reduce((a, b) =>
    breakdown[a] <= breakdown[b] ? a : b
  );

  return { score, breakdown, weakestFactor };
}

// ---------- Goals ----------

export function calcGoalProgress(currentAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  return Math.min(100, (currentAmount / targetAmount) * 100);
}

/** Monthly contribution required to hit `targetAmount` by `targetDate` from today. */
export function calcRequiredMonthlyContribution(
  currentAmount: number,
  targetAmount: number,
  targetDate: string,
  annualReturnPct = 0
): number {
  const months = Math.max(
    1,
    Math.round((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30.44))
  );
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return 0;

  if (annualReturnPct <= 0) return remaining / months;

  const monthlyRate = annualReturnPct / 100 / 12;
  const futureValueOfCurrent = currentAmount * Math.pow(1 + monthlyRate, months);
  const remainingAfterGrowth = targetAmount - futureValueOfCurrent;
  if (remainingAfterGrowth <= 0) return 0;

  const annuityFactor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  return remainingAfterGrowth / annuityFactor;
}

// ---------- Formatting ----------

export function formatINR(value: number, opts: { compact?: boolean; showSign?: boolean } = {}): string {
  const { compact = false, showSign = false } = opts;
  const sign = showSign && value > 0 ? "+" : "";

  if (compact) {
    const abs = Math.abs(value);
    if (abs >= 1_00_00_000) return `${sign}${value < 0 ? "-" : ""}₹${(abs / 1_00_00_000).toFixed(2)}Cr`;
    if (abs >= 1_00_000) return `${sign}${value < 0 ? "-" : ""}₹${(abs / 1_00_000).toFixed(2)}L`;
    if (abs >= 1_000) return `${sign}${value < 0 ? "-" : ""}₹${(abs / 1_000).toFixed(1)}k`;
  }

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.abs(value));

  return `${sign}${value < 0 ? "-" : ""}${formatted}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? "" : "-"}${Math.abs(value).toFixed(decimals)}%`;
}
