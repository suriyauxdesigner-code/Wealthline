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

// Brand -> category name, for the small set of merchants common on Indian
// UPI receipts. Extend alongside merchant-icons.ts's own list.
const CATEGORY_BY_BRAND_SLUG: Record<string, string> = {
  swiggy: "Food", zomato: "Food", dunzo: "Food", bigbasket: "Food",
  mcdonalds: "Food", kfc: "Food", burgerking: "Food", starbucks: "Food", cocacola: "Food",
  ubereats: "Food",
  uber: "Transport", lyft: "Transport",
  indigo: "Travel", airindia: "Travel", airbnb: "Travel", tripadvisor: "Travel", expedia: "Travel", oyo: "Travel", bookmyshow: "Entertainment",
  amazon: "Shopping", flipkart: "Shopping", myntra: "Shopping", zara: "Shopping", uniqlo: "Shopping",
  nike: "Shopping", adidas: "Shopping", puma: "Shopping", underarmour: "Shopping", ikea: "Shopping", ebay: "Shopping", etsy: "Shopping",
  netflix: "Entertainment", spotify: "Entertainment", youtube: "Entertainment", youtubemusic: "Entertainment", applemusic: "Entertainment", soundcloud: "Entertainment", hbo: "Entertainment",
  airtel: "Bills", jio: "Bills", vodafone: "Bills",
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function extractAmount(text: string): number | undefined {
  const match = text.match(/(?:₹|rs\.?|inr)\s*([\d][\d,]*(?:\.\d{1,2})?)/i);
  if (!match) return undefined;
  const value = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(value) && value > 0 ? value : undefined;
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

  return undefined;
}

function extractTime(text: string): string | undefined {
  const match = text.match(/\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/i);
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

function extractMerchant(text: string): string | undefined {
  const labeled = text.match(/(?:paid\s*to|sent\s*to|payment\s*to)\s*[:\-]?\s*\n?\s*([A-Za-z][A-Za-z0-9&.,'\- ]{1,40}?)(?:\n|$)/i);
  if (labeled) return labeled[1].trim();

  const lineStart = text.match(/^to\s*[:\-]\s*([A-Za-z][A-Za-z0-9&.,'\- ]{1,40}?)\s*$/im);
  if (lineStart) return lineStart[1].trim();

  return undefined;
}

export function parseReceiptText(text: string): ParsedReceipt {
  const merchant = extractMerchant(text);
  const brand = merchant ? resolveMerchantIcon(merchant) : null;

  return {
    merchant,
    amount: extractAmount(text),
    date: extractDate(text),
    time: extractTime(text),
    paymentMethod: extractPaymentMethod(text),
    referenceId: extractReferenceId(text),
    suggestedCategoryName: brand ? CATEGORY_BY_BRAND_SLUG[brand.slug] ?? null : null,
  };
}
