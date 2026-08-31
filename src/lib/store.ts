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
import * as investmentTransactionsRepo from "./repositories/investment-transactions";
import * as liabilitiesRepo from "./repositories/liabilities";
import * as otherAssetsRepo from "./repositories/other-assets";
import * as transactionsRepo from "./repositories/transactions";
import { isUnitBasedAssetClass } from "./investment-selectors";
import type {
  Account,
  Budget,
  Category,
  FIREProfile,
  Goal,
  Investment,
  InvestmentTransaction,
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

  addTransaction: (t: Omit<Transaction, "id">) => Promise<Transaction | undefined>;
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

  addInvestment: (i: Omit<Investment, "id">) => Promise<Investment | undefined>;
  updateInvestment: (id: string, patch: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  logInvestmentTransaction: (
    investmentId: string,
    input: Omit<InvestmentTransaction, "id" | "investmentId" | "amount">
  ) => Promise<void>;
  updateInvestmentTransactionEntry: (
    investmentId: string,
    transactionId: string,
    patch: { type: InvestmentTransaction["type"]; quantity: number; price: number; date: string }
  ) => Promise<void>;
  deleteInvestmentTransactionEntry: (investmentId: string, transactionId: string) => Promise<void>;
  // Used by Add Transaction's Investment tab to tie a logged Buy/Sell to a
  // specific unit-based holding, keeping it in the same replay-based ledger
  // the holding's own detail page uses.
  linkInvestmentTransaction: (
    transactionId: string,
    investmentId: string,
    details: { type: InvestmentTransaction["type"]; quantity: number; price: number; date: string }
  ) => Promise<void>;
  updateLinkedInvestmentTransaction: (
    ledgerId: string,
    investmentId: string,
    details: { type: InvestmentTransaction["type"]; quantity: number; price: number; date: string }
  ) => Promise<void>;
  unlinkInvestmentTransaction: (ledgerId: string, investmentId: string) => Promise<void>;

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

export const useAppStore = create<AppState>((set, get) => {
  // A transaction linked to a debt (liabilityId set) always represents a
  // payment — its amount reduces that debt's outstanding balance. Positive
  // delta increases outstanding (reversing a payment being edited/deleted),
  // negative delta decreases it (applying a new or changed payment).
  async function adjustLiabilityOutstanding(liabilityId: string | undefined, delta: number) {
    if (!liabilityId || delta === 0) return;
    const liability = get().liabilities.find((l) => l.id === liabilityId);
    if (!liability) return;
    try {
      const updated = await liabilitiesRepo.updateLiability(liabilityId, {
        outstanding: Math.max(0, liability.outstanding + delta),
      });
      set((state) => ({ liabilities: state.liabilities.map((l) => (l.id === liabilityId ? updated : l)) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update debt balance"));
    }
  }

  // A transaction linked to a value-based holding (FD/EPF/PPF/Bonds) is
  // always a contribution — its amount adds straight to that holding's
  // invested amount (stored in averageCost, since quantity is pinned to 1
  // for these). This is a simple running total, unlike unit-based holdings'
  // weighted average cost, so it can be reversed with a plain delta exactly
  // like adjustLiabilityOutstanding above — no replay needed.
  async function adjustInvestmentValue(investmentId: string | undefined, delta: number) {
    if (!investmentId || delta === 0) return;
    const investment = get().investments.find((i) => i.id === investmentId);
    if (!investment || isUnitBasedAssetClass(investment.assetClass)) return;
    try {
      const updated = await investmentsRepo.updateInvestment(investmentId, {
        averageCost: Math.max(0, investment.averageCost + delta),
      });
      set((state) => ({ investments: state.investments.map((i) => (i.id === investmentId ? updated : i)) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update investment"));
    }
  }

  // Every transaction moves real money, so it must move the linked
  // account's balance too — income/expense touch one account, transfer and
  // investment move money from accountId to toAccountId. For a liability
  // account (e.g. a credit card modeled as an account, balance = amount
  // owed), the sign flips: an expense on that card *increases* what's owed,
  // and money arriving at it (a payment) *decreases* it.
  async function applyAccountDelta(accountId: string, rawDelta: number) {
    if (rawDelta === 0) return;
    const account = get().accounts.find((a) => a.id === accountId);
    if (!account) return;
    const delta = account.isLiabilityAccount ? -rawDelta : rawDelta;
    try {
      const updated = await accountsRepo.updateAccount(accountId, { balance: account.balance + delta });
      set((state) => ({ accounts: state.accounts.map((a) => (a.id === accountId ? updated : a)) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update account balance"));
    }
  }

  function accountDeltasForTransaction(
    t: Pick<Transaction, "type" | "amount" | "accountId" | "toAccountId">
  ): { accountId: string; amount: number }[] {
    if (t.type === "income") return [{ accountId: t.accountId, amount: t.amount }];
    if (t.type === "expense") return [{ accountId: t.accountId, amount: -t.amount }];
    // transfer or investment: money moves out of accountId, into toAccountId
    const deltas = [{ accountId: t.accountId, amount: -t.amount }];
    if (t.toAccountId) deltas.push({ accountId: t.toAccountId, amount: t.amount });
    return deltas;
  }

  // sign=1 applies a transaction's effects (on create, or the new side of an
  // edit); sign=-1 reverses them (on delete, or the old side of an edit).
  async function applyTransactionEffects(
    t: Pick<Transaction, "type" | "amount" | "accountId" | "toAccountId" | "liabilityId" | "investmentId">,
    sign: 1 | -1
  ) {
    for (const d of accountDeltasForTransaction(t)) {
      await applyAccountDelta(d.accountId, d.amount * sign);
    }
    // A debt-linked transaction is always a payment: applying it (sign=1)
    // reduces outstanding, reversing it (sign=-1) puts it back.
    if (t.liabilityId) await adjustLiabilityOutstanding(t.liabilityId, -t.amount * sign);
    // A value-based-holding-linked transaction is always a contribution:
    // applying it (sign=1) adds to invested amount, reversing it (sign=-1)
    // subtracts it back. Unit-based holdings are handled separately via the
    // investment_transactions ledger (see linkInvestmentTransaction et al.).
    await adjustInvestmentValue(t.investmentId, t.amount * sign);
  }

  // A holding's quantity/average cost must reflect its FULL buy/sell
  // history, not just the latest entry — recomputed from scratch after every
  // log or delete so the numbers stay correct regardless of edit order.
  // Dividends don't affect quantity or cost basis. Selling reduces the cost
  // basis proportionally so the average cost of the remaining units is
  // unchanged.
  async function recomputeHoldingFromTransactions(investmentId: string, latestPrice?: number) {
    const investment = get().investments.find((i) => i.id === investmentId);
    if (!investment) return;
    const transactions = await investmentTransactionsRepo.listInvestmentTransactions(investmentId);
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let quantity = 0;
    let totalCost = 0;
    for (const tx of sorted) {
      if (tx.type === "buy") {
        quantity += tx.quantity;
        totalCost += tx.quantity * tx.price;
      } else if (tx.type === "sell") {
        const avgCostBefore = quantity > 0 ? totalCost / quantity : 0;
        quantity = Math.max(0, quantity - tx.quantity);
        totalCost = Math.max(0, totalCost - tx.quantity * avgCostBefore);
      }
    }

    const averageCost = quantity > 0 ? totalCost / quantity : investment.averageCost;
    const currentPrice = latestPrice ?? sorted[sorted.length - 1]?.price ?? investment.currentPrice;

    try {
      const updated = await investmentsRepo.updateInvestment(investmentId, { quantity, averageCost, currentPrice });
      set((state) => ({ investments: state.investments.map((i) => (i.id === investmentId ? updated : i)) }));
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update holding"));
    }
  }

  async function recomputeUnitBasedHoldingIfLinked(investmentId: string | undefined) {
    if (!investmentId) return;
    const investment = get().investments.find((i) => i.id === investmentId);
    if (!investment || !isUnitBasedAssetClass(investment.assetClass)) return;
    await recomputeHoldingFromTransactions(investmentId);
  }

  return {
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
      await applyTransactionEffects(created, 1);
      return created;
    } catch (err) {
      toast.error(errorMessage(err, "Failed to add transaction"));
      return undefined;
    }
  },

  updateTransaction: async (id, patch) => {
    try {
      const before = get().transactions.find((t) => t.id === id);
      const updated = await transactionsRepo.updateTransaction(id, patch);
      set((state) => ({ transactions: state.transactions.map((t) => (t.id === id ? updated : t)) }));
      // Reverse the old effects (if any), then apply the new ones — this
      // correctly handles the amount, account(s), or linked debt changing.
      if (before) await applyTransactionEffects(before, -1);
      await applyTransactionEffects(updated, 1);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update transaction"));
    }
  },

  deleteTransaction: async (id) => {
    try {
      const deleted = await transactionsRepo.deleteTransaction(id);
      set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
      await applyTransactionEffects(deleted, -1);
      // The DB already cascade-deleted any linked investment_transactions
      // row (unit-based holdings) — recompute so local state reflects that.
      await recomputeUnitBasedHoldingIfLinked(deleted.investmentId);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete transaction"));
    }
  },

  deleteTransactions: async (ids) => {
    try {
      const deleted = await transactionsRepo.deleteTransactions(ids);
      set((state) => ({ transactions: state.transactions.filter((t) => !ids.includes(t.id)) }));
      for (const t of deleted) {
        await applyTransactionEffects(t, -1);
        await recomputeUnitBasedHoldingIfLinked(t.investmentId);
      }
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
      return created;
    } catch (err) {
      toast.error(errorMessage(err, "Failed to add investment"));
      return undefined;
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

  logInvestmentTransaction: async (investmentId, input) => {
    try {
      await investmentTransactionsRepo.createInvestmentTransaction({ ...input, investmentId });
      await recomputeHoldingFromTransactions(investmentId, input.price);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to log transaction"));
    }
  },

  updateInvestmentTransactionEntry: async (investmentId, transactionId, patch) => {
    try {
      await investmentTransactionsRepo.updateInvestmentTransaction(transactionId, patch);
      await recomputeHoldingFromTransactions(investmentId, patch.price);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update transaction"));
    }
  },

  deleteInvestmentTransactionEntry: async (investmentId, transactionId) => {
    try {
      await investmentTransactionsRepo.deleteInvestmentTransaction(transactionId);
      await recomputeHoldingFromTransactions(investmentId);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete transaction"));
    }
  },

  linkInvestmentTransaction: async (transactionId, investmentId, details) => {
    try {
      await investmentTransactionsRepo.createLinkedInvestmentTransaction({
        ...details,
        investmentId,
        linkedTransactionId: transactionId,
      });
      await recomputeHoldingFromTransactions(investmentId, details.price);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to log investment transaction"));
    }
  },

  updateLinkedInvestmentTransaction: async (ledgerId, investmentId, details) => {
    try {
      await investmentTransactionsRepo.updateInvestmentTransaction(ledgerId, details);
      await recomputeHoldingFromTransactions(investmentId, details.price);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update investment transaction"));
    }
  },

  unlinkInvestmentTransaction: async (ledgerId, investmentId) => {
    try {
      await investmentTransactionsRepo.deleteInvestmentTransaction(ledgerId);
      await recomputeHoldingFromTransactions(investmentId);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to unlink investment transaction"));
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
  };
});
