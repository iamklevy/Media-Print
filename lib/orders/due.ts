const DAY_MS = 86_400_000;

/** `estimated_delivery` is a Postgres `date` ("2026-10-25") — read it as local midnight, not UTC. */
export function parseDay(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfDay(ms: number): Date {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Whole calendar days from today to the delivery date: 0 = today, negative = late. */
export function daysUntil(value: string, now: number): number {
  return Math.round((parseDay(value).getTime() - startOfDay(now).getTime()) / DAY_MS);
}
