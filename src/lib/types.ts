// Core financial data model.
// Structured so it can later be persisted to Supabase/Postgres with minimal
// change — every entity has a stable `id`, and relations are expressed as
// foreign-key style string ids rather than nested objects.

export type Currency = "INR";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: Currency;
  country: string;
}

// ---------- Accounts ----------

export type AccountGroup = "cash" | "bank" | "credit" | "investment" | "other";

export type AccountType =
  | "cash_wallet"
  | "savings"
  | "current"
  | "credit_card"
  | "brokerage"
  | "mutual_fund"
  | "etf"
  | "epf"
  | "ppf"
  | "fd"
  | "gold"
  | "crypto";

export interface Account {
  id: string;
  name: string;
  group: AccountGroup;
  type: AccountType;
  institution: string;
  balance: number;
  currency: Currency;
  last4?: string;
  isLiabilityAccount?: boolean; // true for credit cards / loans surfaced as accounts
  color?: string;
}

// ---------- Categories ----------

export type CategoryKind = "expense" | "income" | "transfer" | "investment";

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
  icon: string; // lucide icon name, resolved in ui layer
  color: string; // token name, e.g. "chart-1"
}

// ---------- Transactions ----------

export type TransactionType = "expense" | "income" | "transfer" | "investment";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // always positive; sign/direction derived from `type`
  merchant: string;
  categoryId: string;
  accountId: string;
  toAccountId?: string; // for transfers / investment moves
  date: string; // ISO date
  notes?: string;
  tags?: string[];
  recurringId?: string;
  attachment?: string;
}

// ---------- Budgets ----------

export interface Budget {
  id: string;
  categoryId: string;
  month: string; // "2026-08"
  limit: number;
}

// ---------- Investments ----------

export type AssetClass =
  | "equity"
  | "etf"
  | "mutual_fund"
  | "gold"
  | "bonds"
  | "fd"
  | "epf"
  | "ppf"
  | "crypto";

export interface Investment {
  id: string;
  accountId: string;
  name: string;
  assetClass: AssetClass;
  quantity: number;
  averageCost: number;
  currentPrice: number;
}

export interface PortfolioHistoryPoint {
  date: string; // ISO date, monthly
  invested: number;
  value: number;
}

// ---------- Goals ----------

export interface Goal {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO date
  monthlyContribution: number;
  color: string;
}

// ---------- Other (non-account) assets ----------
// Property / vehicles aren't transactable accounts, but still count toward
// Net Worth's asset side.

export type OtherAssetCategory = "property" | "vehicle" | "other";

export interface OtherAsset {
  id: string;
  name: string;
  category: OtherAssetCategory;
  value: number;
}

// ---------- Liabilities ----------

export type LiabilityType =
  | "credit_card"
  | "personal_loan"
  | "vehicle_loan"
  | "home_loan"
  | "education_loan"
  | "other";

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  principal: number;
  outstanding: number;
  interestRate: number; // annual %
  monthlyPayment: number;
  accountId?: string;
}

// ---------- Recurring transactions ----------

export type RecurringFrequency = "weekly" | "monthly" | "quarterly" | "yearly";

export interface RecurringTransaction {
  id: string;
  label: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  nextDate: string;
  active: boolean;
}

// ---------- FIRE profile ----------

export interface FIREProfile {
  id: string;
  currentAge: number;
  targetAge: number;
  currentNetWorth: number;
  annualExpenses: number;
  monthlyInvestment: number;
  expectedReturn: number; // annual %, e.g. 11
  inflation: number; // annual %, e.g. 6
  incomeGrowth: number; // annual %, e.g. 8
  withdrawalRate: number; // %, e.g. 3.5
  lifeExpectancy: number;
}

// ---------- Net worth snapshots ----------

export interface NetWorthSnapshot {
  date: string; // ISO date, monthly
  assets: number;
  liabilities: number;
}

// ---------- Insights ----------

export type InsightSeverity = "positive" | "info" | "warning" | "action";

export interface Insight {
  id: string;
  severity: InsightSeverity;
  title: string;
  description: string;
}
