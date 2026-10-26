---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast, autonomous per explicit user instruction. Two commits maximum.

## Slices

- [x] **1. Paste an announcement and track its local deadline and checklist**
      Becomes usable: Complete responsive dashboard with parse, source verification, manual correction, countdown, editable tasks, sorted saved list and persistence.
      Why now: One integrated small slice proves the distinctive conversion-plus-submission kernel and the full user loop.
      PRD ref: `prd.md > The Core Journey`, `Announcement Extraction`, `Verification and Correction`, `Tracked Contests`
      Spec ref: `spec.md > Components`, `Data Model`, `File Structure`
      Build: Scaffold Vite React TypeScript, implement parser/time/storage and interface, and add parser regression tests.
      Verify (mechanical): `npm test`, `npm run build`; browser smoke of sample → extract → save → reload, task edit, manual correction and mobile layout when browser tooling is available.
      Learner check: Load sample, extract, confirm Oct 27 at 06:00 in Seoul, complete one task, save and refresh.
      Commit: `Build Deadline Radar local contest tracker`
- [x] **2. Make the project ready to record and share**
      Becomes usable: README, <=150-word description, 90-second script, app map and honest remaining submission checklist.
      Why now: Documentation reflects the verified app instead of planned behavior.
      PRD ref: `prd.md > What We're Building`
      Spec ref: `spec.md > Where It Runs and How Someone Tries It`
      Build: Write README.md, SUBMISSION.md, offline source map and verification record; audit intended git files.
      Verify (mechanical): Check description word count, actual paths, tests/build results and git status; no remote, no server left running.
      Learner check: Follow README, rehearse the 90-second script, publish the repo and record/upload the demo outside this task.
      Commit: `Prepare Learn artifacts and demo submission guide`

## Hands-on Checkpoints

- [ ] Human exploration not performed: user requested autonomous execution with no questions. Agent mechanical checks are recorded separately.

## Final Review

- [x] Agent review: sample flow, timezone round-trip, checklist edits/persistence, manual correction, sorting, mobile width, delete confirmation and corrupt storage all passed in Chromium. No console errors or external requests. Screenshots inspected at desktop and 390px mobile widths.
- [ ] Human readiness confirmation not requested under the user's no-questions instruction. Do not interpret agent tests as human feedback.

## Code Tour and App Map

- [x] Evidence-based technical recap prepared in README and app map: the EDT/KST acceptance example is connected to its parser test and instant-based storage.
- [x] `devpost/app-map.html` generated and paths checked; opened in Chromium with offline mode and no scripts.
      Activity mode: static reference recap, not a human guided tour. Route: `App.tsx > extract` → `parser.ts > parseAnnouncement` / `time.ts > wallTimeToISO` → `App.tsx > saveContest` / `storage.ts > writeStorage`.
      Optional edit and personal reflection: not applicable to the explicitly autonomous no-questions workflow; no learner exercise or mastery is claimed.

## Submission Preparation

- [x] README, screenshot, 113-word short description, and 183-word narration in a 90-second timestamped script prepared.
- [x] Documentation relative links verified and source snapshot identified in the offline app map.
- [x] Tests/build and Chromium core-flow checks passed; no runtime network requests or console errors.
- [ ] Public repository publication, demo recording/upload, human wording review, required form fields/exit survey and Devpost submission remain user actions. See `SUBMISSION.md`.

## Revisions

- Workflow adaptation: user explicitly supplied interview answers, delegated decisions and prohibited questions, overriding interactive approval and hands-on gates. Planning records use this authorization; human checks remain honestly unperformed.
- Submission-copy adaptation: user explicitly requested an English description and script, overriding the skill's normal human-authorship restriction. Prepared text will be identified as a draft to review.
