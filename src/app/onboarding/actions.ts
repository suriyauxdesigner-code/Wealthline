"use server";

import { createClient } from "@/lib/supabase/server";

export interface OnboardingInput {
  name: string;
  country: string;
  currency: string;
  currentAge: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  currentInvestments: number;
  existingDebt: number;
  targetRetirementAge: number;
  expectedReturn: number;
  inflation: number;
  withdrawalRate: number;
}

export async function completeOnboarding(input: OnboardingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      name: input.name,
      country: input.country,
      currency: input.currency,
      monthly_income: input.monthlyIncome,
      current_savings: input.currentSavings,
      current_investments: input.currentInvestments,
      existing_debt: input.existingDebt,
    },
    { onConflict: "user_id" }
  );
  if (profileError) {
    throw new Error(profileError.message);
  }

  const { error: fireError } = await supabase.from("fire_profiles").upsert(
    {
      user_id: user.id,
      current_age: input.currentAge,
      target_retirement_age: input.targetRetirementAge,
      annual_expenses: input.monthlyExpenses * 12,
      current_net_worth: input.currentSavings + input.currentInvestments,
      expected_return: input.expectedReturn,
      inflation: input.inflation,
      withdrawal_rate: input.withdrawalRate,
    },
    { onConflict: "user_id" }
  );
  if (fireError) {
    throw new Error(fireError.message);
  }
}
