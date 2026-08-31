// Realistic seed data for the demo. Every figure is hand-set to tell one
// coherent story (a ~29 year old salaried professional in Bengaluru, 3 years
// into investing) rather than being random — so every screen's numbers
// reconcile with every other screen's.

import type { Category, RecurringTransaction, UserProfile } from "./types";

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
