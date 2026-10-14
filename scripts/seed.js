import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { STATUSES } from "../src/js/constants.js";

const DAY = 24 * 60 * 60 * 1000;
const DEFAULT_ANCHOR = Date.UTC(2026, 9, 13, 12);
const DEFAULT_SEED = 1403;
const TRANSACTION_COUNT = 80;
const RECENT_COUNT = 12;
const RECENT_DAYS = 3;
const HISTORY_DAYS = 365;

const OWNER_NAMES = [
  "سارا محمدی",
  "علی رضایی",
  "مریم حسینی",
  "رضا کریمی",
  "نگار احمدی",
  "امیر جعفری",
  "زهرا موسوی",
  "حسین نوری",
];

// Toman ranges are rounded to `step` so amounts look like real receipts.
const TYPE_PROFILES = [
  { type: "افزایش اعتبار", weight: 14, min: 100_000, max: 10_000_000, step: 50_000 },
  { type: "واریز حقوق", weight: 4, min: 8_000_000, max: 40_000_000, step: 500_000 },
  { type: "بازگشت وجه", weight: 5, min: 20_000, max: 2_000_000, step: 1_000 },
  { type: "برداشت از حساب", weight: 10, min: 100_000, max: 10_000_000, step: 50_000 },
  { type: "انتقال کارت به کارت", weight: 18, min: 10_000, max: 20_000_000, step: 10_000 },
  { type: "خرید", weight: 22, min: 20_000, max: 5_000_000, step: 1_000 },
  { type: "پرداخت قبض", weight: 12, min: 30_000, max: 2_000_000, step: 1_000 },
  { type: "کارمزد", weight: 8, min: 500, max: 20_000, step: 500 },
];

// Pending only happens close to "now"; older transactions have settled.
const RECENT_STATUS_WEIGHTS = { success: 2, pending: 7, failed: 1 };
const SETTLED_STATUS_WEIGHTS = { success: 92, pending: 0, failed: 8 };

// DiceBear draws the same face for the same seed, so each owner keeps theirs across re-seeds.
const avatarUrl = (userId) =>
  `https://api.dicebear.com/11.x/notionists/svg?seed=${encodeURIComponent(`owner-${userId}`)}`;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateDb({ seed = DEFAULT_SEED, anchor = DEFAULT_ANCHOR } = {}) {
  const random = mulberry32(seed);
  const between = (min, max) => min + Math.floor(random() * (max - min + 1));
  const pickWeighted = (entries) => {
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = random() * total;
    for (const [value, weight] of entries) {
      roll -= weight;
      if (roll < 0) return value;
    }
    return entries.at(-1)[0];
  };

  const users = OWNER_NAMES.map((name, index) => ({
    id: index + 1,
    name,
    phone: `09${between(10, 39)}${String(between(0, 9_999_999)).padStart(7, "0")}`,
    avatar: avatarUrl(index + 1),
  }));

  const usedRefIds = new Set();
  const uniqueRefId = () => {
    let refId;
    do {
      refId = random() < 0.5 ? between(100_000_000, 999_999_999) : between(1_000_000_000, 9_999_999_999);
    } while (usedRefIds.has(refId));
    usedRefIds.add(refId);
    return refId;
  };

  const drafts = Array.from({ length: TRANSACTION_COUNT }, (_, index) => {
    const isRecent = index < RECENT_COUNT;
    const ageInDays = isRecent
      ? random() * RECENT_DAYS
      : RECENT_DAYS + random() * (HISTORY_DAYS - RECENT_DAYS);
    const profile = pickWeighted(TYPE_PROFILES.map((p) => [p, p.weight]));
    // Squaring skews amounts toward the low end, like real spending.
    const raw = profile.min + random() ** 2 * (profile.max - profile.min);
    const statusWeights = isRecent ? RECENT_STATUS_WEIGHTS : SETTLED_STATUS_WEIGHTS;

    return {
      refId: uniqueRefId(),
      type: profile.type,
      price: Math.max(profile.min, Math.round(raw / profile.step) * profile.step),
      date: Math.round(anchor - ageInDays * DAY),
      status: pickWeighted(STATUSES.map((s) => [s.key, statusWeights[s.key]])),
      userId: between(1, users.length),
    };
  });

  const transactions = drafts
    .sort((a, b) => a.date - b.date)
    .map((transaction, index) => ({ id: index + 1, ...transaction }));

  return { users, transactions };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const target = new URL("../data/db.json", import.meta.url);
  writeFileSync(target, `${JSON.stringify(generateDb(), null, 2)}\n`);
  console.log(`Wrote ${fileURLToPath(target)}`);
}
