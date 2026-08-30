import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinancialHealthResult } from "@/lib/calculations";

const FACTOR_LABEL: Record<keyof FinancialHealthResult["breakdown"], string> = {
  savingsRate: "Savings",
  investmentRate: "Investments",
  emergencyFund: "Emergency Fund",
  debt: "Debt",
  diversification: "Diversification",
};

function scoreColor(score: number): string {
  if (score >= 75) return "var(--positive)";
  if (score >= 50) return "var(--warning)";
  return "var(--negative)";
}

export function FinancialHealthCard({ result, insight }: { result: FinancialHealthResult; insight: string }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - result.score / 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Financial Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-6">
          <div className="relative size-24 shrink-0">
            <svg viewBox="0 0 100 100" className="size-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="9" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={scoreColor(result.score)}
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold tabular-nums">{result.score}</span>
              <span className="text-[10px] text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className="flex-1 space-y-2.5">
            {(Object.keys(result.breakdown) as (keyof typeof result.breakdown)[]).map((key) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{FACTOR_LABEL[key]}</span>
                  <span className="font-medium tabular-nums">{result.breakdown[key]}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${result.breakdown[key]}%`, backgroundColor: scoreColor(result.breakdown[key]) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">{insight}</p>
      </CardContent>
    </Card>
  );
}
