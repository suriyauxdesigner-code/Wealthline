"use client";

import * as React from "react";
import { toast } from "sonner";

import { MobileBottomSheet } from "./bottom-sheet";
import { useAppStore } from "@/lib/store";

function NumberField({
  label,
  value,
  onChange,
  suffix,
  decimal,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  decimal?: boolean;
}) {
  return (
    <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
      <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">{label}</label>
      <div className="flex items-center gap-1">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(decimal ? /[^0-9.]/g : /[^0-9]/g, ""))}
          inputMode={decimal ? "decimal" : "numeric"}
          className="w-full bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink focus:outline-none"
        />
        {suffix && <span className="shrink-0 text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-muted">{suffix}</span>}
      </div>
    </div>
  );
}

interface MobileFireAssumptionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mirrors Figma's 2-step "Edit assumptions" wizard — desktop's FIRE page
// keeps the live-slider simulator; mobile sets assumptions once and reviews
// the resulting target, updating the same fireProfile store record either way.
export function MobileFireAssumptionsSheet({ open, onOpenChange }: MobileFireAssumptionsSheetProps) {
  const fireProfile = useAppStore((s) => s.fireProfile);
  const updateFireProfile = useAppStore((s) => s.updateFireProfile);

  const [step, setStep] = React.useState<1 | 2>(1);
  const [currentAge, setCurrentAge] = React.useState(String(fireProfile.currentAge));
  const [targetAge, setTargetAge] = React.useState(String(fireProfile.targetAge));
  const [lifeExpectancy, setLifeExpectancy] = React.useState(String(fireProfile.lifeExpectancy));
  const [monthlySpending, setMonthlySpending] = React.useState(String(Math.round(fireProfile.annualExpenses / 12)));
  const [withdrawalRate, setWithdrawalRate] = React.useState(String(fireProfile.withdrawalRate));
  const [monthlyInvestment, setMonthlyInvestment] = React.useState(String(fireProfile.monthlyInvestment));
  const [expectedReturn, setExpectedReturn] = React.useState(String(fireProfile.expectedReturn));
  const [inflation, setInflation] = React.useState(String(fireProfile.inflation));
  const [incomeGrowth, setIncomeGrowth] = React.useState(String(fireProfile.incomeGrowth));

  function handleUpdate() {
    updateFireProfile({
      currentAge: Number(currentAge) || 0,
      targetAge: Number(targetAge) || 0,
      lifeExpectancy: Number(lifeExpectancy) || 0,
      annualExpenses: (Number(monthlySpending) || 0) * 12,
      withdrawalRate: Number(withdrawalRate) || 0,
      monthlyInvestment: Number(monthlyInvestment) || 0,
      expectedReturn: Number(expectedReturn) || 0,
      inflation: Number(inflation) || 0,
      incomeGrowth: Number(incomeGrowth) || 0,
    });
    toast.success("FIRE plan updated");
    onOpenChange(false);
  }

  return (
    <MobileBottomSheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setStep(1);
      }}
      title={step === 1 ? "Edit assumptions" : "Financial assumptions"}
    >
      <p className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-muted">
        {step === 1 ? "1 of 2 · Your retirement plan" : "2 of 2 · Use your own assumptions"}
      </p>
      <div className="mt-3 flex flex-col gap-3">
        {step === 1 ? (
          <>
            <NumberField label="Current age" value={currentAge} onChange={setCurrentAge} />
            <NumberField label="Target retirement age" value={targetAge} onChange={setTargetAge} />
            <NumberField label="Plan until age" value={lifeExpectancy} onChange={setLifeExpectancy} />
            <NumberField label="Monthly retirement spending" value={monthlySpending} onChange={setMonthlySpending} />
            <NumberField label="Withdrawal rate" value={withdrawalRate} onChange={setWithdrawalRate} suffix="% / year" decimal />
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-1 flex h-[52px] items-center justify-center rounded-lg bg-wl-accent text-[15px] font-semibold tracking-[-0.6px] text-white"
            >
              Next · Financial assumptions
            </button>
          </>
        ) : (
          <>
            <NumberField label="Monthly investment" value={monthlyInvestment} onChange={setMonthlyInvestment} />
            <NumberField label="Expected annual return" value={expectedReturn} onChange={setExpectedReturn} suffix="%" decimal />
            <NumberField label="Annual inflation" value={inflation} onChange={setInflation} suffix="%" decimal />
            <NumberField label="Annual contribution growth" value={incomeGrowth} onChange={setIncomeGrowth} suffix="%" decimal />
            <button
              type="button"
              onClick={handleUpdate}
              className="mt-1 flex h-[52px] items-center justify-center rounded-lg bg-wl-accent text-[15px] font-semibold tracking-[-0.6px] text-white"
            >
              Update plan
            </button>
          </>
        )}
      </div>
    </MobileBottomSheet>
  );
}
