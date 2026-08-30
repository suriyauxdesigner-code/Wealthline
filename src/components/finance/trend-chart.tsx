"use client";

import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatINR } from "@/lib/calculations";
import { ChartTooltip } from "./chart-tooltip";

export interface TrendSeries {
  key: string;
  label: string;
  color: string; // css var, e.g. "var(--chart-1)"
  area?: boolean;
}

export function TrendChart({
  data,
  xKey,
  series,
  height = 260,
  compactCurrency = true,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  series: TrendSeries[];
  height?: number;
  compactCurrency?: boolean;
}) {
  const hasArea = series.some((s) => s.area);
  const Chart = hasArea ? AreaChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`fill-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.22} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          dataKey={xKey}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          minTickGap={24}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={52}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickFormatter={(v) => formatINR(Number(v), { compact: compactCurrency })}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
        {series.map((s, i) =>
          s.area ? (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#fill-${i})`}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          ) : (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.key.includes("target") || s.key.includes("fireNumber") ? "5 4" : undefined}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          )
        )}
      </Chart>
    </ResponsiveContainer>
  );
}
