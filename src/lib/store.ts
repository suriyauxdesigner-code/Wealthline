"use client";

// Client-side app state. `accounts`, `transactions`, `budgets`, `goals`,
// `investments`, `liabilities`, `otherAssets`, and `fireProfile` are now
// Supabase-backed (see src/lib/repositories/) — every mutation below calls a
// repository function and updates local state from its result, so every
// existing caller (dialogs, pages) keeps working unchanged even though these
// actions are now async. `recurring` is still seeded mock data pending a
// later migration phase.

import { create } from "zustand";
import { toast } from "sonner";

import { recurringTransactions as seedRecurring } from "./mock-data";
import * as accountsRepo from "./repositories/accounts";
import * as budgetsRepo from "./repositories/budgets";
import * as categoriesRepo from "./repositories/categories";
import * as fireProfileRepo from "./repositories/fire-profile";
import * as goalsRepo from "./repositories/goals";
import * as investmentsRepo from "./repositories/investments";
import * as liabilitiesRepo from "./repositories/liabilities";
import * as otherAssetsRepo from "./repositories/other-assets";
import * as transactionsRepo from "./repositories/transactions";
import type {
  Account,
  Budget,
  Category,
  FIREProfile,
  Goal,
  Investment,
  Liability,
  OtherAsset,
  RecurringTransaction,
  Transaction,
} from "./types";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

// Used until the user's own fire_profiles row loads (or if they haven't
// completed onboarding yet) — the first slider/input change saves a real row.
const DEFAULT_FIRE_PROFILE: FIREProfile = {
  id: "",
  currentAge: 30,
  targetAge: 45,
  currentNetWorth: 0,
  annualExpenses: 0,
  monthlyInvestment: 0,
  expectedReturn: 11,
  inflation: 6,
  incomeGrowth: 8,
  withdrawalRate: 3.5,
  lifeExpectancy: 85,
};

interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  investments: Investment[];
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

  addInvestment: (i: Omit<Investment, "id">) => Promise<void>;
  updateInvestment: (id: string, patch: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;

  addLiability: (l: Omit<Liability, "id">) => Promise<void>;
  updateLiability: (id: string, patch: Partial<Liability>) => Promise<void>;
  deleteLiability: (id: string) => Promise<void>;

  addOtherAsset: (o: Omit<OtherAsset, "id">) => Promise<void>;
  updateOtherAsset: (id: string, patch: Partial<OtherAsset>) => Promise<void>;
  deleteOtherAsset: (id: string) => Promise<void>;

  updateFireProfile: (patch: Partial<FIREProfile>) => void;
}

let initPromise: Promise<void> | null = null;
let fireProfileSaveTimer: ReturnType<typeof setTimeout> | null = null;

export const useAppStore = create<AppState>((set, get) => ({
  accounts: [],
  transactions: [],
  categories: [],
  budgets: [],
  goals: [],
  investments: [],
  liabilities: [],
  otherAssets: [],
  recurring: seedRecurring,
  fireProfile: DEFAULT_FIRE_PROFILE,
  dataLoaded: false,

  // Called once on mount (see StoreInitializer) — dedupes concurrent callers
  // (e.g. React StrictMode's double-invoke) behind a single in-flight promise.
  init: () => {
    if (!initPromise) {
      initPromise = (async () => {
        try {
          const [accounts, transactions, categories, budgets, goals, investments, liabilities, otherAssets, fireProfile] =
            await Promise.all([
              accountsRepo.listAccounts(),
              transactionsRepo.listTransactions(),
              categoriesRepo.listCategories(),
              budgetsRepo.listBudgets(),
              goalsRepo.listGoals(),
              investmentsRepo.listInvestments(),
              liabilitiesRepo.listLiabilities(),
              otherAssetsRepo.listOtherAssets(),
              fireProfileRepo.getFireProfile(),
            ]);
          set({
            accounts,
            transactions,
            categories,
            budgets,
            goals,
            investments,
            liabilities,
            otherAssets,
            fireProfile: fireProfile ?? DEFAULT_FIRE_PROFILE,
            dataLoaded: true,
          });
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
      const [accounts, transactions, budgets, goals, investments, liabilities, otherAssets, fireProfile] =
        await Promise.all([
          accountsRepo.listAccounts(),
          transactionsRepo.listTransactions(),
          budgetsRepo.listBudgets(),
          goalsRepo.listGoals(),
          investmentsRepo.listInvestments(),
          liabilitiesRepo.listLiabilities(),
          otherAssetsRepo.listOtherAssets(),
          fireProfileRepo.getFireProfile(),
        ]);
      set({
        accounts,
        transactions,
        budgets,
        goals,
        investments,
        liabilities,
        otherAssets,
        ...(fireProfile ? { fireProfile } : {}),
      });
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

  addInvestment: async (i) => {
    try {
      const created = await investmentsRepo.createInvestment(i);
      set((state) => ({ investments: [...state.investments, created] }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to add investment"));
    }
  },

  updateInvestment: async (id, patch) => {
    try {
      const updated = await investmentsRepo.updateInvestment(id, patch);
      set((state) => ({ investments: state.investments.map((i) => (i.id === id ? updated : i)) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update investment"));
    }
  },

  deleteInvestment: async (id) => {
    try {
      await investmentsRepo.deleteInvestment(id);
      set((state) => ({ investments: state.investments.filter((i) => i.id !== id) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete investment"));
    }
  },

  addLiability: async (l) => {
    try {
      const created = await liabilitiesRepo.createLiability(l);
      set((state) => ({ liabilities: [...state.liabilities, created] }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to add liability"));
    }
  },

  updateLiability: async (id, patch) => {
    try {
      const updated = await liabilitiesRepo.updateLiability(id, patch);
      set((state) => ({ liabilities: state.liabilities.map((l) => (l.id === id ? updated : l)) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update liability"));
    }
  },

  deleteLiability: async (id) => {
    try {
      await liabilitiesRepo.deleteLiability(id);
      set((state) => ({ liabilities: state.liabilities.filter((l) => l.id !== id) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete liability"));
    }
  },

  addOtherAsset: async (o) => {
    try {
      const created = await otherAssetsRepo.createOtherAsset(o);
      set((state) => ({ otherAssets: [...state.otherAssets, created] }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to add asset"));
    }
  },

  updateOtherAsset: async (id, patch) => {
    try {
      const updated = await otherAssetsRepo.updateOtherAsset(id, patch);
      set((state) => ({ otherAssets: state.otherAssets.map((o) => (o.id === id ? updated : o)) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update asset"));
    }
  },

  deleteOtherAsset: async (id) => {
    try {
      await otherAssetsRepo.deleteOtherAsset(id);
      set((state) => ({ otherAssets: state.otherAssets.filter((o) => o.id !== id) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete asset"));
    }
  },

  // The FIRE page is a live "what-if simulator" — sliders fire on every drag
  // tick, so this updates local state instantly and synchronously (no
  // network round trip per tick) while debouncing the actual Supabase save
  // to ~800ms after the user stops adjusting, rather than persisting an
  // entire scroll's worth of intermediate values.
  updateFireProfile: (patch) => {
    set((state) => ({ fireProfile: { ...state.fireProfile, ...patch } }));

    if (fireProfileSaveTimer) clearTimeout(fireProfileSaveTimer);
    fireProfileSaveTimer = setTimeout(async () => {
      try {
        const saved = await fireProfileRepo.saveFireProfile(get().fireProfile);
        set({ fireProfile: saved });
      } catch (err) {
        toast.error(errorMessage(err, "Failed to save FIRE profile"));
      }
    }, 800);
  },
}));
