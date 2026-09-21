// Merchant name -> brand logo, backed by Simple Icons (simpleicons.org).
//
// Each icon is a named import from "simple-icons" rather than a dynamic
// lookup into the whole package, so the bundler can tree-shake every icon
// we don't reference here — only the ones below ship to the client.
//
// To add a merchant: import its `si<Name>` icon and add one entry to
// MERCHANT_ICONS. `keywords` defaults to the icon's own title if omitted;
// add extra keywords for common aliases (e.g. "gpay" for Google Pay).
import {
  siSwiggy,
  siZomato,
  siDunzo,
  siBigbasket,
  siUbereats,
  siUber,
  siLyft,
  siDoordash,
  siInstacart,
  siNetflix,
  siSpotify,
  siYoutube,
  siYoutubemusic,
  siApplemusic,
  siSoundcloud,
  siHbo,
  siAirbnb,
  siTripadvisor,
  siExpedia,
  siIndigo,
  siAirindia,
  siBookmyshow,
  siPaypal,
  siGooglepay,
  siPhonepe,
  siPaytm,
  siRazorpay,
  siStripe,
  siVisa,
  siMastercard,
  siAmericanexpress,
  siHdfcbank,
  siIcicibank,
  siAxisbank,
  siAirtel,
  siJio,
  siVodafone,
  siStarbucks,
  siMcdonalds,
  siKfc,
  siBurgerking,
  siCocacola,
  siNike,
  siAdidas,
  siPuma,
  siUnderarmour,
  siZara,
  siUniqlo,
  siIkea,
  siApple,
  siGoogle,
  siSamsung,
  siOneplus,
  siXiaomi,
  siLg,
  siSony,
  siDell,
  siHp,
  siLenovo,
  siEtsy,
  siEbay,
  type SimpleIcon,
} from "simple-icons";

export type { SimpleIcon };

interface MerchantIconEntry {
  icon: SimpleIcon;
  /** Extra match terms beyond the icon's own title (e.g. common abbreviations). */
  aliases?: string[];
}

const MERCHANT_ICONS: MerchantIconEntry[] = [
  { icon: siSwiggy },
  { icon: siZomato },
  { icon: siDunzo },
  { icon: siBigbasket },
  { icon: siUbereats, aliases: ["uber eats"] },
  { icon: siUber },
  { icon: siLyft },
  { icon: siDoordash },
  { icon: siInstacart },
  { icon: siNetflix },
  { icon: siSpotify },
  { icon: siYoutubemusic, aliases: ["youtube music"] },
  { icon: siYoutube },
  { icon: siApplemusic, aliases: ["apple music"] },
  { icon: siSoundcloud },
  { icon: siHbo },
  { icon: siAirbnb },
  { icon: siTripadvisor },
  { icon: siExpedia },
  { icon: siIndigo, aliases: ["goindigo"] },
  { icon: siAirindia, aliases: ["air india"] },
  { icon: siBookmyshow },
  { icon: siPaypal },
  { icon: siGooglepay, aliases: ["gpay", "google pay"] },
  { icon: siPhonepe },
  { icon: siPaytm },
  { icon: siRazorpay },
  { icon: siStripe },
  { icon: siVisa },
  { icon: siMastercard },
  { icon: siAmericanexpress, aliases: ["amex"] },
  { icon: siHdfcbank, aliases: ["hdfc"] },
  { icon: siIcicibank, aliases: ["icici"] },
  { icon: siAxisbank, aliases: ["axis bank"] },
  { icon: siAirtel },
  { icon: siJio },
  { icon: siVodafone },
  { icon: siStarbucks },
  { icon: siMcdonalds, aliases: ["mcd"] },
  { icon: siKfc },
  { icon: siBurgerking },
  { icon: siCocacola, aliases: ["coke"] },
  { icon: siNike },
  { icon: siAdidas },
  { icon: siPuma },
  { icon: siUnderarmour, aliases: ["under armour"] },
  { icon: siZara },
  { icon: siUniqlo },
  { icon: siIkea },
  { icon: siApple },
  { icon: siGoogle },
  { icon: siSamsung },
  { icon: siOneplus, aliases: ["one plus"] },
  { icon: siXiaomi, aliases: ["mi"] },
  { icon: siLg },
  { icon: siSony },
  { icon: siDell },
  { icon: siHp },
  { icon: siLenovo },
  { icon: siEtsy },
  { icon: siEbay },
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

interface Candidate {
  keyword: string;
  icon: SimpleIcon;
}

const CANDIDATES: Candidate[] = MERCHANT_ICONS.flatMap((entry) => {
  const terms = [entry.icon.title, ...(entry.aliases ?? [])];
  return terms.map((term) => ({ keyword: normalize(term), icon: entry.icon }));
}).sort((a, b) => b.keyword.length - a.keyword.length);

/**
 * Resolves a free-typed merchant name (e.g. "Swiggy order #4821") to a brand
 * logo, or null if nothing in the curated list matches. Exact matches on a
 * short/ambiguous name (like "HP" or "LG") are trusted; a substring match is
 * only accepted for keywords of 4+ characters, longest first, so e.g. "Uber
 * Eats" resolves to the Uber Eats mark rather than the shorter "Uber" one.
 */
export function resolveMerchantIcon(merchant: string): SimpleIcon | null {
  const normalized = normalize(merchant);
  if (!normalized) return null;

  for (const c of CANDIDATES) {
    if (c.keyword === normalized) return c.icon;
  }
  for (const c of CANDIDATES) {
    if (c.keyword.length >= 4 && normalized.includes(c.keyword)) return c.icon;
  }
  return null;
}

/** Up to two initials for a merchant name, used when no logo matches. */
export function merchantInitials(merchant: string): string {
  const words = merchant.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
