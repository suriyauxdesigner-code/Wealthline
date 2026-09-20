"use client";

import { Delete } from "lucide-react";

const ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "backspace"],
];

// A digit already present, or a "." when one is already present, is
// ignored by the caller — this component only reports raw key presses.
export function MobileKeypad({ onKeyPress }: { onKeyPress: (key: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {ROWS.map((row, i) => (
        <div key={i} className="flex items-center gap-3">
          {row.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onKeyPress(key)}
              className="flex h-14 flex-1 items-center justify-center text-[28px] font-semibold leading-9 tracking-[-1.12px] text-wl-ink"
            >
              {key === "backspace" ? <Delete className="size-6" strokeWidth={1.75} /> : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
