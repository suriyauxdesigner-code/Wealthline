"use client";

// Native <input type="date"> — opens the OS date picker instead of an
// in-sheet calendar, matching the "use the default mobile keyboard/pickers"
// direction for entry flows. Value/onChange are plain "yyyy-mm-dd" strings.
export function MobileDateField({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`flex h-16 flex-col justify-center gap-1 border-b border-wl-border last:border-b-0 ${className}`}>
      <span className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="[color-scheme:light] bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink focus:outline-none"
      />
    </label>
  );
}
