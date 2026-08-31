"use client";

import * as React from "react";
import { Flame } from "lucide-react";
import { useRouter } from "next/navigation";

import { completeOnboarding } from "./actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TOTAL_STEPS = 3;

function toNumber(value: string, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  // Step 1 — personal information
  const [name, setName] = React.useState("");
  const [country, setCountry] = React.useState("India");

  // Step 2 — financial profile (all optional, skippable)
  const [currentAge, setCurrentAge] = React.useState("30");
  const [monthlyIncome, setMonthlyIncome] = React.useState("");
  const [monthlyExpenses, setMonthlyExpenses] = React.useState("");
  const [currentSavings, setCurrentSavings] = React.useState("");
  const [currentInvestments, setCurrentInvestments] = React.useState("");
  const [existingDebt, setExistingDebt] = React.useState("");

  // Step 3 — FIRE profile (pre-filled with sensible defaults)
  const [targetRetirementAge, setTargetRetirementAge] = React.useState("45");
  const [expectedReturn, setExpectedReturn] = React.useState("11");
  const [inflation, setInflation] = React.useState("6");
  const [withdrawalRate, setWithdrawalRate] = React.useState("3.5");

  async function handleFinish() {
    setError(null);
    setPending(true);
    try {
      await completeOnboarding({
        name,
        country,
        currency: "INR",
        currentAge: toNumber(currentAge, 30),
        monthlyIncome: toNumber(monthlyIncome),
        monthlyExpenses: toNumber(monthlyExpenses),
        currentSavings: toNumber(currentSavings),
        currentInvestments: toNumber(currentInvestments),
        existingDebt: toNumber(existingDebt),
        targetRetirementAge: toNumber(targetRetirementAge, 45),
        expectedReturn: toNumber(expectedReturn, 11),
        inflation: toNumber(inflation, 6),
        withdrawalRate: toNumber(withdrawalRate, 3.5),
      });
      router.push("/overview");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-muted/30 px-4 py-12">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Flame className="size-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Wealthline</span>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-1 flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
          <CardTitle className="text-xl">
            {step === 1 && "Tell us about you"}
            {step === 2 && "Your financial profile"}
            {step === 3 && "Your FIRE assumptions"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "This helps us personalize Wealthline for you."}
            {step === 2 && "Optional — skip anything you're not sure about, you can fill it in later."}
            {step === 3 && "Sensible defaults are already filled in — change them anytime in Settings."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <div className="flex h-9 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground">
                  India — INR (₹)
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="current-age">Current age</Label>
                <Input
                  id="current-age"
                  inputMode="numeric"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="monthly-income">Monthly income</Label>
                <Input
                  id="monthly-income"
                  inputMode="numeric"
                  placeholder="0"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="monthly-expenses">Monthly expenses</Label>
                <Input
                  id="monthly-expenses"
                  inputMode="numeric"
                  placeholder="0"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="current-savings">Current savings</Label>
                <Input
                  id="current-savings"
                  inputMode="numeric"
                  placeholder="0"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="current-investments">Current investments</Label>
                <Input
                  id="current-investments"
                  inputMode="numeric"
                  placeholder="0"
                  value={currentInvestments}
                  onChange={(e) => setCurrentInvestments(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="existing-debt">Existing debt</Label>
                <Input
                  id="existing-debt"
                  inputMode="numeric"
                  placeholder="0"
                  value={existingDebt}
                  onChange={(e) => setExistingDebt(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="fire-age">Desired FIRE age</Label>
                <Input
                  id="fire-age"
                  inputMode="numeric"
                  value={targetRetirementAge}
                  onChange={(e) => setTargetRetirementAge(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expected-return">Expected annual return %</Label>
                <Input
                  id="expected-return"
                  inputMode="decimal"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(e.target.value.replace(/[^0-9.]/g, ""))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inflation">Expected inflation %</Label>
                <Input
                  id="inflation"
                  inputMode="decimal"
                  value={inflation}
                  onChange={(e) => setInflation(e.target.value.replace(/[^0-9.]/g, ""))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="withdrawal-rate">Withdrawal rate %</Label>
                <Input
                  id="withdrawal-rate"
                  inputMode="decimal"
                  value={withdrawalRate}
                  onChange={(e) => setWithdrawalRate(e.target.value.replace(/[^0-9.]/g, ""))}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step < TOTAL_STEPS && (
              <Button
                type="button"
                className="flex-1"
                disabled={step === 1 && name.trim().length === 0}
                onClick={() => setStep(step + 1)}
              >
                Continue
              </Button>
            )}
            {step === TOTAL_STEPS && (
              <Button type="button" className="flex-1" disabled={pending} onClick={handleFinish}>
                {pending ? "Setting up…" : "Finish"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
