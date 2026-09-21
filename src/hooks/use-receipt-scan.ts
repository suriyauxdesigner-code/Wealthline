"use client";

import * as React from "react";
import { toast } from "sonner";

import { extractReceiptText } from "@/lib/receipt-ocr";
import { parseReceiptText, type ParsedReceipt } from "@/lib/receipt-parser";

// Reusable "upload a payment screenshot" pipeline: OCR it, run the
// heuristic field parser, and report what (if anything) was found — never
// throws, callers just get `null` back for a field it couldn't confidently
// read and are expected to pre-fill their own form state and let the user
// review it, not save anything automatically.
export function useReceiptScan() {
  const [scanning, setScanning] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  async function scan(file: File): Promise<ParsedReceipt | null> {
    setScanning(true);
    setProgress(0);
    try {
      const text = await extractReceiptText(file, setProgress);
      const parsed = parseReceiptText(text);
      const headline = [parsed.merchant, parsed.amount ? `₹${parsed.amount.toLocaleString("en-IN")}` : null].filter(Boolean);
      const anyField = headline.length > 0 || parsed.date || parsed.paymentMethod || parsed.referenceId;

      if (!anyField) {
        toast("Couldn't read much from that screenshot", { description: "Fill in the details below." });
      } else if (headline.length > 0) {
        toast.success("Screenshot scanned", { description: `Detected ${headline.join(" · ")} — please review before saving.` });
      } else {
        toast.success("Screenshot scanned", { description: "Found some details, but not the merchant or amount — please review before saving." });
      }
      return parsed;
    } catch {
      toast.error("Couldn't read that screenshot", { description: "Fill in the details manually." });
      return null;
    } finally {
      setScanning(false);
    }
  }

  return { scanning, progress, scan };
}
