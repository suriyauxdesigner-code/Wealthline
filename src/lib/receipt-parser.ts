// Best-effort extraction of expense fields from OCR'd payment-screenshot
// text (Google Pay / PhonePe / Paytm / bank UPI apps — layouts vary a lot,
// so every field here is optional and only set when a pattern is matched
// with reasonable confidence. Never guess: an unmatched field stays
// undefined so the Add Expense form simply leaves it blank for the user to
// fill in, per the "never leave a field looking confidently wrong" rule.
import { resolveMerchantIcon } from "./merchant-icons";

export interface ParsedReceipt {
  merchant?: string;
  amount?: number;
  /** yyyy-mm-dd */
  date?: string;
  /** HH:mm, 24-hour */
  time?: string;
  paymentMethod?: string;
  referenceId?: string;
  /** A category name (e.g. "Food") to try to match against the app's own categories — not a category id. */
  suggestedCategoryName?: string | null;
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const PAYMENT_METHODS = [
  "Google Pay",
  "GPay",
  "PhonePe",
  "Paytm",
  "Amazon Pay",
  "Credit Card",
  "Debit Card",
  "Net Banking",
  "NEFT",
  "IMPS",
  "RTGS",
  "UPI",
  "Wallet",
];

// Keyword -> category name, for merchants common on Indian UPI receipts.
// Matched directly against the extracted merchant text (not routed through
// Simple Icons brand resolution, which several of these — Amazon, Flipkart —
// aren't in at all) so a suggestion doesn't silently depend on icon coverage.
const CATEGORY_BY_KEYWORD: Record<string, string> = {
  swiggy: "Food", zomato: "Food", dunzo: "Food", bigbasket: "Food",
  mcdonalds: "Food", kfc: "Food", burgerking: "Food", starbucks: "Food", cocacola: "Food",
  ubereats: "Food",
  uber: "Transport", lyft: "Transport", ola: "Transport", rapido: "Transport",
  indigo: "Travel", airindia: "Travel", airbnb: "Travel", tripadvisor: "Travel", expedia: "Travel", oyo: "Travel", bookmyshow: "Entertainment",
  amazon: "Shopping", flipkart: "Shopping", myntra: "Shopping", zara: "Shopping", uniqlo: "Shopping", ajio: "Shopping", nykaa: "Shopping",
  nike: "Shopping", adidas: "Shopping", puma: "Shopping", underarmour: "Shopping", ikea: "Shopping", ebay: "Shopping", etsy: "Shopping",
  netflix: "Entertainment", spotify: "Entertainment", youtube: "Entertainment", youtubemusic: "Entertainment", applemusic: "Entertainment", soundcloud: "Entertainment", hbo: "Entertainment", hotstar: "Entertainment",
  airtel: "Bills", jio: "Bills", vodafone: "Bills",
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function suggestCategoryName(merchant: string): string | null {
  const normalized = normalize(merchant);
  if (!normalized) return null;
  const keywords = Object.keys(CATEGORY_BY_KEYWORD).sort((a, b) => b.length - a.length);
  for (const keyword of keywords) {
    if (normalized.includes(keyword)) return CATEGORY_BY_KEYWORD[keyword];
  }
  return null;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function extractAmount(text: string): number | undefined {
  // ₹ is a rarer glyph for OCR engines to recognize reliably — it's
  // commonly dropped entirely or misread as "$", so that's treated as an
  // equally valid prefix here (this app only ever deals in INR).
  const prefixed = text.match(/(?:₹|\$|rs\.?|inr)\s*([\d][\d,]*(?:\.\d{1,2})?)/i);
  if (prefixed) {
    const value = Number(prefixed[1].replace(/,/g, ""));
    if (Number.isFinite(value) && value > 0) return value;
  }

  // Fallback: a comma-grouped number (e.g. "1,997") with no currency symbol
  // at all in front of it, which is how the amount often ends up after OCR
  // drops ₹ entirely. Comma-grouping is specific enough (UPI refs, phone
  // numbers, timestamps don't have it) to trust without a prefix.
  const grouped = text.match(/\b\d{1,3}(?:,\d{2,3})+(?:\.\d{1,2})?\b/);
  if (grouped) {
    const value = Number(grouped[0].replace(/,/g, ""));
    if (Number.isFinite(value) && value > 0) return value;
  }

  return undefined;
}

function extractDate(text: string): string | undefined {
  const monthName = text.match(
    /\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s+(\d{4})\b/i
  );
  if (monthName) {
    const day = Number(monthName[1]);
    const month = MONTHS[monthName[2].toLowerCase()];
    const year = Number(monthName[3]);
    if (day >= 1 && day <= 31 && month) return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  const numeric = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]);
    let year = Number(numeric[3]);
    if (year < 100) year += 2000;
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  // "September 8 at 11:05 AM" — many apps only show month + day for a
  // recent transaction, with no year in sight. Assumed to be the current
  // year, since a screenshot is realistically uploaded shortly after payment.
  const monthDayOnly = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/i);
  if (monthDayOnly) {
    const month = MONTHS[monthDayOnly[1].toLowerCase()];
    const day = Number(monthDayOnly[2]);
    if (day >= 1 && day <= 31 && month) return `${new Date().getFullYear()}-${pad2(month)}-${pad2(day)}`;
  }

  return undefined;
}

function extractTime(text: string): string | undefined {
  // A phone's own status-bar clock (e.g. "10:13" at the very top of every
  // screenshot) almost never carries an am/pm suffix, while an app quoting
  // its own transaction time nearly always does ("at 11:05 AM") — so an
  // am/pm-suffixed match is preferred, and a bare HH:MM is only trusted if
  // it isn't the leading line (where the status bar clock lives).
  const withMeridiem = text.match(/\b(\d{1,2}):(\d{2})\s*(am|pm)\b/i);
  const match = withMeridiem ?? text.match(/\n(\d{1,2}):(\d{2})\b/);
  if (!match) return undefined;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toLowerCase();
  if (hour > 23 || minute > 59) return undefined;
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  return `${pad2(hour)}:${pad2(minute)}`;
}

function extractPaymentMethod(text: string): string | undefined {
  for (const method of PAYMENT_METHODS) {
    if (new RegExp(`\\b${method.replace(/\s+/g, "\\s*")}\\b`, "i").test(text)) return method;
  }
  return undefined;
}

function extractReferenceId(text: string): string | undefined {
  const match = text.match(
    /(?:UPI\s*(?:ref(?:erence)?\.?\s*no\.?|transaction\s*id)|txn\s*id|transaction\s*id|reference\s*(?:no\.?|number))\s*[:\-]?\s*([A-Za-z0-9]{6,25})/i
  );
  return match?.[1];
}

// UI chrome words that can end up looking like a capitalized "name" near the
// top of a screenshot (nav bar buttons, page furniture) — never the merchant.
const HEADER_JUNK_WORDS = new Set([
  "help", "back", "share", "done", "ok", "cancel", "home", "view", "more",
  "menu", "close", "settings", "receipt", "invoice",
]);

// Multi-word status/boilerplate phrases — these pass the "2+ capitalized
// words" bar too, so they need their own exact-match filter.
const HEADER_JUNK_PHRASES = new Set([
  "payment successful", "payment failed", "payment pending",
  "transaction successful", "transaction failed", "transaction pending",
  "past transactions", "payment method", "upi reference", "check balance",
]);

function isPlausibleMerchantText(candidate: string): boolean {
  return !/@/.test(candidate) && !/\d/.test(candidate) && candidate.trim().length >= 2;
}

/**
 * Every run of Capitalized Words in `line`. A single capitalized word is
 * indistinguishable from an ordinary sentence's first word (English
 * capitalization, not a brand signal), so those are only kept when they
 * match a merchant we actually recognize; a multi-word run ("Amazon
 * India", "Axis Bank") is a much stronger signal on its own and is kept
 * regardless.
 */
function capitalizedRuns(line: string): string[] {
  const runs = line.match(/[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,3}/g) ?? [];
  return runs.filter((run) => {
    if (HEADER_JUNK_PHRASES.has(run.toLowerCase())) return false;
    const words = run.split(/\s+/);
    if (words.length > 1) return true;
    const word = words[0];
    if (word.length < 3 || HEADER_JUNK_WORDS.has(word.toLowerCase())) return false;
    return !!resolveMerchantIcon(word);
  });
}

function extractMerchant(text: string): string | undefined {
  const labeled = text.match(/(?:paid\s*to|sent\s*to|payment\s*to)\s*[:\-]?\s*\n?\s*([A-Za-z][A-Za-z0-9&.,'\- ]{1,40}?)(?:\n|$)/i);
  if (labeled && isPlausibleMerchantText(labeled[1])) return labeled[1].trim();

  const lineStart = text.match(/^to\s*[:\-]\s*([A-Za-z][A-Za-z0-9&.,'\- ]{1,40}?)\s*$/im);
  if (lineStart && isPlausibleMerchantText(lineStart[1])) return lineStart[1].trim();

  // Fall back to the page header: many payment apps title the screen with
  // the merchant's name (e.g. "Amazon India") rather than repeating it next
  // to "Paid to", which instead shows a UPI ID/bank there. Skip a leading
  // status-bar line (phone clock, e.g. "10:13 ...") and pick the strongest
  // candidate across the next few lines — most words first, then longest —
  // so multi-word brand names beat short OCR noise from nav-bar icons.
  const firstLines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^\d{1,2}:\d{2}\b/.test(l))
    .slice(0, 3);

  const candidates = firstLines.flatMap(capitalizedRuns);
  candidates.sort((a, b) => b.split(/\s+/).length - a.split(/\s+/).length || b.length - a.length);
  return candidates[0];
}

export function parseReceiptText(text: string): ParsedReceipt {
  const merchant = extractMerchant(text);

  return {
    merchant,
    amount: extractAmount(text),
    date: extractDate(text),
    time: extractTime(text),
    paymentMethod: extractPaymentMethod(text),
    referenceId: extractReferenceId(text),
    suggestedCategoryName: merchant ? suggestCategoryName(merchant) : null,
  };
}
