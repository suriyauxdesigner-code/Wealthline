// Realistic seed data for the demo. Every figure is hand-set to tell one
// coherent story (a ~29 year old salaried professional in Bengaluru, 3 years
// into investing) rather than being random — so every screen's numbers
// reconcile with every other screen's.

import type {
  Account,
  Budget,
  Category,
  FIREProfile,
  Goal,
  Investment,
  Liability,
  NetWorthSnapshot,
  OtherAsset,
  PortfolioHistoryPoint,
  RecurringTransaction,
  UserProfile,
} from "./types";

export const user: UserProfile = {
  id: "u1",
  name: "Suriya",
  email: "suriya@mountain.studio",
  currency: "INR",
  country: "India",
};

// ---------- Categories ----------
// Fixed ids (not gen_random_uuid()) so they match the same rows
// supabase/seed/categories.sql inserts — budgets/recurring below reference
// these, and once Supabase is the source of truth for transactions, a real
// transaction's category_id must resolve against this same set for
// budget-vs-actual comparisons to work at all.

export const CATEGORY_IDS = {
  housing: "00000000-0000-4000-8000-000000000001",
  food: "00000000-0000-4000-8000-000000000002",
  transport: "00000000-0000-4000-8000-000000000003",
  shopping: "00000000-0000-4000-8000-000000000004",
  entertainment: "00000000-0000-4000-8000-000000000005",
  travel: "00000000-0000-4000-8000-000000000006",
  bills: "00000000-0000-4000-8000-000000000007",
  healthcare: "00000000-0000-4000-8000-000000000008",
  other: "00000000-0000-4000-8000-000000000009",
  salary: "00000000-0000-4000-8000-000000000010",
  freelance: "00000000-0000-4000-8000-000000000011",
  transfer: "00000000-0000-4000-8000-000000000012",
  investment: "00000000-0000-4000-8000-000000000013",
} as const;

export const categories: Category[] = [
  { id: CATEGORY_IDS.housing, name: "Housing", kind: "expense", icon: "Home", color: "chart-1" },
  { id: CATEGORY_IDS.food, name: "Food", kind: "expense", icon: "UtensilsCrossed", color: "chart-2" },
  { id: CATEGORY_IDS.transport, name: "Transport", kind: "expense", icon: "Car", color: "chart-3" },
  { id: CATEGORY_IDS.shopping, name: "Shopping", kind: "expense", icon: "ShoppingBag", color: "chart-4" },
  { id: CATEGORY_IDS.entertainment, name: "Entertainment", kind: "expense", icon: "Clapperboard", color: "chart-5" },
  { id: CATEGORY_IDS.travel, name: "Travel", kind: "expense", icon: "Plane", color: "chart-6" },
  { id: CATEGORY_IDS.bills, name: "Bills", kind: "expense", icon: "Receipt", color: "chart-7" },
  { id: CATEGORY_IDS.healthcare, name: "Healthcare", kind: "expense", icon: "HeartPulse", color: "chart-8" },
  { id: CATEGORY_IDS.other, name: "Other", kind: "expense", icon: "MoreHorizontal", color: "chart-9" },
  { id: CATEGORY_IDS.salary, name: "Salary", kind: "income", icon: "Wallet", color: "chart-1" },
  { id: CATEGORY_IDS.freelance, name: "Freelance", kind: "income", icon: "Briefcase", color: "chart-2" },
  { id: CATEGORY_IDS.transfer, name: "Transfer", kind: "transfer", icon: "ArrowLeftRight", color: "chart-6" },
  { id: CATEGORY_IDS.investment, name: "Investment", kind: "investment", icon: "TrendingUp", color: "chart-4" },
];

// ---------- Accounts ----------

export const accounts: Account[] = [
  { id: "acc_cash", name: "Cash Wallet", group: "cash", type: "cash_wallet", institution: "Cash", balance: 8000, currency: "INR" },
  { id: "acc_hdfc_savings", name: "HDFC Savings", group: "bank", type: "savings", institution: "HDFC Bank", balance: 145000, currency: "INR", last4: "4821" },
  { id: "acc_icici_current", name: "ICICI Salary Account", group: "bank", type: "current", institution: "ICICI Bank", balance: 35000, currency: "INR", last4: "2290" },
  { id: "acc_hdfc_credit", name: "HDFC Credit Card", group: "credit", type: "credit_card", institution: "HDFC Bank", balance: 16240, currency: "INR", last4: "7742", isLiabilityAccount: true },
  { id: "acc_zerodha", name: "Zerodha Brokerage", group: "investment", type: "brokerage", institution: "Zerodha", balance: 292150, currency: "INR" },
  { id: "acc_groww", name: "Groww Mutual Funds", group: "investment", type: "mutual_fund", institution: "Groww", balance: 207000, currency: "INR" },
  { id: "acc_gold", name: "Digital Gold", group: "investment", type: "gold", institution: "SafeGold", balance: 95900, currency: "INR" },
  { id: "acc_fd", name: "Fixed Deposit", group: "investment", type: "fd", institution: "SBI", balance: 106500, currency: "INR" },
  { id: "acc_epf", name: "EPF", group: "other", type: "epf", institution: "EPFO", balance: 320000, currency: "INR" },
  { id: "acc_ppf", name: "PPF", group: "other", type: "ppf", institution: "SBI", balance: 140000, currency: "INR" },
  { id: "acc_crypto", name: "Crypto (BTC)", group: "investment", type: "crypto", institution: "CoinDCX", balance: 87000, currency: "INR" },
];

export const otherAssets: OtherAsset[] = [
  { id: "oa_scooter", name: "Activa Scooter", category: "vehicle", value: 65000 },
];

export const liabilities: Liability[] = [
  {
    id: "lia_cc",
    name: "HDFC Credit Card",
    type: "credit_card",
    principal: 16240,
    outstanding: 16240,
    interestRate: 42,
    monthlyPayment: 16240,
    accountId: "acc_hdfc_credit",
  },
  {
    id: "lia_vehicle",
    name: "Vehicle Loan — Activa",
    type: "vehicle_loan",
    principal: 90000,
    outstanding: 42000,
    interestRate: 11,
    monthlyPayment: 4200,
  },
];

// ---------- Investments (holdings) ----------

export const investments: Investment[] = [
  { id: "inv_hdfcbank", accountId: "acc_zerodha", name: "HDFC Bank Ltd.", assetClass: "equity", quantity: 40, averageCost: 1450, currentPrice: 1690 },
  { id: "inv_infosys", accountId: "acc_zerodha", name: "Infosys Ltd.", assetClass: "equity", quantity: 25, averageCost: 1500, currentPrice: 1830 },
  { id: "inv_tatamotors", accountId: "acc_zerodha", name: "Tata Motors Ltd.", assetClass: "equity", quantity: 60, averageCost: 620, currentPrice: 780 },
  { id: "inv_nifty50etf", accountId: "acc_zerodha", name: "Nippon India Nifty 50 ETF", assetClass: "etf", quantity: 300, averageCost: 220, currentPrice: 265 },
  { id: "inv_bond", accountId: "acc_zerodha", name: "RBI Floating Rate Bond", assetClass: "bonds", quantity: 1, averageCost: 50000, currentPrice: 52500 },
  { id: "inv_ppfc", accountId: "acc_groww", name: "Parag Parikh Flexi Cap Fund", assetClass: "mutual_fund", quantity: 1200, averageCost: 68, currentPrice: 84 },
  { id: "inv_mirae", accountId: "acc_groww", name: "Mirae Asset Large & Midcap Fund", assetClass: "mutual_fund", quantity: 900, averageCost: 95, currentPrice: 118 },
  { id: "inv_gold", accountId: "acc_gold", name: "SafeGold Digital Gold", assetClass: "gold", quantity: 14, averageCost: 5450, currentPrice: 6850 },
  { id: "inv_fd", accountId: "acc_fd", name: "SBI Fixed Deposit", assetClass: "fd", quantity: 1, averageCost: 100000, currentPrice: 106500 },
  { id: "inv_epf", accountId: "acc_epf", name: "Employee Provident Fund", assetClass: "epf", quantity: 1, averageCost: 280000, currentPrice: 320000 },
  { id: "inv_ppf", accountId: "acc_ppf", name: "Public Provident Fund", assetClass: "ppf", quantity: 1, averageCost: 120000, currentPrice: 140000 },
  { id: "inv_btc", accountId: "acc_crypto", name: "Bitcoin", assetClass: "crypto", quantity: 0.015, averageCost: 4200000, currentPrice: 5800000 },
];

// ---------- Budgets (August 2026) ----------

export const budgets: Budget[] = [
  { id: "bud_housing", categoryId: CATEGORY_IDS.housing, month: "2026-08", limit: 24000 },
  { id: "bud_food", categoryId: CATEGORY_IDS.food, month: "2026-08", limit: 7000 },
  { id: "bud_transport", categoryId: CATEGORY_IDS.transport, month: "2026-08", limit: 3500 },
  { id: "bud_shopping", categoryId: CATEGORY_IDS.shopping, month: "2026-08", limit: 6000 },
  { id: "bud_entertainment", categoryId: CATEGORY_IDS.entertainment, month: "2026-08", limit: 2000 },
  { id: "bud_travel", categoryId: CATEGORY_IDS.travel, month: "2026-08", limit: 5000 },
  { id: "bud_bills", categoryId: CATEGORY_IDS.bills, month: "2026-08", limit: 5500 },
  { id: "bud_healthcare", categoryId: CATEGORY_IDS.healthcare, month: "2026-08", limit: 2000 },
  { id: "bud_other", categoryId: CATEGORY_IDS.other, month: "2026-08", limit: 1500 },
];

// ---------- Goals ----------

export const goals: Goal[] = [
  {
    id: "goal_emergency",
    name: "Emergency Fund",
    icon: "ShieldCheck",
    targetAmount: 400000,
    currentAmount: 240000,
    targetDate: "2027-03-01",
    monthlyContribution: 26700,
    color: "chart-1",
  },
  {
    id: "goal_travel",
    name: "Japan Trip",
    icon: "Plane",
    targetAmount: 250000,
    currentAmount: 90000,
    targetDate: "2027-06-01",
    monthlyContribution: 16000,
    color: "chart-5",
  },
  {
    id: "goal_car",
    name: "Car Upgrade",
    icon: "Car",
    targetAmount: 800000,
    currentAmount: 120000,
    targetDate: "2028-12-01",
    monthlyContribution: 14000,
    color: "chart-3",
  },
  {
    id: "goal_house",
    name: "House Down Payment",
    icon: "Home",
    targetAmount: 2500000,
    currentAmount: 350000,
    targetDate: "2031-01-01",
    monthlyContribution: 40000,
    color: "chart-4",
  },
];

// ---------- FIRE profile ----------

export const fireProfile: FIREProfile = {
  id: "fire_1",
  currentAge: 29,
  targetAge: 45,
  currentNetWorth: 1443310,
  annualExpenses: 520000,
  monthlyInvestment: 20000,
  expectedReturn: 11,
  inflation: 6,
  incomeGrowth: 8,
  withdrawalRate: 3.5,
  lifeExpectancy: 85,
};

// ---------- Recurring transactions ----------

export const recurringTransactions: RecurringTransaction[] = [
  { id: "rec_salary", label: "Salary", type: "income", amount: 80000, categoryId: CATEGORY_IDS.salary, accountId: "acc_hdfc_savings", frequency: "monthly", startDate: "2023-06-28", nextDate: "2026-09-28", active: true },
  { id: "rec_rent", label: "Rent", type: "expense", amount: 22000, categoryId: CATEGORY_IDS.housing, accountId: "acc_hdfc_savings", frequency: "monthly", startDate: "2023-06-03", nextDate: "2026-09-03", active: true },
  { id: "rec_netflix", label: "Netflix", type: "expense", amount: 649, categoryId: CATEGORY_IDS.entertainment, accountId: "acc_hdfc_credit", frequency: "monthly", startDate: "2024-01-01", nextDate: "2026-09-01", active: true },
  { id: "rec_spotify", label: "Spotify", type: "expense", amount: 199, categoryId: CATEGORY_IDS.entertainment, accountId: "acc_hdfc_credit", frequency: "monthly", startDate: "2024-01-01", nextDate: "2026-09-01", active: true },
  { id: "rec_gym", label: "Gym Membership", type: "expense", amount: 1500, categoryId: CATEGORY_IDS.healthcare, accountId: "acc_hdfc_credit", frequency: "monthly", startDate: "2024-03-01", nextDate: "2026-09-01", active: true },
  { id: "rec_broadband", label: "ACT Fiber Broadband", type: "expense", amount: 999, categoryId: CATEGORY_IDS.bills, accountId: "acc_hdfc_savings", frequency: "monthly", startDate: "2023-07-05", nextDate: "2026-09-05", active: true },
  { id: "rec_mobile", label: "Jio Postpaid", type: "expense", amount: 599, categoryId: CATEGORY_IDS.bills, accountId: "acc_hdfc_savings", frequency: "monthly", startDate: "2023-07-05", nextDate: "2026-09-05", active: true },
  { id: "rec_sip_ppfc", label: "SIP — Parag Parikh Flexi Cap", type: "investment", amount: 8000, categoryId: CATEGORY_IDS.investment, accountId: "acc_hdfc_savings", toAccountId: "acc_groww", frequency: "monthly", startDate: "2023-09-10", nextDate: "2026-09-10", active: true },
  { id: "rec_sip_mirae", label: "SIP — Mirae Large & Midcap", type: "investment", amount: 6000, categoryId: CATEGORY_IDS.investment, accountId: "acc_hdfc_savings", toAccountId: "acc_groww", frequency: "monthly", startDate: "2023-09-10", nextDate: "2026-09-10", active: true },
  { id: "rec_sip_nifty", label: "SIP — Nifty 50 ETF", type: "investment", amount: 4000, categoryId: CATEGORY_IDS.investment, accountId: "acc_hdfc_savings", toAccountId: "acc_zerodha", frequency: "monthly", startDate: "2024-01-10", nextDate: "2026-09-10", active: true },
  { id: "rec_emi_vehicle", label: "Vehicle Loan EMI", type: "expense", amount: 4200, categoryId: CATEGORY_IDS.other, accountId: "acc_hdfc_savings", frequency: "monthly", startDate: "2024-02-05", nextDate: "2026-09-05", active: true },
];

// ---------- Generated monthly history ----------
// Deterministic smooth-growth curves (no Math.random) so re-renders and
// server/client renders always agree.

function monthsBetween(count: number, endYear: number, endMonthIndex: number): string[] {
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(endYear, endMonthIndex - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

const HISTORY_MONTHS = 32; // Jan 2024 -> Aug 2026 inclusive
const monthKeys = monthsBetween(HISTORY_MONTHS, 2026, 7); // month index 7 = August

function waveFactor(i: number): number {
  // small deterministic ripple, bounded to +/-1.8%
  return 1 + 0.018 * Math.sin(i * 0.9);
}

function interpolateExponential(start: number, end: number, i: number, n: number): number {
  const t = i / (n - 1);
  return start * Math.pow(end / start, t);
}

const CURRENT_TOTAL_ASSETS = 188000 + 1248550 + 65000; // cash + investments + vehicle = 1,501,550
const CURRENT_TOTAL_LIABILITIES = 16240 + 42000; // 58,240
const START_ASSETS = 560000;
const START_LIABILITIES = 145000;

export const netWorthHistory: NetWorthSnapshot[] = monthKeys.map((date, i) => {
  const isLast = i === monthKeys.length - 1;
  const assets = isLast
    ? CURRENT_TOTAL_ASSETS
    : Math.round(interpolateExponential(START_ASSETS, CURRENT_TOTAL_ASSETS, i, HISTORY_MONTHS) * waveFactor(i));
  const liabilitiesRaw = isLast
    ? CURRENT_TOTAL_LIABILITIES
    : Math.round(interpolateExponential(START_LIABILITIES, CURRENT_TOTAL_LIABILITIES, i, HISTORY_MONTHS) * waveFactor(i + 3));
  return { date, assets, liabilities: Math.max(liabilitiesRaw, 0) };
});

const CURRENT_TOTAL_INVESTED = 1055100;
const CURRENT_TOTAL_VALUE = 1248550;
const START_INVESTED = 250000;
const START_VALUE = 260000;

export const portfolioHistory: PortfolioHistoryPoint[] = monthKeys.map((date, i) => {
  const isLast = i === monthKeys.length - 1;
  const invested = isLast
    ? CURRENT_TOTAL_INVESTED
    : Math.round(interpolateExponential(START_INVESTED, CURRENT_TOTAL_INVESTED, i, HISTORY_MONTHS));
  const value = isLast
    ? CURRENT_TOTAL_VALUE
    : Math.round(interpolateExponential(START_VALUE, CURRENT_TOTAL_VALUE, i, HISTORY_MONTHS) * waveFactor(i));
  return { date, invested, value };
});
