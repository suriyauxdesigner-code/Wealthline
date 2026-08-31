import type { AssetClass, Investment } from "./types";
import { calcCurrentValue, calcInvestedValue, calcReturnPct } from "./calculations";

export const ASSET_CLASS_LABEL: Record<AssetClass, string> = {
  equity: "Stocks",
  etf: "ETF",
  mutual_fund: "Mutual Funds",
  gold: "Gold",
  bonds: "Bonds",
  fd: "Fixed Deposit",
  epf: "EPF",
  ppf: "PPF",
  crypto: "Crypto",
};

// Roll individual holdings up into three broad buckets for the allocation
// chart, as called out in the brief (Equity / Debt / Gold / Cash).
export const ASSET_GROUP: Record<AssetClass, "Equity" | "Debt" | "Gold" | "Crypto"> = {
  equity: "Equity",
  etf: "Equity",
  mutual_fund: "Equity",
  gold: "Gold",
  bonds: "Debt",
  fd: "Debt",
  epf: "Debt",
  ppf: "Debt",
  crypto: "Crypto",
};

// FD / EPF / PPF / Bonds aren't bought and sold in units with a fluctuating
// price — they're tracked as a lump invested amount that grows to a current
// value. Internally they still use quantity/averageCost/currentPrice
// (quantity pinned to 1) so every other calculation (invested value, current
// value, allocation, returns) keeps working unchanged; only the Add/Edit
// form and the holdings table presentation branch on this.
const VALUE_BASED_ASSET_CLASSES: AssetClass[] = ["fd", "epf", "ppf", "bonds"];

export function isUnitBasedAssetClass(assetClass: AssetClass): boolean {
  return !VALUE_BASED_ASSET_CLASSES.includes(assetClass);
}

export interface HoldingRow extends Investment {
  invested: number;
  currentValue: number;
  returnPct: number;
  gain: number;
}

export function holdingsWithReturns(investments: Investment[]): HoldingRow[] {
  return investments
    .map((inv) => {
      const invested = calcInvestedValue(inv.quantity, inv.averageCost);
      const currentValue = calcCurrentValue(inv.quantity, inv.currentPrice);
      return {
        ...inv,
        invested,
        currentValue,
        returnPct: calcReturnPct(invested, currentValue),
        gain: currentValue - invested,
      };
    })
    .sort((a, b) => b.currentValue - a.currentValue);
}

export interface AllocationGroup {
  name: string;
  value: number;
}

export function allocationByGroup(holdings: HoldingRow[]): AllocationGroup[] {
  const totals = new Map<string, number>();
  for (const h of holdings) {
    const group = ASSET_GROUP[h.assetClass];
    totals.set(group, (totals.get(group) ?? 0) + h.currentValue);
  }
  return Array.from(totals.entries()).map(([name, value]) => ({ name, value }));
}
