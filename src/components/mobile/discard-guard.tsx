"use client";

import * as React from "react";

import { MobileBottomSheet } from "./bottom-sheet";

// Snapshots `current` on first render and reports whether any field has
// since changed — used to decide whether closing a sheet needs a discard
// confirmation (untouched fields close immediately).
export function useIsDirty<T extends Record<string, unknown>>(current: T): boolean {
  const [initial] = React.useState(current);
  return Object.keys(current).some((key) => current[key] !== initial[key]);
}

// Shared close-guard for every mobile entry/edit sheet: tapping X calls
// requestClose(); if isDirty, that opens a "Discard <noun>?" confirmation
// (matching Figma's Add-expense spec) instead of closing right away.
export function useDiscardGuard(isDirty: boolean, onDiscard: () => void) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  function requestClose() {
    if (isDirty) setConfirmOpen(true);
    else onDiscard();
  }

  function keepEditing() {
    setConfirmOpen(false);
  }

  function discardChanges() {
    setConfirmOpen(false);
    onDiscard();
  }

  return { confirmOpen, requestClose, keepEditing, discardChanges };
}

export function MobileDiscardSheet({
  open,
  noun,
  onKeepEditing,
  onDiscard,
}: {
  open: boolean;
  /** e.g. "expense", "budget", "goal" — used as "Discard {noun}?" */
  noun: string;
  onKeepEditing: () => void;
  onDiscard: () => void;
}) {
  return (
    <MobileBottomSheet
      open={open}
      onOpenChange={(v) => !v && onKeepEditing()}
      onRequestClose={onKeepEditing}
      title={`Discard ${noun}?`}
      stacked
    >
      <div className="flex flex-col gap-3">
        <p className="text-[14px] font-medium leading-5 text-wl-muted">Your changes haven&apos;t been saved.</p>
        <button
          type="button"
          onClick={onKeepEditing}
          className="mt-1 flex h-[52px] items-center justify-center rounded-lg bg-wl-accent text-[15px] font-semibold tracking-[-0.6px] text-white"
        >
          Keep editing
        </button>
        <button type="button" onClick={onDiscard} className="flex h-11 items-center justify-center text-[14px] font-semibold text-wl-error">
          Discard changes
        </button>
      </div>
    </MobileBottomSheet>
  );
}
