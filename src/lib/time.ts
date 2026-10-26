export type WallTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export function isValidWallTime(w: WallTime): boolean {
  if (![w.year, w.month, w.day, w.hour, w.minute].every(Number.isInteger))
    return false;
  const d = new Date(Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute));
  return (
    w.year >= 1900 &&
    w.year <= 2200 &&
    d.getUTCFullYear() === w.year &&
    d.getUTCMonth() === w.month - 1 &&
    d.getUTCDate() === w.day &&
    w.hour >= 0 &&
    w.hour <= 23 &&
    w.minute >= 0 &&
    w.minute <= 59
  );
}

function partsAt(date: Date, timezone: string): WallTime {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const n = (key: string) => Number(parts.find((p) => p.type === key)?.value);
  return {
    year: n("year"),
    month: n("month"),
    day: n("day"),
    hour: n("hour"),
    minute: n("minute"),
  };
}

function wallStamp(w: WallTime): number {
  return Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute);
}

/** Resolve a wall-clock value without relying on the computer's local timezone. */
export function wallTimeToISO(wall: WallTime, timezone: string): string | null {
  if (!isValidWallTime(wall)) return null;
  try {
    const desired = wallStamp(wall);
    let candidate = desired;
    for (let i = 0; i < 5; i++) {
      const actual = wallStamp(partsAt(new Date(candidate), timezone));
      if (actual === desired) return new Date(candidate).toISOString();
      candidate += desired - actual;
    }
    return null; // Nonexistent local time during a daylight-saving jump.
  } catch {
    return null;
  }
}

export function toDateTimeInput(iso: string, timezone: string): string {
  const p = partsAt(new Date(iso), timezone);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

export function fromDateTimeInput(
  value: string,
  timezone: string,
): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  return wallTimeToISO(
    { year: +m[1], month: +m[2], day: +m[3], hour: +m[4], minute: +m[5] },
    timezone,
  );
}

export function formatDeadline(
  iso: string,
  timezone: string,
): { date: string; time: string } {
  const d = new Date(iso);
  const clock = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZoneName: "short",
  }).formatToParts(d);
  const part = (type: string) =>
    clock.find((p) => p.type === type)?.value ?? "";
  const readableZones: Record<string, string> = {
    "Asia/Seoul": "KST",
    "Asia/Tokyo": "JST",
    "Asia/Kolkata": "IST",
    UTC: "UTC",
  };
  return {
    date: new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d),
    time: `${part("hour")}:${part("minute")} ${readableZones[timezone] ?? part("timeZoneName")}`,
  };
}

export function urgencyFor(
  deadline: string,
  now = Date.now(),
): "closed" | "urgent" | "soon" | "safe" {
  const remaining = new Date(deadline).getTime() - now;
  return remaining <= 0
    ? "closed"
    : remaining < 24 * 3600000
      ? "urgent"
      : remaining < 72 * 3600000
        ? "soon"
        : "safe";
}

export const urgencyLabel = {
  closed: "Closed",
  urgent: "Under 24 hours",
  soon: "Under 72 hours",
  safe: "Time on your side",
};
