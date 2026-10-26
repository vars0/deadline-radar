import type { Contest } from "../types";

const KEY = "deadline-radar:v1";
export type StoredData = { version: 1; timezone: string; contests: Contest[] };

function validTimezone(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function validContest(value: unknown): value is Contest {
  if (!value || typeof value !== "object") return false;
  const c = value as Contest;
  return (
    ["id", "title", "deadline", "sourceText", "snippet", "sourceZone"].every(
      (k) => typeof c[k as keyof Contest] === "string",
    ) &&
    c.id.length > 0 &&
    c.title.trim().length > 0 &&
    Number.isFinite(Date.parse(c.deadline)) &&
    Array.isArray(c.notes) &&
    c.notes.every((n) => typeof n === "string") &&
    Array.isArray(c.checklist) &&
    c.checklist.every(
      (i) =>
        i &&
        typeof i.id === "string" &&
        typeof i.label === "string" &&
        typeof i.done === "boolean",
    )
  );
}

export function readStorage(): { data: StoredData; error: string } {
  const fallback: StoredData = {
    version: 1,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul",
    contests: [],
  };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { data: fallback, error: "" };
    const parsed = JSON.parse(raw);
    if (
      parsed.version !== 1 ||
      !validTimezone(parsed.timezone) ||
      !Array.isArray(parsed.contests)
    )
      throw new Error("Invalid saved data");
    const contests = parsed.contests.filter(validContest);
    const unique = contests.filter(
      (c: Contest, i: number) =>
        contests.findIndex((v: Contest) => v.id === c.id) === i,
    );
    return {
      data: { version: 1, timezone: parsed.timezone, contests: unique },
      error:
        unique.length === parsed.contests.length
          ? ""
          : "Some saved entries could not be read. Valid contests are still available.",
    };
  } catch {
    return {
      data: fallback,
      error:
        "Saved data could not be read. You can still track contests this session. Saving will replace unreadable data.",
    };
  }
}

export function writeStorage(data: StoredData): string {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return "";
  } catch {
    return "Browser storage is unavailable or full. Changes are kept for this session only.";
  }
}
