/**
 * Bookable days and times, shared by the booking form (to offer them) and the
 * server action (to refuse anything else). All dates are Cairo calendar days
 * as "YYYY-MM-DD"; the workshop is open Saturday–Thursday, 10:00–18:00.
 */

const TZ = "Africa/Cairo";
const FRIDAY = 5;
/** how many working days ahead the form offers */
export const BOOKING_DAYS_AHEAD = 10;
/** the server accepts a little further out, so a page left open for a while still books */
const MAX_DAYS_AHEAD = 30;

/** meeting start times, every 30 minutes, the last one leaving half an hour before closing */
export const BOOKING_SLOTS = Array.from({ length: 16 }, (_, i) => {
  const mins = 10 * 60 + i * 30;
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${mins % 60 === 0 ? "00" : "30"}`;
});

/** today's date in Cairo */
export function cairoToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
}

function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const weekday = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay();

/** the next working days, starting tomorrow (same-day meetings are arranged by phone) */
export function bookableDays(now = new Date(), count = BOOKING_DAYS_AHEAD): string[] {
  const days: string[] = [];
  let d = cairoToday(now);
  while (days.length < count) {
    d = addDays(d, 1);
    if (weekday(d) !== FRIDAY) days.push(d);
  }
  return days;
}

export function isBookable(date: string, time: string, now = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return false;
  if (!BOOKING_SLOTS.includes(time)) return false;
  if (weekday(date) === FRIDAY) return false;
  const today = cairoToday(now);
  return date > today && date <= addDays(today, MAX_DAYS_AHEAD);
}
