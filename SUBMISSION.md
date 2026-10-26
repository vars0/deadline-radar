# Deadline Radar — Submission Preparation

Prepared draft: review the wording and learning claims before using it. The project is local and ready to record; no public repository, uploaded video or Devpost submission has been created.

## Devpost short description (under 150 words)

<!-- DESCRIPTION_START -->

Deadline Radar turns a pasted contest announcement into a local deadline, a live countdown, and an editable submission checklist. It is for students entering worldwide hackathons who might mistake an evening EDT deadline for the same day in Korea—or forget a required demo video or public repo. The app extracts common dates, timezone abbreviations, and submission keywords, shows the original source phrase, and lets users correct every result. Tracked contests stay in the browser, sorted by deadline. No backend or API keys are needed. Building it taught me to turn a real near-miss into a testable requirement, distinguish clock times from absolute instants, and keep uncertainty visible instead of hiding it behind automation.
<!-- DESCRIPTION_END -->

## 90-second demo video script

Before recording: run `npm run dev`, open the app, choose **Seoul · KST**, and use a fresh browser profile or remove old tracked demo contests through the interface. Record the app window, with text readable at 100% zoom. The sample is a fixed real-world date; if recorded after expiry, the app correctly shows **Closed**. Do not misrepresent it as a live future deadline.

| Time        | Spoken narration                                                                                                                                                             | On-screen action                                                                                               |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 00:00–00:12 | “A contest says October twenty-sixth, five PM, Eastern Daylight Time. I’m in Korea. That’s actually six AM the next morning. I’ve nearly missed deadlines like this.”        | Show the dashboard and point to the EDT/KST near-miss example.                                                 |
| 00:12–00:22 | “This is Deadline Radar, for students entering contests around the world. I paste the announcement—or load this sample—and extract the deadline.”                            | Click **Load sample**, show the deadline sentence, then click **Extract deadline**.                            |
| 00:22–00:35 | “The local result is October twenty-seventh at six AM KST. The original phrase stays visible, so I can verify it. I can also correct the date manually.”                     | Point to **06:00 KST**, the date, **Parsed from**, and the correction field.                                   |
| 00:35–00:45 | “The live countdown makes urgency obvious: green, amber, then red in the final twenty-four hours. After the deadline, it clearly says closed.”                               | Hold on the ticking countdown and urgency label; if expired, show **Closed** honestly.                         |
| 00:45–01:00 | “The same announcement becomes a checklist: demo video, public repository, and description. I can check tasks off, rename them, or add something the parser missed.”         | Check **Record demo video**. Add **Verify planning documents** using the plus button.                          |
| 01:00–01:14 | “I save the contest to my radar. The nearest deadline comes first, and the checklist survives a refresh. Changing timezones changes the display, not the actual deadline.”   | Click **Track this contest**, scroll to the saved card, refresh, briefly switch to New York and back to Seoul. |
| 01:14–01:25 | “I built this with the Learn skill pack: scope, requirements, technical plan, then a tested React app. The key lesson was making uncertain parsing visible and correctable.” | Briefly show the repository’s `devpost/` planning files, then return to the app.                               |
| 01:25–01:30 | “Global contests. Local time. A calmer last mile.”                                                                                                                           | End on the saved contest and completed checklist progress.                                                     |

## Final submission checklist — user actions remaining

- [ ] Review the app and personalize the draft description/narration, especially the learning reflection.
- [ ] Record the 90-second walkthrough (required submission range supplied in the brief: 1–3 minutes).
- [ ] Upload the video to an accessible link; check playback in a signed-out/private window.
- [ ] Create a public repository yourself, publish branch `main`, and verify the repo is accessible without login. No remote or push was performed here.
- [ ] Add both the public repository URL and video URL to Devpost.
- [ ] Complete any required form fields and exit survey, then submit before **2026-10-27 06:00 KST**.

Repository URL: **not created — user action remaining**

Video URL: **not recorded/uploaded — user action remaining**

Optional deployment is unnecessary for recording the local demo and does not replace the required video.
