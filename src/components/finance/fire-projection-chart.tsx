"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatINR } from "@/lib/calculations";
import type { FireProjectionPoint } from "@/lib/calculations";
import { ChartTooltip } from "./chart-tooltip";

export function FireProjectionChart({
  points,
  fireAge,
  height = 320,
}: {
  points: FireProjectionPoint[];
  fireAge: number | null;
  height?: number;
}) {
  const firePoint = fireAge ? points.find((p) => p.age === fireAge) : undefined;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          dataKey="age"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          label={{ value: "Age", position: "insideBottom", offset: -2, fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickFormatter={(v) => formatINR(Number(v), { compact: true })}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
        <Legend
          verticalAlign="top"
          height={28}
          iconType="plainline"
          wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
        />
        <Line
          type="monotone"
          dataKey="projectedValue"
          name="Projected portfolio"
          stroke="var(--chart-1)"
          strokeWidth={2.25}
          dot={false}
          activeDot={{ r: 4 }}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="fireNumber"
          name="FIRE target"
          stroke="var(--chart-6)"
          strokeWidth={1.75}
          strokeDasharray="5 5"
          dot={false}
          isAnimationActive={false}
        />
        {firePoint && (
          <ReferenceDot
            x={firePoint.age}
            y={firePoint.projectedValue}
            r={5}
            fill="var(--positive)"
            stroke="var(--background)"
            strokeWidth={2}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
