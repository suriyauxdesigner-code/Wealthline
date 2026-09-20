"use client";

import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ModeToggle } from "@/components/mode-toggle";
import { useAppStore } from "@/lib/store";
import { user } from "@/lib/mock-data";
import type { Transaction } from "@/lib/types";

function exportAllTransactions(transactions: Transaction[]) {
  const header = ["Date", "Merchant", "Type", "Amount"];
  const lines = transactions.map((t) => [t.date, t.merchant, t.type, t.amount].join(","));
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "wealthline-transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${transactions.length} transaction${transactions.length === 1 ? "" : "s"}`);
}

export default function SettingsPage() {
  const transactions = useAppStore((s) => s.transactions);
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <div className="wl-mobile -mx-4 -mt-5 min-h-svh bg-wl-canvas px-6 pt-3 pb-6 lg:hidden">
        <p className="text-[28px] font-semibold leading-9 tracking-[-1.12px] text-wl-ink">Settings</p>

        <div className="mt-3 flex flex-col gap-1 rounded-lg bg-wl-surface p-4">
          <p className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">{user.name}</p>
          <p className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Personal account</p>
        </div>

        <div className="mt-3 flex flex-col">
          <div className="flex h-16 items-center justify-between border-b border-wl-border">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Appearance</span>
              <span className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">Light</span>
            </div>
          </div>
          <div className="flex h-16 items-center justify-between border-b border-wl-border">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Currency</span>
              <span className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">INR · Indian rupee</span>
            </div>
          </div>
          <button
            onClick={() => toast.info("Coming soon")}
            className="flex h-16 items-center justify-between border-b border-wl-border text-left"
          >
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Notifications</span>
              <span className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">Manage reminders</span>
            </div>
            <ChevronRight className="size-[18px] text-wl-muted" />
          </button>
          <button
            onClick={() => exportAllTransactions(transactions)}
            className="flex h-16 items-center justify-between border-b border-wl-border text-left"
          >
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Data</span>
              <span className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">Export transactions</span>
            </div>
            <ChevronRight className="size-[18px] text-wl-muted" />
          </button>
          <button onClick={() => toast.info("Coming soon")} className="flex h-16 items-center justify-between text-left">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Account</span>
              <span className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">Profile &amp; security</span>
            </div>
            <ChevronRight className="size-[18px] text-wl-muted" />
          </button>
        </div>

        <p className="mt-6 text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Wealthline · Your money, in perspective.</p>
      </div>

      <div className="hidden max-w-2xl space-y-6 lg:block">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarFallback className="bg-primary/15 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input defaultValue={user.name} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input defaultValue={user.email} type="email" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Currency</Label>
              <Input defaultValue="INR (₹)" disabled />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Country</Label>
              <Input defaultValue={user.country} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Appearance</CardTitle>
          <CardDescription>Choose how Wealthline looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
            </div>
            <ModeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Budget alerts", desc: "Get notified when you're near or over a budget" },
            { label: "Weekly summary", desc: "A recap of your spending every Monday" },
            { label: "Goal milestones", desc: "Celebrate when you hit 25/50/75/100% of a goal" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>
      </div>
    </>
  );
}
