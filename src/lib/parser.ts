import type { ParsedAnnouncement } from "../types";
import { isValidWallTime, wallTimeToISO, type WallTime } from "./time";

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];
const MONTH =
  "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const ZONE =
  /\b(EDT|EST|ET|PDT|PST|PT|CDT|CST|CT|MDT|MST|MT|UTC|GMT|KST|JST|CEST|CET|BST|IST)\b/i;
const REGIONAL: Record<string, string> = {
  ET: "America/New_York",
  PT: "America/Los_Angeles",
  CT: "America/Chicago",
  MT: "America/Denver",
};
const OFFSETS: Record<string, number> = {
  EDT: -240,
  EST: -300,
  PDT: -420,
  PST: -480,
  CDT: -300,
  CST: -360,
  MDT: -360,
  MST: -420,
  UTC: 0,
  GMT: 0,
  KST: 540,
  JST: 540,
  CET: 60,
  CEST: 120,
  BST: 60,
  IST: 330,
};
const TIME = /(?:\b|T)(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?(?!\w)/gi;

function readTime(text: string) {
  for (const match of text.matchAll(new RegExp(TIME))) {
    if (!match[2] && !match[3]) continue; // Dates/year numbers are not clock times.
    const meridian = match[3]?.toLowerCase().replaceAll(".", "");
    let hour = Number(match[1]);
    const minute = Number(match[2] ?? 0);
    if (
      (meridian && (hour < 1 || hour > 12)) ||
      (!meridian && hour > 23) ||
      minute > 59
    ) {
      return { invalid: true, hour, minute, match };
    }
    if (meridian) hour = (hour % 12) + (meridian === "pm" ? 12 : 0);
    return { invalid: false, hour, minute, match };
  }
  return null;
}

export function extractRequirements(text: string): string[] {
  return [
    [/\b(video|demo\s+(?:recording|reel))\b/i, "Record demo video"],
    [
      /\b(github|gitlab|repo(?:sitory|sitories)?|source\s+code)\b/i,
      "Publish public repository",
    ],
    [
      /\b(description|project\s+(?:summary|write[ -]?up))\b/i,
      "Write project description",
    ],
    [/\b(slides?|slide\s*deck|pitch\s*deck)\b/i, "Prepare presentation slides"],
    [/\bpdf\b/i, "Attach PDF document"],
  ]
    .filter(([pattern]) => (pattern as RegExp).test(text))
    .map(([, label]) => label as string);
}

type DateMatch = {
  index: number;
  raw: string;
  year: number;
  month: number;
  day: number;
  assumedYear: boolean;
};

function findDates(text: string, now: Date): DateMatch[] {
  const results: DateMatch[] = [];
  const patterns = [
    { regex: /\b(\d{4})-(\d{2})-(\d{2})(?=T|\b)/g, kind: "iso" },
    {
      regex: new RegExp(
        `\\b(${MONTH})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?\\b`,
        "gi",
      ),
      kind: "month",
    },
    {
      regex: new RegExp(
        `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTH})\\.?(?:,?\\s+(\\d{4}))?\\b`,
        "gi",
      ),
      kind: "day",
    },
  ];
  for (const { regex, kind } of patterns) {
    for (const m of text.matchAll(regex)) {
      const monthName = kind === "month" ? m[1] : m[2];
      results.push({
        index: m.index!,
        raw: m[0],
        year: kind === "iso" ? +m[1] : m[3] ? +m[3] : now.getFullYear(),
        month:
          kind === "iso"
            ? +m[2]
            : MONTHS.indexOf(monthName.slice(0, 3).toLowerCase()) + 1,
        day: kind === "iso" ? +m[3] : +(kind === "month" ? m[2] : m[1]),
        assumedYear: kind !== "iso" && !m[3],
      });
    }
  }
  return results.sort((a, b) => a.index - b.index);
}

export function parseAnnouncement(
  text: string,
  fallbackZone = "Asia/Seoul",
  now = new Date(),
): ParsedAnnouncement {
  const result: ParsedAnnouncement = {
    title:
      text
        .split(/\r?\n/)
        .map((s) => s.trim())
        .find(Boolean)
        ?.replace(/^#+\s*/, "")
        .slice(0, 100) || "Untitled contest",
    deadline: null,
    snippet: "",
    sourceZone: "",
    notes: [],
    requirements: extractRequirements(text),
  };
  const dates = findDates(text, now);
  const candidates = dates
    .map((date, index) => {
      const after = text.slice(
        date.index + date.raw.length,
        Math.min(
          dates[index + 1]?.index ?? text.length,
          date.index + date.raw.length + 140,
        ),
      );
      const time = readTime(after);
      const lineStart = text.lastIndexOf("\n", date.index) + 1;
      const before = text.slice(
        Math.max(lineStart, date.index - 100),
        date.index,
      );
      const score =
        /deadline|submi(?:ssion|t).*?(?:by|close|due)|closes?|due\b/i.test(
          before,
        )
          ? 10
          : 0;
      return { date, after, time, score };
    })
    .filter((c) => c.time)
    .sort((a, b) => b.score - a.score || a.date.index - b.date.index);

  if (!candidates.length) {
    const time = readTime(text);
    result.snippet = time
      ? text
          .slice(time.match.index!, time.match.index! + 50)
          .split("\n")[0]
          .trim()
      : "";
    result.sourceZone = result.snippet.match(ZONE)?.[1].toUpperCase() ?? "";
    result.notes.push(
      time
        ? "A time was found, but a full date and time could not be paired. Set the deadline manually."
        : "No complete deadline found. Set the date and time manually.",
    );
    return result;
  }
  const { date, after, time } = candidates[0];
  if (!time) return result;
  const tail = after.slice(time.match.index! + time.match[0].length);
  const zoneMatch = /^\s*(?:\(\s*)?([A-Za-z]{2,5})\b/.exec(tail);
  const foundZone = zoneMatch?.[1]?.toUpperCase();
  const knownZone =
    foundZone && (foundZone in REGIONAL || foundZone in OFFSETS);
  // Only consume a timezone adjacent to this clock time, never a later unrelated sentence.
  const zone = knownZone ? foundZone! : "";
  const snippetEnd =
    date.index +
    date.raw.length +
    time.match.index! +
    time.match[0].length +
    (zone ? zoneMatch![0].length : 0);
  result.snippet = text.slice(date.index, snippetEnd).trim();
  result.sourceZone = zone || fallbackZone;
  if (zone && /^[\s)]*[+-]\d/.test(tail.slice(zoneMatch![0].length))) {
    result.notes.push(
      "An explicit numeric timezone offset was found. This parser supports abbreviations only; set the deadline manually.",
    );
    return result;
  }
  if (date.assumedYear)
    result.notes.push(
      `No year supplied; using ${date.year}. Verify the year before saving.`,
    );
  if (!zone) {
    if (
      foundZone &&
      /^[A-Z]{2,5}$/.test(zoneMatch![1]) &&
      !["AT", "ON", "THE", "AND", "WITH", "FOR"].includes(foundZone)
    ) {
      result.notes.push(
        `Timezone ${foundZone} is not supported. Set the deadline manually in your display timezone.`,
      );
      return result;
    }
    result.notes.push(
      `No timezone supplied; interpreted in ${fallbackZone}. Verify before saving.`,
    );
  }
  if (candidates.length > 1)
    result.notes.push(
      "Multiple date/time pairs found; prioritized a deadline or closing phrase. Verify the source.",
    );
  const wall: WallTime = {
    year: date.year,
    month: date.month,
    day: date.day,
    hour: time.hour,
    minute: time.minute,
  };
  if (time.invalid || !isValidWallTime(wall)) {
    result.notes.push(
      "The source has an invalid calendar date or clock time. Correct it manually.",
    );
    return result;
  }
  if (REGIONAL[zone]) {
    result.deadline = wallTimeToISO(wall, REGIONAL[zone]);
    result.notes.push(
      `${zone} uses ${REGIONAL[zone]} daylight-saving rules for this date. Clock-change hours can be ambiguous; verify with the organizer.`,
    );
  } else if (zone in OFFSETS) {
    result.deadline = new Date(
      Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute) -
        OFFSETS[zone] * 60000,
    ).toISOString();
  } else {
    result.deadline = wallTimeToISO(wall, fallbackZone);
  }
  if (zone === "IST")
    result.notes.push("IST is interpreted as India Standard Time (UTC+05:30).");
  if (zone === "BST")
    result.notes.push("BST is interpreted as British Summer Time (UTC+01:00).");
  if (!result.deadline)
    result.notes.push(
      "This local time does not exist in that timezone (clock change). Set a valid time manually.",
    );
  return result;
}
