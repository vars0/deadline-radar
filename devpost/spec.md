---
doc: spec
status: approved
---

# Deadline Radar — Technical Spec

## How This Works, In Plain Language

The page reads pasted text with a set of patterns. It identifies a date, clock time, timezone and submission keywords, then converts the deadline into one unambiguous instant. The browser displays that instant in the chosen timezone and counts down to it. Saved contests live only in this browser. Nothing is uploaded.

## The Core Journey Through the System

`prd.md > The Core Journey`: announcement textarea → `parseAnnouncement` → editable draft and `Countdown` → save → React contest list → localStorage. Reload reads and validates stored contests. Choosing a timezone changes display and manual date editing, not the underlying deadline instant.

## Stack

- React + React DOM: component rendering and local state, as requested. https://react.dev/
- TypeScript: explicit draft and persisted-data types. https://www.typescriptlang.org/docs/
- Vite: dev server and static production build. https://vite.dev/guide/
- Vitest: parser and conversion tests. https://vitest.dev/guide/
- Plain CSS and browser Intl: no UI toolkit or timezone API. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
- Exact package versions will be resolved by npm and recorded in package-lock.json, then verified by build/tests. No external runtime services.

## Where It Runs and How Someone Tries It

Node 24 available; modern browser with Intl timezone support. `npm install`, `npm run dev`, open the localhost URL printed by Vite. No environment variables or API keys. `npm test` runs tests once; `npm run build` checks types and emits dist. Record the sample flow described in SUBMISSION.md. Public repository and video are required submission steps; neither is created/published here per user instructions. No process will be left running.

## Look and Feel

Implements `prd.md > Look and Feel`: warm #f6f5f0 paper, #19291f dark ink, orange #e8582c accent, green/amber/red urgency with text. System sans serif, strong headline hierarchy, subtle borders, responsive two-column workspace and stacked mobile panels. SVG radar mark and native labeled inputs; visible focus rings and reduced-motion support.

## Components

### Parser

`src/lib/parser.ts`: pure regex parsing with named-month, day-month and ISO date support; whole-token timezone map; Intl conversion for ET/PT/CT/MT and fixed offsets for explicit abbreviations. Returns deadline ISO or null, snippet, source timezone, warnings, title and deduplicated requirements. Reject calendar overflow. Implements `prd.md > Announcement Extraction` and `Verification and Correction`.

### Time Utilities and Countdown

`src/lib/time.ts`, `src/components/Countdown.tsx`: convert wall-clock edits in selected IANA zone; format dates; calculate urgency and nonnegative countdown. Timer updates once a second and cleans up. Implements `prd.md > Countdown and Urgency`.

### Draft and Tracking Interface

`src/App.tsx`: announcement input, sample, draft correction form, editable checklist, saved sorted contest cards, edit/remove flow and display timezone. `Checklist.tsx` handles reusable item editing. Implements `prd.md > Editable Checklist` and `Tracked Contests`.

### Storage

`src/lib/storage.ts`: versioned key and shape validation with explicit read/write error messages. Skip invalid records safely; do not erase corrupt storage until an intentional save. Implements `prd.md > States and Boundaries`.

## Data Model

Checklist item: `{id: string, label: string, done: boolean}`.
Contest: `{id, title, deadline: ISO string, sourceText, snippet, sourceZone, notes: string[], checklist: ChecklistItem[]}`.
Draft: contest fields with nullable deadline, held in React only until Save. Persisted envelope: `{version: 1, timezone: string, contests: Contest[]}` at `deadline-radar:v1`. Countdown time is transient. IDs use crypto.randomUUID. User content is plain text.

## File Structure

```text
src/
  main.tsx                 # React entry
  App.tsx                  # core journey and state
  styles.css               # responsive visual design
  components/
    Countdown.tsx          # live remaining time
    Checklist.tsx          # accessible editable tasks
  lib/
    parser.ts              # announcement extraction
    parser.test.ts         # real timezone/date edge cases
    time.ts                # conversion, formatting, urgency
    storage.ts             # validation and persistence
  types.ts                 # data contracts
devpost/
  learner-profile.md       # ignored personal context
  scope.md, prd.md, spec.md # Learn planning artifacts
  checklist.md             # slices and honest review status
  app-map.html             # offline source guide
index.html                 # page metadata and app root
vite.config.ts             # React and Vitest config
tsconfig.json              # TypeScript settings
package.json               # commands and dependencies
README.md                  # technical run instructions
SUBMISSION.md              # description and recording script
```

## External Services and Dependencies

Only npm packages during installation. No network requests, keys, backend, database or paid services at runtime. Browser storage is per-origin, so moving ports/browsers does not carry saved entries.

## Important Failure Modes

- Unrecognized or partial date → preserve extracted checklist and show manual date entry plus a warning.
- Abbreviations with multiple meanings → expose the interpretation; ET/PT follow American DST, IST is India and BST is UK summer.
- Storage disabled/full/corrupt → keep current in-memory entries and show a persistence warning.

## What Was Simplified and Why

- Deterministic keyword extraction rather than a model: fast, inspectable and no credentials.
- One local dashboard rather than accounts and routes: complete demo path without infrastructure.
- Missing year uses current year with an explicit note; a missing calendar date is never guessed.

## Decisions and Open Issues

User selected stack and architecture. Agent details are derived under explicit delegation. Genuine known uncertainty from the brief: timezone notation can shift the calendar day; the EDT→KST regression test is the first verification. No additional learner uncertainty or human learning outcome is invented. Planning status uses delegated authority, not an interactive sign-off.
