# Verification record

Verified locally on Windows with Node 24, using Chromium and the production Vite preview. These are agent checks, not human feedback or proof of a submitted entry.

| Boundary                         | Evidence                                                                                                                                                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text → parsing                   | Vitest: 39 passing cases, including the EDT/KST near-miss, all requested timezone families, seasonal ET/PT, leap-day validity, missing dates, unsupported offsets and urgency boundaries. |
| Parsing → display                | Browser sample shows `06:00 KST`, `Oct 27, 2026`, original `Oct 26, 2026 @ 5:00pm EDT`, and three detected requirements.                                                                  |
| Checklist → persistence          | Browser checks a task, adds another, saves, refreshes and confirms both changes remain.                                                                                                   |
| Timezone → instant               | Switching to New York renders `17:00 EDT`; localStorage still contains `2026-10-26T21:00:00.000Z`.                                                                                        |
| Manual correction → saved result | Browser corrects to Oct 28 at 07:30 KST and verifies saved card output.                                                                                                                   |
| Multiple entries → ordering      | Earlier contest appears first.                                                                                                                                                            |
| Incomplete input → recovery      | Time-only PT input disables Save; a valid manual date enables it.                                                                                                                         |
| Removal → confirmation           | Keep retains a contest; Yes removes it.                                                                                                                                                   |
| Corrupt storage → recovery       | Invalid stored JSON produces a visible warning with no crash.                                                                                                                             |
| Browser → network/runtime        | No console/page errors and no external network requests.                                                                                                                                  |
| Responsive layout                | Desktop screenshot and 390px mobile screenshot inspected; mobile document has no horizontal overflow.                                                                                     |
| Types → production assets        | `npm run build` passes TypeScript and emits static assets.                                                                                                                                |
| Dependency audit                 | `npm audit`: zero known vulnerabilities after updating Vitest to 5.0.5.                                                                                                                   |

Reproduce browser checks with `npm run test:smoke` (Chrome/Edge installed, or `npx playwright install chromium`). The script closes its browser and preview server in a `finally` block.

No API, backend, environment variables or hosting are involved. Unit tests do not establish universal natural-language parsing; unsupported text remains subject to manual verification. The real countdown uses the system clock and correctly expires after the fixed sample deadline.

Public repository, demo recording/upload, human review and Devpost submission remain user actions. No remote was created or pushed.
