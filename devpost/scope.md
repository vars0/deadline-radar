---
doc: scope
status: approved
---

# Deadline Radar

Turn an international contest announcement into a local deadline and a submission checklist.

## The Unique Kernel

One pasted announcement becomes both a timezone-correct deadline and the concrete things needed to submit. The original parsed phrase stays visible so a student can verify the conversion.

## Who It's For

A student in Korea who enters worldwide contests and has nearly missed a deadline because an evening in EDT was already the following morning in KST.

## The Core Loop

Paste an announcement (or load a labeled sample), extract its deadline and requirements, verify or correct the result, then save it. Return to the soonest-deadline list and check off submission tasks.

## Inspiration & Identity

Clean, modern, responsive and calm. Implementation direction: warm off-white canvas, deep ink, orange accent, clear urgency badges and generous readable type.

## Why This Matters to the Learner

“Oct 26 5:00pm EDT” is Oct 27 06:00 in Korea. Missing this conversion or a required video can invalidate otherwise finished work.

## What "Working" Looks Like

Load sample → parse Oct 26, 2026 at 5pm EDT → see Oct 27, 2026 at 06:00 KST and a live countdown → edit/check requirements → save → refresh and see it retained.

## The POC Boundary

One browser page, deterministic parsing, visible assumptions, manual date correction, editable checklist, localStorage persistence, urgency colors, sorted tracking, and a realistic sample. Parser tests and production build must pass.

## Later

Calendar export and reminder notifications could extend the core loop after the contest.

## Explicitly Cut

- Backend, accounts and synchronization: unnecessary for the single-student local demo.
- Model calls and API keys: the chosen regex parser works without setup or runtime services.
- Automatic web scraping: input is pasted text; source sites have different formats and access rules.
- Deployment, remote creation and push: excluded by the user; prepare local work only.

## Authorization

Derived from the user's detailed brief and explicit delegation of interviews and decisions. Normal interactive approval is replaced by that instruction; no human review is claimed.
