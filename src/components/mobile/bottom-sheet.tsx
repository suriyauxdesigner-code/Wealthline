"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface MobileBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when the visible X button is tapped. Defaults to onOpenChange(false) —
   *  pass this to run a discard-guard check first (see useDiscardGuard). */
  onRequestClose?: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  /** A picker/confirmation sheet meant to sit on top of an already-open
   *  MobileBottomSheet (two independent, simultaneously-mounted Dialogs). */
  stacked?: boolean;
}

// Shared shell for every mobile entry sheet (Add expense, category picker,
// discard confirmation, etc.) — drag handle, inline title + close (rather
// than shadcn Sheet's default absolute-positioned close), rounded top
// corners, no shadow, matching the Figma redesign's chrome exactly.
//
// Outside taps and Escape never dismiss the sheet — only the X button does
// (and callers can intercept that via onRequestClose to show a "Discard
// changes?" prompt first). This matches the Figma spec, which always pairs
// an entry sheet with an explicit discard-confirmation step rather than a
// tap-outside-to-lose-your-input gesture.
export function MobileBottomSheet({ open, onOpenChange, onRequestClose, title, children, className, stacked }: MobileBottomSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 bg-black/25 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
            stacked ? "z-[60]" : "z-50"
          )}
        />
        <Dialog.Content
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className={cn(
            "wl-mobile fixed inset-x-0 bottom-0 flex max-h-[90svh] flex-col gap-3 rounded-t-2xl bg-wl-canvas px-6 pt-3 pb-6 outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom",
            stacked ? "z-[60]" : "z-50",
            className
          )}
        >
          <div className="flex shrink-0 justify-center">
            <div className="h-1 w-16 rounded-full bg-wl-disabled" />
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3">
            <Dialog.Title className="text-[20px] font-semibold leading-7 tracking-[-0.8px] text-wl-ink">{title}</Dialog.Title>
            <button
              type="button"
              onClick={onRequestClose ?? (() => onOpenChange(false))}
              className="flex size-11 shrink-0 items-center justify-center text-wl-ink"
            >
              <X className="size-5" strokeWidth={1.75} />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
