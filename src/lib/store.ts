"use client";

// Client-side app state. `accounts`, `transactions`, `budgets`, and `goals`
// are now Supabase-backed (see src/lib/repositories/) — every mutation below
// calls a repository function and updates local state from its result, so
// every existing caller (dialogs, pages) keeps working unchanged even though
// these actions are now async. `liabilities`, `otherAssets`, `recurring`,
// and `fireProfile` are still seeded mock data pending a later migration
// phase.

import { create } from "zustand";
import { toast } from "sonner";

import {
  fireProfile as seedFireProfile,
  liabilities as seedLiabilities,
  otherAssets as seedOtherAssets,
  recurringTransactions as seedRecurring,
} from "./mock-data";
import * as accountsRepo from "./repositories/accounts";
import * as budgetsRepo from "./repositories/budgets";
import * as categoriesRepo from "./repositories/categories";
import * as goalsRepo from "./repositories/goals";
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

  addBudget: (b: Omit<Budget, "id">) => Promise<void>;
  updateBudget: (id: string, patch: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  addAccount: (a: Omit<Account, "id">) => Promise<void>;
  updateAccount: (id: string, patch: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  addGoal: (g: Omit<Goal, "id">) => Promise<void>;
  updateGoal: (id: string, patch: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  updateFireProfile: (patch: Partial<FIREProfile>) => void;
}

let initPromise: Promise<void> | null = null;

export const useAppStore = create<AppState>((set) => ({
  accounts: [],
  transactions: [],
  categories: [],
  budgets: [],
  goals: [],
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
          const [accounts, transactions, categories, budgets, goals] = await Promise.all([
            accountsRepo.listAccounts(),
            transactionsRepo.listTransactions(),
            categoriesRepo.listCategories(),
            budgetsRepo.listBudgets(),
            goalsRepo.listGoals(),
          ]);
          set({ accounts, transactions, categories, budgets, goals, dataLoaded: true });
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
      const [accounts, transactions, budgets, goals] = await Promise.all([
        accountsRepo.listAccounts(),
        transactionsRepo.listTransactions(),
        budgetsRepo.listBudgets(),
        goalsRepo.listGoals(),
      ]);
      set({ accounts, transactions, budgets, goals });
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

  addBudget: async (b) => {
    try {
      const created = await budgetsRepo.createBudget(b);
      set((state) => ({ budgets: [...state.budgets, created] }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to add budget"));
    }
  },

  updateBudget: async (id, patch) => {
    try {
      const updated = await budgetsRepo.updateBudget(id, patch);
      set((state) => ({ budgets: state.budgets.map((b) => (b.id === id ? updated : b)) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update budget"));
    }
  },

  deleteBudget: async (id) => {
    try {
      await budgetsRepo.deleteBudget(id);
      set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete budget"));
    }
  },

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

  addGoal: async (g) => {
    try {
      const created = await goalsRepo.createGoal(g);
      set((state) => ({ goals: [...state.goals, created] }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to add goal"));
    }
  },

  updateGoal: async (id, patch) => {
    try {
      const updated = await goalsRepo.updateGoal(id, patch);
      set((state) => ({ goals: state.goals.map((g) => (g.id === id ? updated : g)) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update goal"));
    }
  },

  deleteGoal: async (id) => {
    try {
      await goalsRepo.deleteGoal(id);
      set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete goal"));
    }
  },

  updateFireProfile: (patch) => set((state) => ({ fireProfile: { ...state.fireProfile, ...patch } })),
}));
