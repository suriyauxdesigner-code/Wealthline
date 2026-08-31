import { Flame } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-muted/30 px-4 py-12">
      <Link href="/login" className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Flame className="size-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Wealthline</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
