"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatINR, formatPercent } from "@/lib/calculations";
import { ChartTooltip } from "./chart-tooltip";

export interface AllocationSlice {
  name: string;
  value: number;
  color: string;
}

export function AllocationDonut({
  data,
  centerLabel,
  centerValue,
  size = 200,
}: {
  data: AllocationSlice[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="70%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="var(--background)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold tabular-nums">{centerValue}</span>
            <span className="text-xs text-muted-foreground">{centerLabel}</span>
          </div>
        )}
      </div>

      <ul className="w-full space-y-2">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="flex-1 truncate text-muted-foreground">{d.name}</span>
            <span className="font-medium tabular-nums">{formatPercent(total > 0 ? (d.value / total) * 100 : 0, 0)}</span>
            <span className="w-24 text-right text-xs text-muted-foreground tabular-nums">
              {formatINR(d.value, { compact: true })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
