import { createClient } from "@/lib/supabase/client";
import type { FIREProfile } from "@/lib/types";

interface FireProfileRow {
  id: string;
  current_age: number;
  target_retirement_age: number;
  current_net_worth: number;
  annual_expenses: number;
  monthly_investment: number;
  expected_return: number;
  income_growth: number;
  inflation: number;
  withdrawal_rate: number;
  life_expectancy: number;
}

const COLUMNS =
  "id, current_age, target_retirement_age, current_net_worth, annual_expenses, monthly_investment, expected_return, income_growth, inflation, withdrawal_rate, life_expectancy";

function mapFireProfile(row: FireProfileRow): FIREProfile {
  return {
    id: row.id,
    currentAge: row.current_age,
    targetAge: row.target_retirement_age,
    currentNetWorth: row.current_net_worth,
    annualExpenses: row.annual_expenses,
    monthlyInvestment: row.monthly_investment,
    expectedReturn: row.expected_return,
    inflation: row.inflation,
    incomeGrowth: row.income_growth,
    withdrawalRate: row.withdrawal_rate,
    lifeExpectancy: row.life_expectancy,
  };
}

// Null if the user hasn't completed onboarding (no row created yet) — caller
// falls back to sensible defaults; the first save() creates the row.
export async function getFireProfile(): Promise<FIREProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("fire_profiles").select(COLUMNS).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapFireProfile(data) : null;
}

export async function saveFireProfile(profile: Omit<FIREProfile, "id">): Promise<FIREProfile> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("fire_profiles")
    .upsert(
      {
        user_id: user.id,
        current_age: profile.currentAge,
        target_retirement_age: profile.targetAge,
        current_net_worth: profile.currentNetWorth,
        annual_expenses: profile.annualExpenses,
        monthly_investment: profile.monthlyInvestment,
        expected_return: profile.expectedReturn,
        income_growth: profile.incomeGrowth,
        inflation: profile.inflation,
        withdrawal_rate: profile.withdrawalRate,
        life_expectancy: profile.lifeExpectancy,
      },
      { onConflict: "user_id" }
    )
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapFireProfile(data);
}
