---
doc: prd
status: approved
---

# Deadline Radar — Product Requirements

A local deadline and submission companion for students entering global contests.
Source: `scope.md > The Unique Kernel` and `The Core Loop`.

## The Core Journey

1. Open the dashboard; see the device timezone and an empty tracking list.
2. Paste contest text or press Load sample, then Extract deadline.
3. Review the matched source phrase, original timezone, local date, live countdown and detected submission requirements.
4. Correct title/date and add, rename, remove or check checklist items.
5. Save the contest. It appears in the list sorted soonest first.
6. Return after refreshing; edit a saved contest or complete its tasks.

## Screens and Layout

One dashboard: compact brand header and timezone selector, editorial introduction, announcement panel beside a result panel, and a tracked-contests section below. On narrow screens the panels stack. Empty states explain the next action.

## Look and Feel

The user requested clean, modern, responsive plain CSS. Agent-selected details under delegated authority: warm paper background, dark text, orange action color, subtle grid/radar motif, rounded bordered panels, readable system typography. Status includes words as well as colors. All controls have labels and keyboard focus.

## Features and Behavior

### Announcement Extraction

Implements `scope.md > The Unique Kernel`. Extract named-month and ISO dates with a time and supported timezone. Prefer a deadline/submission-close phrase over unrelated dates. Match timezone abbreviations as whole tokens. Show “Parsed from” evidence. Requirements include video, public repository/GitHub, description, slides, and PDF; deduplicate keywords.
Acceptance: Oct 26, 2026 @ 5:00pm EDT becomes 2026-10-26T21:00:00Z, displayed as Oct 27 06:00 in Seoul.

### Verification and Correction

Show parser assumptions (missing year/date/zone, daylight-saving interpretation). Never silently invent a date for time-only input. Keep requirements even if deadline parsing fails. Provide editable title and date/time in the selected display timezone, with a disabled save until valid.

### Countdown and Urgency

Update every second. Green at 72h or more, amber from 24h to below 72h, red below 24h, and a separate closed label at/past deadline. Countdown never shows negative values. Date conversion responds to timezone selection without changing the saved instant.

### Editable Checklist

Detect useful submission items, allow adding/removing/renaming and toggling them. Show completion progress. Edits to saved entries persist.

### Tracked Contests

Implements `scope.md > The Core Loop`. Save, sort by earliest instant, edit and remove entries. Removing requires a small inline confirmation. Refresh retains entries and display timezone. Save failures show an actionable message; never claim browser storage succeeded when it did not.

## States and Boundaries

- First use: honest empty list; sample only loads on request.
- No valid deadline: explanation, extracted checklist and manual correction remain available.
- Missing date/year/timezone: explain the assumption or request manual correction in the result panel.
- Invalid calendar dates and impossible times: rejected, not normalized into another day.
- Expired: marked Closed with zero remaining time.
- Storage unavailable/corrupt: explain the problem; app remains usable in memory.
- Saved text is rendered as text, never interpreted as markup.

## Product Decisions

- User chose pasted text, no API keys, local storage, editable dates/checklists, realistic sample, and small scope.
- Agent choice: default device timezone with a prominent Seoul option, explicit ambiguous-zone notes, no guessed calendar date for “11:59 PM PT”.
- Agent choice: ET/PT/CT/MT use named US zones to account for daylight saving; explicit EST/EDT etc. use fixed offsets. IST means India, BST means UK summer, clearly disclosed.

## What We're Building

The complete core journey above plus parser tests, run instructions and submission materials.

## Deferred From the POC

Accounts, sync, notifications, scraping and calendar integrations; each adds infrastructure outside the local proof.

## Non-Goals

Universal natural-language understanding, authoritative contest-rule interpretation, or automatic submission.

## Open Questions

No blocking questions; the user explicitly delegated remaining decisions. Human review and recording remain external actions and will not be falsely marked complete.
