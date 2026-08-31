import { calcNetWorth } from "./calculations";
import type { Account, Liability, OtherAsset } from "./types";

export interface NetWorthBreakdown {
  cash: number;
  bank: number;
  investments: number;
  vehicles: number;
  property: number;
  otherAssetsTotal: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

// Single source of truth for "what counts toward net worth" — Overview and
// Net Worth pages both call this so they can never show different numbers
// for the same underlying data (accounts/liabilities/other assets are all
// Supabase-backed; there's no separate historical snapshot yet, so this is
// always "as of right now", not a point-in-time record).
export function calcNetWorthBreakdown(
  accounts: Account[],
  liabilities: Liability[],
  otherAssets: OtherAsset[]
): NetWorthBreakdown {
  const cash = accounts.filter((a) => a.group === "cash").reduce((s, a) => s + a.balance, 0);
  const bank = accounts.filter((a) => a.group === "bank").reduce((s, a) => s + a.balance, 0);
  const investments = accounts
    .filter((a) => a.group === "investment" || a.group === "other")
    .reduce((s, a) => s + a.balance, 0);
  const vehicles = otherAssets.filter((o) => o.category === "vehicle").reduce((s, o) => s + o.value, 0);
  const property = otherAssets.filter((o) => o.category === "property").reduce((s, o) => s + o.value, 0);
  const otherAssetsTotal = otherAssets.filter((o) => o.category === "other").reduce((s, o) => s + o.value, 0);

  const totalAssets = cash + bank + investments + vehicles + property + otherAssetsTotal;
  const totalLiabilities = liabilities.reduce((s, l) => s + l.outstanding, 0);

  return {
    cash,
    bank,
    investments,
    vehicles,
    property,
    otherAssetsTotal,
    totalAssets,
    totalLiabilities,
    netWorth: calcNetWorth(totalAssets, totalLiabilities),
  };
}
