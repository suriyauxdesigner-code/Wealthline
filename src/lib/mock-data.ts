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
  Transaction,
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

export const categories: Category[] = [
  { id: "cat_housing", name: "Housing", kind: "expense", icon: "Home", color: "chart-1" },
  { id: "cat_food", name: "Food", kind: "expense", icon: "UtensilsCrossed", color: "chart-2" },
  { id: "cat_transport", name: "Transport", kind: "expense", icon: "Car", color: "chart-3" },
  { id: "cat_shopping", name: "Shopping", kind: "expense", icon: "ShoppingBag", color: "chart-4" },
  { id: "cat_entertainment", name: "Entertainment", kind: "expense", icon: "Clapperboard", color: "chart-5" },
  { id: "cat_travel", name: "Travel", kind: "expense", icon: "Plane", color: "chart-6" },
  { id: "cat_bills", name: "Bills", kind: "expense", icon: "Receipt", color: "chart-7" },
  { id: "cat_healthcare", name: "Healthcare", kind: "expense", icon: "HeartPulse", color: "chart-8" },
  { id: "cat_other", name: "Other", kind: "expense", icon: "MoreHorizontal", color: "chart-9" },
  { id: "cat_salary", name: "Salary", kind: "income", icon: "Wallet", color: "chart-1" },
  { id: "cat_freelance", name: "Freelance", kind: "income", icon: "Briefcase", color: "chart-2" },
  { id: "cat_transfer", name: "Transfer", kind: "transfer", icon: "ArrowLeftRight", color: "chart-6" },
  { id: "cat_investment", name: "Investment", kind: "investment", icon: "TrendingUp", color: "chart-4" },
];

export function getCategory(id: string): Category {
  return categories.find((c) => c.id === id) ?? categories[categories.length - 1];
}

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

export function getAccount(id: string): Account | undefined {
  return accounts.find((a) => a.id === id);
}

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
  { id: "bud_housing", categoryId: "cat_housing", month: "2026-08", limit: 24000 },
  { id: "bud_food", categoryId: "cat_food", month: "2026-08", limit: 7000 },
  { id: "bud_transport", categoryId: "cat_transport", month: "2026-08", limit: 3500 },
  { id: "bud_shopping", categoryId: "cat_shopping", month: "2026-08", limit: 6000 },
  { id: "bud_entertainment", categoryId: "cat_entertainment", month: "2026-08", limit: 2000 },
  { id: "bud_travel", categoryId: "cat_travel", month: "2026-08", limit: 5000 },
  { id: "bud_bills", categoryId: "cat_bills", month: "2026-08", limit: 5500 },
  { id: "bud_healthcare", categoryId: "cat_healthcare", month: "2026-08", limit: 2000 },
  { id: "bud_other", categoryId: "cat_other", month: "2026-08", limit: 1500 },
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
  { id: "rec_salary", label: "Salary", type: "income", amount: 80000, categoryId: "cat_salary", accountId: "acc_hdfc_savings", frequency: "monthly", startDate: "2023-06-28", nextDate: "2026-09-28", active: true },
  { id: "rec_rent", label: "Rent", type: "expense", amount: 22000, categoryId: "cat_housing", accountId: "acc_hdfc_savings", frequency: "monthly", startDate: "2023-06-03", nextDate: "2026-09-03", active: true },
  { id: "rec_netflix", label: "Netflix", type: "expense", amount: 649, categoryId: "cat_entertainment", accountId: "acc_hdfc_credit", frequency: "monthly", startDate: "2024-01-01", nextDate: "2026-09-01", active: true },
  { id: "rec_spotify", label: "Spotify", type: "expense", amount: 199, categoryId: "cat_entertainment", accountId: "acc_hdfc_credit", frequency: "monthly", startDate: "2024-01-01", nextDate: "2026-09-01", active: true },
  { id: "rec_gym", label: "Gym Membership", type: "expense", amount: 1500, categoryId: "cat_healthcare", accountId: "acc_hdfc_credit", frequency: "monthly", startDate: "2024-03-01", nextDate: "2026-09-01", active: true },
  { id: "rec_broadband", label: "ACT Fiber Broadband", type: "expense", amount: 999, categoryId: "cat_bills", accountId: "acc_hdfc_savings", frequency: "monthly", startDate: "2023-07-05", nextDate: "2026-09-05", active: true },
  { id: "rec_mobile", label: "Jio Postpaid", type: "expense", amount: 599, categoryId: "cat_bills", accountId: "acc_hdfc_savings", frequency: "monthly", startDate: "2023-07-05", nextDate: "2026-09-05", active: true },
  { id: "rec_sip_ppfc", label: "SIP — Parag Parikh Flexi Cap", type: "investment", amount: 8000, categoryId: "cat_investment", accountId: "acc_hdfc_savings", toAccountId: "acc_groww", frequency: "monthly", startDate: "2023-09-10", nextDate: "2026-09-10", active: true },
  { id: "rec_sip_mirae", label: "SIP — Mirae Large & Midcap", type: "investment", amount: 6000, categoryId: "cat_investment", accountId: "acc_hdfc_savings", toAccountId: "acc_groww", frequency: "monthly", startDate: "2023-09-10", nextDate: "2026-09-10", active: true },
  { id: "rec_sip_nifty", label: "SIP — Nifty 50 ETF", type: "investment", amount: 4000, categoryId: "cat_investment", accountId: "acc_hdfc_savings", toAccountId: "acc_zerodha", frequency: "monthly", startDate: "2024-01-10", nextDate: "2026-09-10", active: true },
  { id: "rec_emi_vehicle", label: "Vehicle Loan EMI", type: "expense", amount: 4200, categoryId: "cat_other", accountId: "acc_hdfc_savings", frequency: "monthly", startDate: "2024-02-05", nextDate: "2026-09-05", active: true },
];

// ---------- Transactions (Jun–Aug 2026) ----------
// id convention: t_<yymm>_<seq>
// These three months are hand-authored in full detail (they're what
// Overview/Transactions/Budget show). Earlier months are filled in by a
// small deterministic generator below, just enough to give the 12-month
// trend charts on Reports continuous, non-zero history.

const handAuthoredTransactions: Transaction[] = [
  // ---- June 2026 ----
  { id: "t_2606_01", type: "income", amount: 78000, merchant: "Salary", categoryId: "cat_salary", accountId: "acc_hdfc_savings", date: "2026-06-28" },
  { id: "t_2606_02", type: "expense", amount: 22000, merchant: "Landlord — Rent", categoryId: "cat_housing", accountId: "acc_hdfc_savings", date: "2026-06-03" },
  { id: "t_2606_03", type: "expense", amount: 280, merchant: "Swiggy", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-06-06" },
  { id: "t_2606_04", type: "expense", amount: 400, merchant: "Zomato", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-06-11" },
  { id: "t_2606_05", type: "expense", amount: 950, merchant: "Blinkit", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-06-15" },
  { id: "t_2606_06", type: "expense", amount: 1750, merchant: "BigBasket", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-06-21" },
  { id: "t_2606_07", type: "expense", amount: 220, merchant: "Swiggy", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-06-25" },
  { id: "t_2606_08", type: "expense", amount: 190, merchant: "Uber", categoryId: "cat_transport", accountId: "acc_hdfc_credit", date: "2026-06-09" },
  { id: "t_2606_09", type: "expense", amount: 1650, merchant: "Indian Oil Petrol Pump", categoryId: "cat_transport", accountId: "acc_hdfc_credit", date: "2026-06-13" },
  { id: "t_2606_10", type: "expense", amount: 400, merchant: "BMTC Metro Card", categoryId: "cat_transport", accountId: "acc_hdfc_savings", date: "2026-06-02" },
  { id: "t_2606_11", type: "expense", amount: 1450, merchant: "Amazon", categoryId: "cat_shopping", accountId: "acc_hdfc_credit", date: "2026-06-19" },
  { id: "t_2606_12", type: "expense", amount: 2800, merchant: "Croma", categoryId: "cat_shopping", accountId: "acc_hdfc_credit", date: "2026-06-27" },
  { id: "t_2606_13", type: "expense", amount: 649, merchant: "Netflix", categoryId: "cat_entertainment", accountId: "acc_hdfc_credit", date: "2026-06-01" },
  { id: "t_2606_14", type: "expense", amount: 199, merchant: "Spotify", categoryId: "cat_entertainment", accountId: "acc_hdfc_credit", date: "2026-06-01" },
  { id: "t_2606_15", type: "expense", amount: 1750, merchant: "BESCOM Electricity", categoryId: "cat_bills", accountId: "acc_hdfc_savings", date: "2026-06-07" },
  { id: "t_2606_16", type: "expense", amount: 599, merchant: "Jio Postpaid", categoryId: "cat_bills", accountId: "acc_hdfc_savings", date: "2026-06-05" },
  { id: "t_2606_17", type: "expense", amount: 999, merchant: "ACT Fiber Broadband", categoryId: "cat_bills", accountId: "acc_hdfc_savings", date: "2026-06-05" },
  { id: "t_2606_18", type: "expense", amount: 1500, merchant: "Cult Fit Gym", categoryId: "cat_bills", accountId: "acc_hdfc_credit", date: "2026-06-01" },
  { id: "t_2606_19", type: "expense", amount: 600, merchant: "Apollo Clinic", categoryId: "cat_healthcare", accountId: "acc_hdfc_savings", date: "2026-06-17" },
  { id: "t_2606_20", type: "expense", amount: 150, merchant: "ATM Withdrawal Fee", categoryId: "cat_other", accountId: "acc_hdfc_savings", date: "2026-06-10" },
  { id: "t_2606_21", type: "investment", amount: 8000, merchant: "SIP — Parag Parikh Flexi Cap", categoryId: "cat_investment", accountId: "acc_hdfc_savings", toAccountId: "acc_groww", date: "2026-06-10" },
  { id: "t_2606_22", type: "investment", amount: 6000, merchant: "SIP — Mirae Large & Midcap", categoryId: "cat_investment", accountId: "acc_hdfc_savings", toAccountId: "acc_groww", date: "2026-06-10" },
  { id: "t_2606_23", type: "investment", amount: 4000, merchant: "SIP — Nifty 50 ETF", categoryId: "cat_investment", accountId: "acc_hdfc_savings", toAccountId: "acc_zerodha", date: "2026-06-10" },
  { id: "t_2606_24", type: "transfer", amount: 4200, merchant: "Vehicle Loan EMI", categoryId: "cat_other", accountId: "acc_hdfc_savings", date: "2026-06-05" },

  // ---- July 2026 ----
  { id: "t_2607_01", type: "income", amount: 78000, merchant: "Salary", categoryId: "cat_salary", accountId: "acc_hdfc_savings", date: "2026-07-28" },
  { id: "t_2607_02", type: "income", amount: 15000, merchant: "Freelance — UI consulting", categoryId: "cat_freelance", accountId: "acc_icici_current", date: "2026-07-18" },
  { id: "t_2607_03", type: "expense", amount: 22000, merchant: "Landlord — Rent", categoryId: "cat_housing", accountId: "acc_hdfc_savings", date: "2026-07-03" },
  { id: "t_2607_04", type: "expense", amount: 300, merchant: "Swiggy", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-07-05" },
  { id: "t_2607_05", type: "expense", amount: 450, merchant: "Zomato", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-07-10" },
  { id: "t_2607_06", type: "expense", amount: 1100, merchant: "Blinkit", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-07-14" },
  { id: "t_2607_07", type: "expense", amount: 1900, merchant: "BigBasket", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-07-20" },
  { id: "t_2607_08", type: "expense", amount: 260, merchant: "Swiggy", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-07-24" },
  { id: "t_2607_09", type: "expense", amount: 700, merchant: "Truffles Restaurant", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-07-27" },
  { id: "t_2607_10", type: "expense", amount: 210, merchant: "Uber", categoryId: "cat_transport", accountId: "acc_hdfc_credit", date: "2026-07-08" },
  { id: "t_2607_11", type: "expense", amount: 1700, merchant: "Indian Oil Petrol Pump", categoryId: "cat_transport", accountId: "acc_hdfc_credit", date: "2026-07-12" },
  { id: "t_2607_12", type: "expense", amount: 150, merchant: "Ola", categoryId: "cat_transport", accountId: "acc_hdfc_credit", date: "2026-07-22" },
  { id: "t_2607_13", type: "expense", amount: 1800, merchant: "Myntra", categoryId: "cat_shopping", accountId: "acc_hdfc_credit", date: "2026-07-16" },
  { id: "t_2607_14", type: "expense", amount: 650, merchant: "Amazon", categoryId: "cat_shopping", accountId: "acc_hdfc_credit", date: "2026-07-25" },
  { id: "t_2607_15", type: "expense", amount: 649, merchant: "Netflix", categoryId: "cat_entertainment", accountId: "acc_hdfc_credit", date: "2026-07-01" },
  { id: "t_2607_16", type: "expense", amount: 199, merchant: "Spotify", categoryId: "cat_entertainment", accountId: "acc_hdfc_credit", date: "2026-07-01" },
  { id: "t_2607_17", type: "expense", amount: 500, merchant: "BookMyShow", categoryId: "cat_entertainment", accountId: "acc_hdfc_credit", date: "2026-07-19" },
  { id: "t_2607_18", type: "expense", amount: 2200, merchant: "MakeMyTrip — Weekend Bus", categoryId: "cat_travel", accountId: "acc_hdfc_credit", date: "2026-07-30" },
  { id: "t_2607_19", type: "expense", amount: 1900, merchant: "BESCOM Electricity", categoryId: "cat_bills", accountId: "acc_hdfc_savings", date: "2026-07-07" },
  { id: "t_2607_20", type: "expense", amount: 599, merchant: "Jio Postpaid", categoryId: "cat_bills", accountId: "acc_hdfc_savings", date: "2026-07-05" },
  { id: "t_2607_21", type: "expense", amount: 999, merchant: "ACT Fiber Broadband", categoryId: "cat_bills", accountId: "acc_hdfc_savings", date: "2026-07-05" },
  { id: "t_2607_22", type: "expense", amount: 1500, merchant: "Cult Fit Gym", categoryId: "cat_bills", accountId: "acc_hdfc_credit", date: "2026-07-01" },
  { id: "t_2607_23", type: "expense", amount: 350, merchant: "Apollo Pharmacy", categoryId: "cat_healthcare", accountId: "acc_hdfc_savings", date: "2026-07-21" },
  { id: "t_2607_24", type: "expense", amount: 500, merchant: "Gift — Birthday", categoryId: "cat_other", accountId: "acc_hdfc_savings", date: "2026-07-13" },
  { id: "t_2607_25", type: "investment", amount: 8000, merchant: "SIP — Parag Parikh Flexi Cap", categoryId: "cat_investment", accountId: "acc_hdfc_savings", toAccountId: "acc_groww", date: "2026-07-10" },
  { id: "t_2607_26", type: "investment", amount: 6000, merchant: "SIP — Mirae Large & Midcap", categoryId: "cat_investment", accountId: "acc_hdfc_savings", toAccountId: "acc_groww", date: "2026-07-10" },
  { id: "t_2607_27", type: "investment", amount: 4000, merchant: "SIP — Nifty 50 ETF", categoryId: "cat_investment", accountId: "acc_hdfc_savings", toAccountId: "acc_zerodha", date: "2026-07-10" },
  { id: "t_2607_28", type: "transfer", amount: 12600, merchant: "Credit Card Bill Payment", categoryId: "cat_transfer", accountId: "acc_hdfc_savings", toAccountId: "acc_hdfc_credit", date: "2026-07-04" },
  { id: "t_2607_29", type: "transfer", amount: 4200, merchant: "Vehicle Loan EMI", categoryId: "cat_other", accountId: "acc_hdfc_savings", date: "2026-07-05" },

  // ---- August 2026 (current month) ----
  { id: "t_2608_01", type: "income", amount: 80000, merchant: "Salary", categoryId: "cat_salary", accountId: "acc_hdfc_savings", date: "2026-08-28" },
  { id: "t_2608_02", type: "expense", amount: 22000, merchant: "Landlord — Rent", categoryId: "cat_housing", accountId: "acc_hdfc_savings", date: "2026-08-03" },
  { id: "t_2608_03", type: "expense", amount: 340, merchant: "Swiggy", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-08-05" },
  { id: "t_2608_04", type: "expense", amount: 610, merchant: "Zomato", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-08-09" },
  { id: "t_2608_05", type: "expense", amount: 2150, merchant: "BigBasket", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-08-12" },
  { id: "t_2608_06", type: "expense", amount: 1450, merchant: "Truffles Restaurant", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-08-15" },
  { id: "t_2608_07", type: "expense", amount: 380, merchant: "Swiggy", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-08-18" },
  { id: "t_2608_08", type: "expense", amount: 1240, merchant: "Blinkit", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-08-20" },
  { id: "t_2608_09", type: "expense", amount: 350, merchant: "Chai Point", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-08-22" },
  { id: "t_2608_10", type: "expense", amount: 560, merchant: "Zomato", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-08-24" },
  { id: "t_2608_11", type: "expense", amount: 980, merchant: "Blinkit", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-08-27" },
  { id: "t_2608_12", type: "expense", amount: 420, merchant: "Swiggy", categoryId: "cat_food", accountId: "acc_hdfc_credit", date: "2026-08-30" },
  { id: "t_2608_13", type: "expense", amount: 500, merchant: "BMTC Metro Card", categoryId: "cat_transport", accountId: "acc_hdfc_savings", date: "2026-08-06" },
  { id: "t_2608_14", type: "expense", amount: 1800, merchant: "Indian Oil Petrol Pump", categoryId: "cat_transport", accountId: "acc_hdfc_credit", date: "2026-08-10" },
  { id: "t_2608_15", type: "expense", amount: 180, merchant: "Ola", categoryId: "cat_transport", accountId: "acc_hdfc_credit", date: "2026-08-14" },
  { id: "t_2608_16", type: "expense", amount: 320, merchant: "Uber", categoryId: "cat_transport", accountId: "acc_hdfc_credit", date: "2026-08-22" },
  { id: "t_2608_17", type: "expense", amount: 240, merchant: "Uber", categoryId: "cat_transport", accountId: "acc_hdfc_credit", date: "2026-08-28" },
  { id: "t_2608_18", type: "expense", amount: 3200, merchant: "Croma", categoryId: "cat_shopping", accountId: "acc_hdfc_credit", date: "2026-08-08" },
  { id: "t_2608_19", type: "expense", amount: 2450, merchant: "Myntra", categoryId: "cat_shopping", accountId: "acc_hdfc_credit", date: "2026-08-16" },
  { id: "t_2608_20", type: "expense", amount: 890, merchant: "Amazon", categoryId: "cat_shopping", accountId: "acc_hdfc_credit", date: "2026-08-20" },
  { id: "t_2608_21", type: "expense", amount: 1299, merchant: "Amazon", categoryId: "cat_shopping", accountId: "acc_hdfc_credit", date: "2026-08-29" },
  { id: "t_2608_22", type: "expense", amount: 649, merchant: "Netflix", categoryId: "cat_entertainment", accountId: "acc_hdfc_credit", date: "2026-08-01" },
  { id: "t_2608_23", type: "expense", amount: 199, merchant: "Spotify", categoryId: "cat_entertainment", accountId: "acc_hdfc_credit", date: "2026-08-01" },
  { id: "t_2608_24", type: "expense", amount: 700, merchant: "BookMyShow", categoryId: "cat_entertainment", accountId: "acc_hdfc_credit", date: "2026-08-13" },
  { id: "t_2608_25", type: "expense", amount: 2100, merchant: "BESCOM Electricity", categoryId: "cat_bills", accountId: "acc_hdfc_savings", date: "2026-08-07" },
  { id: "t_2608_26", type: "expense", amount: 599, merchant: "Jio Postpaid", categoryId: "cat_bills", accountId: "acc_hdfc_savings", date: "2026-08-05" },
  { id: "t_2608_27", type: "expense", amount: 999, merchant: "ACT Fiber Broadband", categoryId: "cat_bills", accountId: "acc_hdfc_savings", date: "2026-08-05" },
  { id: "t_2608_28", type: "expense", amount: 1500, merchant: "Cult Fit Gym", categoryId: "cat_bills", accountId: "acc_hdfc_credit", date: "2026-08-01" },
  { id: "t_2608_29", type: "expense", amount: 480, merchant: "Apollo Pharmacy", categoryId: "cat_healthcare", accountId: "acc_hdfc_savings", date: "2026-08-11" },
  { id: "t_2608_30", type: "expense", amount: 800, merchant: "Apollo Clinic — Consult", categoryId: "cat_healthcare", accountId: "acc_hdfc_savings", date: "2026-08-19" },
  { id: "t_2608_31", type: "expense", amount: 300, merchant: "ATM Withdrawal Fee", categoryId: "cat_other", accountId: "acc_hdfc_savings", date: "2026-08-06" },
  { id: "t_2608_32", type: "expense", amount: 1000, merchant: "Gift — Birthday", categoryId: "cat_other", accountId: "acc_hdfc_savings", date: "2026-08-23" },
  { id: "t_2608_33", type: "investment", amount: 8000, merchant: "SIP — Parag Parikh Flexi Cap", categoryId: "cat_investment", accountId: "acc_hdfc_savings", toAccountId: "acc_groww", date: "2026-08-10" },
  { id: "t_2608_34", type: "investment", amount: 6000, merchant: "SIP — Mirae Large & Midcap", categoryId: "cat_investment", accountId: "acc_hdfc_savings", toAccountId: "acc_groww", date: "2026-08-10" },
  { id: "t_2608_35", type: "investment", amount: 4000, merchant: "SIP — Nifty 50 ETF", categoryId: "cat_investment", accountId: "acc_hdfc_savings", toAccountId: "acc_zerodha", date: "2026-08-10" },
  { id: "t_2608_36", type: "investment", amount: 2000, merchant: "Gold SIP", categoryId: "cat_investment", accountId: "acc_hdfc_savings", toAccountId: "acc_gold", date: "2026-08-10" },
  { id: "t_2608_37", type: "transfer", amount: 14200, merchant: "Credit Card Bill Payment", categoryId: "cat_transfer", accountId: "acc_hdfc_savings", toAccountId: "acc_hdfc_credit", date: "2026-08-04" },
  { id: "t_2608_38", type: "transfer", amount: 4200, merchant: "Vehicle Loan EMI", categoryId: "cat_other", accountId: "acc_hdfc_savings", date: "2026-08-05" },
];

// Deterministic filler for Sep 2025 – May 2026 (9 months) so the 12-month
// trend charts on Reports have continuous history before the three
// hand-authored months above. Values step smoothly toward June 2026's
// actuals — nothing here is random, so the app renders identically on
// every load.
function generateHistoricalTransactions(): Transaction[] {
  const months = [
    { key: "2025-09", days: 30 },
    { key: "2025-10", days: 31 },
    { key: "2025-11", days: 30 },
    { key: "2025-12", days: 31 },
    { key: "2026-01", days: 31 },
    { key: "2026-02", days: 28 },
    { key: "2026-03", days: 31 },
    { key: "2026-04", days: 30 },
    { key: "2026-05", days: 31 },
  ];
  const out: Transaction[] = [];

  months.forEach((m, i) => {
    const t = i / (months.length - 1); // 0 -> 1 across the range
    const pad = (n: number) => String(n).padStart(2, "0");
    const salary = Math.round(68000 + t * (78000 - 68000));
    const food = Math.round(3000 + t * 1200);
    const transport = Math.round(1700 + t * 500);
    const shopping = Math.round(1400 + t * 1400);
    const electricity = Math.round(1600 + t * 300);
    const healthcare = Math.round(300 + t * 300);
    const other = Math.round(150 + t * 300);

    const push = (seq: number, tx: Omit<Transaction, "id" | "date"> & { day: number }) => {
      const { day, ...rest } = tx;
      out.push({ ...rest, id: `t_gen_${m.key.replace("-", "")}_${seq}`, date: `${m.key}-${pad(Math.min(day, m.days))}` });
    };

    push(1, { type: "income", amount: salary, merchant: "Salary", categoryId: "cat_salary", accountId: "acc_hdfc_savings", day: 28 });
    push(2, { type: "expense", amount: 22000, merchant: "Landlord — Rent", categoryId: "cat_housing", accountId: "acc_hdfc_savings", day: 3 });
    push(3, { type: "expense", amount: Math.round(food * 0.4), merchant: "Swiggy", categoryId: "cat_food", accountId: "acc_hdfc_credit", day: 8 });
    push(4, { type: "expense", amount: Math.round(food * 0.35), merchant: "Zomato", categoryId: "cat_food", accountId: "acc_hdfc_credit", day: 16 });
    push(5, { type: "expense", amount: Math.round(food * 0.25), merchant: "Blinkit", categoryId: "cat_food", accountId: "acc_hdfc_credit", day: 22 });
    push(6, { type: "expense", amount: Math.round(transport * 0.6), merchant: "Indian Oil Petrol Pump", categoryId: "cat_transport", accountId: "acc_hdfc_credit", day: 12 });
    push(7, { type: "expense", amount: Math.round(transport * 0.4), merchant: "Uber", categoryId: "cat_transport", accountId: "acc_hdfc_credit", day: 20 });
    push(8, { type: "expense", amount: shopping, merchant: "Amazon", categoryId: "cat_shopping", accountId: "acc_hdfc_credit", day: 18 });
    push(9, { type: "expense", amount: 649, merchant: "Netflix", categoryId: "cat_entertainment", accountId: "acc_hdfc_credit", day: 1 });
    push(10, { type: "expense", amount: 199, merchant: "Spotify", categoryId: "cat_entertainment", accountId: "acc_hdfc_credit", day: 1 });
    push(11, { type: "expense", amount: electricity, merchant: "BESCOM Electricity", categoryId: "cat_bills", accountId: "acc_hdfc_savings", day: 7 });
    push(12, { type: "expense", amount: 599, merchant: "Jio Postpaid", categoryId: "cat_bills", accountId: "acc_hdfc_savings", day: 5 });
    push(13, { type: "expense", amount: 999, merchant: "ACT Fiber Broadband", categoryId: "cat_bills", accountId: "acc_hdfc_savings", day: 5 });
    push(14, { type: "expense", amount: 1500, merchant: "Cult Fit Gym", categoryId: "cat_bills", accountId: "acc_hdfc_credit", day: 1 });
    push(15, { type: "expense", amount: healthcare, merchant: "Apollo Pharmacy", categoryId: "cat_healthcare", accountId: "acc_hdfc_savings", day: 14 });
    push(16, { type: "expense", amount: other, merchant: "Miscellaneous", categoryId: "cat_other", accountId: "acc_hdfc_savings", day: 10 });
    push(17, { type: "investment", amount: 8000, merchant: "SIP — Parag Parikh Flexi Cap", categoryId: "cat_investment", accountId: "acc_hdfc_savings", toAccountId: "acc_groww", day: 10 });
    push(18, { type: "investment", amount: 6000, merchant: "SIP — Mirae Large & Midcap", categoryId: "cat_investment", accountId: "acc_hdfc_savings", toAccountId: "acc_groww", day: 10 });
    push(19, { type: "investment", amount: 4000, merchant: "SIP — Nifty 50 ETF", categoryId: "cat_investment", accountId: "acc_hdfc_savings", toAccountId: "acc_zerodha", day: 10 });
    push(20, { type: "transfer", amount: 4200, merchant: "Vehicle Loan EMI", categoryId: "cat_other", accountId: "acc_hdfc_savings", day: 5 });
    push(21, { type: "transfer", amount: 11000, merchant: "Credit Card Bill Payment", categoryId: "cat_transfer", accountId: "acc_hdfc_savings", toAccountId: "acc_hdfc_credit", day: 4 });
  });

  return out;
}

export const transactions: Transaction[] = [...generateHistoricalTransactions(), ...handAuthoredTransactions];

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
