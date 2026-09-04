import type { Transaction, TransactionCategory, TransactionStatus } from "../types";
import { addDays, toISODate } from "../date";
import { between, createRandom, intBetween, pick, pickWeighted } from "./random";

const FIRST_NAMES = [
  "Nadia", "Rizky", "Dewi", "Bagus", "Sari", "Fajar", "Anisa", "Yoga",
  "Putri", "Adit", "Maya", "Bima", "Laras", "Reza", "Intan", "Galih",
  "Citra", "Arif", "Tania", "Hendra", "Zahra", "Dimas", "Rani", "Iqbal",
  "Melati", "Surya", "Kirana", "Farel",
] as const;

const LAST_NAMES = [
  "Putri", "Pratama", "Wijaya", "Santoso", "Halim", "Nugroho", "Maharani",
  "Kusuma", "Saputra", "Anggraini", "Hidayat", "Lestari", "Ramadhan",
  "Wibowo", "Purnama", "Setiawan", "Rahayu", "Firmansyah", "Utami", "Salim",
] as const;

const STATUSES: readonly TransactionStatus[] = ["paid", "pending", "failed", "refunded"];
/** Most transactions clear; a realistic tail of pending, failed and refunded. */
const STATUS_WEIGHTS = [66, 16, 10, 8];

const CATEGORIES: readonly TransactionCategory[] = [
  "Subscription",
  "Renewal",
  "Upgrade",
  "One-time Purchase",
  "Add-on",
];
const CATEGORY_WEIGHTS = [38, 22, 14, 17, 9];

/** Plan-shaped prices per category, so amounts look like a real price list. */
const AMOUNTS: Record<TransactionCategory, readonly number[]> = {
  Subscription: [149_000, 299_000, 499_000, 749_000],
  Renewal: [1_490_000, 2_990_000, 4_990_000, 299_000],
  Upgrade: [150_000, 200_000, 250_000, 450_000, 900_000],
  "One-time Purchase": [250_000, 480_000, 750_000, 1_250_000, 2_400_000, 3_500_000],
  "Add-on": [39_000, 59_000, 89_000, 129_000],
};

/**
 * Builds the transactions table. Rows are spread across the last
 * `windowDays` with a mild recency bias, then sorted oldest-first and given
 * sequential ids — so an id roughly tracks when the transaction happened.
 */
export function buildTransactions(
  count: number,
  endDate: Date,
  windowDays: number,
): Transaction[] {
  const rand = createRandom(770_311);

  const rows = Array.from({ length: count }, () => {
    const recencyBias = between(rand, 0, 1) ** 1.35;
    const daysBack = Math.min(windowDays - 1, Math.floor(recencyBias * windowDays));
    const category = pickWeighted(rand, CATEGORIES, CATEGORY_WEIGHTS);
    const base = pick(rand, AMOUNTS[category]);
    // Nudge a few amounts off the list price (seats, proration, discounts).
    const seats = rand() > 0.78 ? intBetween(rand, 2, 5) : 1;

    return {
      date: toISODate(addDays(endDate, -daysBack)),
      customer: `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`,
      category,
      amount: base * seats,
      status: pickWeighted(rand, STATUSES, STATUS_WEIGHTS),
    };
  });

  rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  return rows.map((row, i) => ({ id: `TRX-${10_237 + i}`, ...row }));
}
