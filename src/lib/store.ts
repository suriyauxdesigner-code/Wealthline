"use client";

// Client-side app state. Backed by the seeded mock data, mutated through
// actions here so every screen (Transactions, Budget, Goals, Overview) reads
// and writes through one shared store — the same shape a Supabase-backed
// version would expose, just synchronous and in-memory for now.

import { create } from "zustand";
import {
  accounts as seedAccounts,
  budgets as seedBudgets,
  fireProfile as seedFireProfile,
  goals as seedGoals,
  liabilities as seedLiabilities,
  otherAssets as seedOtherAssets,
  recurringTransactions as seedRecurring,
  transactions as seedTransactions,
} from "./mock-data";
import type {
  Account,
  Budget,
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

interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  liabilities: Liability[];
  otherAssets: OtherAsset[];
  recurring: RecurringTransaction[];
  fireProfile: FIREProfile;

  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  deleteTransactions: (ids: string[]) => void;

  addBudget: (b: Omit<Budget, "id">) => void;
  updateBudget: (id: string, patch: Partial<Budget>) => void;

  addAccount: (a: Omit<Account, "id">) => void;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  updateFireProfile: (patch: Partial<FIREProfile>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  accounts: seedAccounts,
  transactions: seedTransactions,
  budgets: seedBudgets,
  goals: seedGoals,
  liabilities: seedLiabilities,
  otherAssets: seedOtherAssets,
  recurring: seedRecurring,
  fireProfile: seedFireProfile,

  addTransaction: (t) =>
    set((state) => ({
      transactions: [{ ...t, id: nextId("t") }, ...state.transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    })),

  updateTransaction: (id, patch) =>
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  deleteTransaction: (id) =>
    set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) })),

  deleteTransactions: (ids) =>
    set((state) => ({ transactions: state.transactions.filter((t) => !ids.includes(t.id)) })),

  addBudget: (b) => set((state) => ({ budgets: [...state.budgets, { ...b, id: nextId("bud") }] })),

  updateBudget: (id, patch) =>
    set((state) => ({ budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),

  addAccount: (a) => set((state) => ({ accounts: [...state.accounts, { ...a, id: nextId("acc") }] })),

  updateAccount: (id, patch) =>
    set((state) => ({ accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),

  deleteAccount: (id) => set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) })),

  addGoal: (g) => set((state) => ({ goals: [...state.goals, { ...g, id: nextId("goal") }] })),

  updateGoal: (id, patch) =>
    set((state) => ({ goals: state.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),

  deleteGoal: (id) => set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),

  updateFireProfile: (patch) => set((state) => ({ fireProfile: { ...state.fireProfile, ...patch } })),
}));
