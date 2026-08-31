"use client";

// Client-side app state. `accounts` and `transactions` are now Supabase-backed
// (see src/lib/repositories/) — every mutation below calls a repository
// function and updates local state from its result, so every existing
// caller (dialogs, pages) keeps working unchanged even though these actions
// are now async. Everything else here (budgets, goals, liabilities,
// otherAssets, recurring, fireProfile) is still seeded mock data pending a
// later migration phase.

import { create } from "zustand";
import { toast } from "sonner";

import {
  budgets as seedBudgets,
  fireProfile as seedFireProfile,
  goals as seedGoals,
  liabilities as seedLiabilities,
  otherAssets as seedOtherAssets,
  recurringTransactions as seedRecurring,
} from "./mock-data";
import * as accountsRepo from "./repositories/accounts";
import * as categoriesRepo from "./repositories/categories";
import * as transactionsRepo from "./repositories/transactions";
import type {
  Account,
  Budget,
  Category,
  FIREProfile,
  Goal,
  Liability,
  OtherAsset,
  RecurringTransaction,
  Transaction,
} from "./types";

let idCounter = 1000;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  liabilities: Liability[];
  otherAssets: OtherAsset[];
  recurring: RecurringTransaction[];
  fireProfile: FIREProfile;
  dataLoaded: boolean;

  init: () => Promise<void>;
  refresh: () => Promise<void>;

  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, patch: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteTransactions: (ids: string[]) => Promise<void>;

  addBudget: (b: Omit<Budget, "id">) => void;
  updateBudget: (id: string, patch: Partial<Budget>) => void;

  addAccount: (a: Omit<Account, "id">) => Promise<void>;
  updateAccount: (id: string, patch: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  updateFireProfile: (patch: Partial<FIREProfile>) => void;
}

let initPromise: Promise<void> | null = null;

export const useAppStore = create<AppState>((set) => ({
  accounts: [],
  transactions: [],
  categories: [],
  budgets: seedBudgets,
  goals: seedGoals,
  liabilities: seedLiabilities,
  otherAssets: seedOtherAssets,
  recurring: seedRecurring,
  fireProfile: seedFireProfile,
  dataLoaded: false,

  // Called once on mount (see StoreInitializer) — dedupes concurrent callers
  // (e.g. React StrictMode's double-invoke) behind a single in-flight promise.
  init: () => {
    if (!initPromise) {
      initPromise = (async () => {
        try {
          const [accounts, transactions, categories] = await Promise.all([
            accountsRepo.listAccounts(),
            transactionsRepo.listTransactions(),
            categoriesRepo.listCategories(),
          ]);
          set({ accounts, transactions, categories, dataLoaded: true });
        } catch (err) {
          toast.error(errorMessage(err, "Failed to load your data"));
        }
      })();
    }
    return initPromise;
  },

  // Unlike init(), always re-fetches — used on window focus so a change made
  // on another device shows up here without a full page reload.
  refresh: async () => {
    try {
      const [accounts, transactions] = await Promise.all([
        accountsRepo.listAccounts(),
        transactionsRepo.listTransactions(),
      ]);
      set({ accounts, transactions });
    } catch (err) {
      toast.error(errorMessage(err, "Failed to refresh your data"));
    }
  },

  addTransaction: async (t) => {
    try {
      const created = await transactionsRepo.createTransaction(t);
      set((state) => ({
        transactions: [created, ...state.transactions].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to add transaction"));
    }
  },

  updateTransaction: async (id, patch) => {
    try {
      const updated = await transactionsRepo.updateTransaction(id, patch);
      set((state) => ({ transactions: state.transactions.map((t) => (t.id === id ? updated : t)) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update transaction"));
    }
  },

  deleteTransaction: async (id) => {
    try {
      await transactionsRepo.deleteTransaction(id);
      set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete transaction"));
    }
  },

  deleteTransactions: async (ids) => {
    try {
      await transactionsRepo.deleteTransactions(ids);
      set((state) => ({ transactions: state.transactions.filter((t) => !ids.includes(t.id)) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete transactions"));
    }
  },

  addBudget: (b) => set((state) => ({ budgets: [...state.budgets, { ...b, id: nextId("bud") }] })),

  updateBudget: (id, patch) =>
    set((state) => ({ budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),

  addAccount: async (a) => {
    try {
      const created = await accountsRepo.createAccount(a);
      set((state) => ({ accounts: [...state.accounts, created] }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to add account"));
    }
  },

  updateAccount: async (id, patch) => {
    try {
      const updated = await accountsRepo.updateAccount(id, patch);
      set((state) => ({ accounts: state.accounts.map((a) => (a.id === id ? updated : a)) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update account"));
    }
  },

  deleteAccount: async (id) => {
    try {
      await accountsRepo.deleteAccount(id);
      set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete account"));
    }
  },

  addGoal: (g) => set((state) => ({ goals: [...state.goals, { ...g, id: nextId("goal") }] })),

  updateGoal: (id, patch) =>
    set((state) => ({ goals: state.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),

  deleteGoal: (id) => set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),

  updateFireProfile: (patch) => set((state) => ({ fireProfile: { ...state.fireProfile, ...patch } })),
}));
