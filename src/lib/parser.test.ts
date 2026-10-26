import { describe, expect, it } from "vitest";
import { extractRequirements, parseAnnouncement } from "./parser";
import { fromDateTimeInput, toDateTimeInput, urgencyFor } from "./time";

describe("deadline parsing: the core near-miss", () => {
  it("converts Oct 26 5pm EDT to Oct 27 6am KST", () => {
    const r = parseAnnouncement(
      "Build With AI\nSubmission deadline: Oct 26, 2026 @ 5:00pm EDT\nInclude a video, GitHub repo and description.",
    );
    expect(r.deadline).toBe("2026-10-26T21:00:00.000Z");
    expect(toDateTimeInput(r.deadline!, "Asia/Seoul")).toBe("2026-10-27T06:00");
    expect(r.snippet).toBe("Oct 26, 2026 @ 5:00pm EDT");
    expect(r.requirements).toHaveLength(3);
  });
  it("parses ISO calendar date and KST", () => {
    expect(parseAnnouncement("Deadline: 2026-10-27 06:00 KST").deadline).toBe(
      "2026-10-26T21:00:00.000Z",
    );
  });
  it("supports ISO T separator", () => {
    expect(parseAnnouncement("Deadline: 2026-10-27T06:00 KST").deadline).toBe(
      "2026-10-26T21:00:00.000Z",
    );
  });
  it("requires a manual calendar date for time-only PT, preserving requirements", () => {
    const r = parseAnnouncement(
      "Submissions close 11:59 PM PT. Include slides and a PDF.",
    );
    expect(r.deadline).toBeNull();
    expect(r.sourceZone).toBe("PT");
    expect(r.notes.join(" ")).toMatch(/manually/);
    expect(r.requirements).toEqual([
      "Prepare presentation slides",
      "Attach PDF document",
    ]);
  });
});

describe("timezone interpretation", () => {
  it.each([
    ["EDT", "2026-10-26T21:00:00.000Z"],
    ["EST", "2026-10-26T22:00:00.000Z"],
    ["PDT", "2026-10-27T00:00:00.000Z"],
    ["PST", "2026-10-27T01:00:00.000Z"],
    ["UTC", "2026-10-26T17:00:00.000Z"],
    ["GMT", "2026-10-26T17:00:00.000Z"],
    ["KST", "2026-10-26T08:00:00.000Z"],
    ["JST", "2026-10-26T08:00:00.000Z"],
    ["CET", "2026-10-26T16:00:00.000Z"],
    ["CEST", "2026-10-26T15:00:00.000Z"],
    ["BST", "2026-10-26T16:00:00.000Z"],
    ["IST", "2026-10-26T11:30:00.000Z"],
    ["CT", "2026-10-26T22:00:00.000Z"],
    ["MT", "2026-10-26T23:00:00.000Z"],
  ])("handles %s", (zone, expected) => {
    expect(
      parseAnnouncement(`Deadline: Oct 26, 2026 at 5pm ${zone}`).deadline,
    ).toBe(expected);
  });
  it("uses date-aware daylight saving for PT and ET", () => {
    expect(parseAnnouncement("Jan 15, 2027 11:59 PM PT").deadline).toBe(
      "2027-01-16T07:59:00.000Z",
    );
    expect(parseAnnouncement("Jul 15, 2027 11:59 PM PT").deadline).toBe(
      "2027-07-16T06:59:00.000Z",
    );
    expect(parseAnnouncement("Jan 15, 2027 5pm ET").deadline).toBe(
      "2027-01-15T22:00:00.000Z",
    );
    expect(parseAnnouncement("Jul 15, 2027 5pm ET").deadline).toBe(
      "2027-07-15T21:00:00.000Z",
    );
  });
  it("handles a half-hour timezone and explains IST", () => {
    const r = parseAnnouncement("27 October 2026 12:00 AM IST");
    expect(r.deadline).toBe("2026-10-26T18:30:00.000Z");
    expect(r.notes.join(" ")).toContain("India");
  });
  it("uses the selected zone when source timezone is missing and says so", () => {
    const r = parseAnnouncement("Oct 26, 2026 5pm", "Asia/Seoul");
    expect(r.deadline).toBe("2026-10-26T08:00:00.000Z");
    expect(r.notes.join(" ")).toContain("No timezone");
  });
  it("does not silently reinterpret an unsupported timezone", () => {
    expect(parseAnnouncement("Oct 26, 2026 5pm AEST").deadline).toBeNull();
  });
  it("does not discard a numeric offset attached to UTC", () => {
    expect(parseAnnouncement("Oct 26, 2026 5pm UTC+09:00").deadline).toBeNull();
  });
  it("does not confuse timezone abbreviations with words in prose", () => {
    const r = parseAnnouncement(
      "Oct 26, 2026 5pm. The best video wins.",
      "UTC",
    );
    expect(r.deadline).toBe("2026-10-26T17:00:00.000Z");
    expect(r.sourceZone).toBe("UTC");
  });
});

describe("verification and failure cases", () => {
  it.each([
    "Feb 30, 2026 5pm UTC",
    "2026-02-29 12:00 UTC",
    "Oct 26, 2026 25:00 KST",
    "Oct 26, 2026 13pm ET",
    "Oct 26, 2026 5:75pm EDT",
  ])("rejects invalid date/time: %s", (text) => {
    expect(parseAnnouncement(text).deadline).toBeNull();
  });
  it("accepts leap day in a leap year", () => {
    expect(parseAnnouncement("Feb 29, 2028 12:00 UTC").deadline).toBe(
      "2028-02-29T12:00:00.000Z",
    );
  });
  it("flags a missing year explicitly", () => {
    const r = parseAnnouncement(
      "Oct 26 5pm EDT",
      "Asia/Seoul",
      new Date("2026-01-01T00:00:00Z"),
    );
    expect(r.deadline).toBe("2026-10-26T21:00:00.000Z");
    expect(r.notes.join(" ")).toContain("using 2026");
  });
  it("prefers closing deadline over an opening event", () => {
    const r = parseAnnouncement(
      "Opens Oct 1, 2026 9am ET.\nSubmission deadline: Oct 26, 2026 5pm EDT.",
    );
    expect(r.deadline).toBe("2026-10-26T21:00:00.000Z");
    expect(r.notes.join(" ")).toContain("Multiple");
  });
  it("handles empty text without fabricating a deadline", () => {
    const r = parseAnnouncement("");
    expect(r.deadline).toBeNull();
    expect(r.requirements).toEqual([]);
  });
  it("deduplicates requirement synonyms and matches whole keywords", () => {
    expect(
      extractRequirements(
        "GitHub repository and repo, video and demo video, description, PDF, slides.",
      ),
    ).toHaveLength(5);
    expect(
      extractRequirements("This contestant has a descriptive biography."),
    ).toEqual([]);
  });
  it("parses noon and midnight correctly", () => {
    expect(parseAnnouncement("Oct 26, 2026 12pm UTC").deadline).toBe(
      "2026-10-26T12:00:00.000Z",
    );
    expect(parseAnnouncement("Oct 26, 2026 12am UTC").deadline).toBe(
      "2026-10-26T00:00:00.000Z",
    );
  });
});

describe("manual edits and urgency", () => {
  it("keeps the same instant when round-tripped through a different zone", () => {
    const iso = "2026-10-26T21:00:00.000Z";
    for (const zone of [
      "Asia/Seoul",
      "America/New_York",
      "Asia/Kolkata",
      "Europe/London",
    ]) {
      expect(fromDateTimeInput(toDateTimeInput(iso, zone), zone)).toBe(iso);
    }
  });
  it("rejects nonexistent wall time at spring DST transition", () => {
    expect(
      fromDateTimeInput("2026-03-08T02:30", "America/New_York"),
    ).toBeNull();
  });
  it("rejects invalid manual input", () => {
    expect(fromDateTimeInput("2026-02-30T05:00", "UTC")).toBeNull();
    expect(fromDateTimeInput("", "UTC")).toBeNull();
  });
  it("uses exact urgency boundaries", () => {
    const now = Date.parse("2026-10-26T00:00Z");
    const inHours = (h: number) => new Date(now + h * 3600000).toISOString();
    expect(urgencyFor(inHours(72), now)).toBe("safe");
    expect(urgencyFor(inHours(71.99), now)).toBe("soon");
    expect(urgencyFor(inHours(24), now)).toBe("soon");
    expect(urgencyFor(inHours(23.99), now)).toBe("urgent");
    expect(urgencyFor(inHours(0), now)).toBe("closed");
  });
});
