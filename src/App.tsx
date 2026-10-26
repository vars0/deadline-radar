import { useMemo, useRef, useState } from "react";
import { Checklist } from "./components/Checklist";
import { Countdown, useNow } from "./components/Countdown";
import { parseAnnouncement } from "./lib/parser";
import {
  formatDeadline,
  fromDateTimeInput,
  toDateTimeInput,
  urgencyFor,
  urgencyLabel,
} from "./lib/time";
import { readStorage, writeStorage } from "./lib/storage";
import type { Contest } from "./types";

const SAMPLE = `Build With AI: Basics
Build a small working project with the Devpost Learn skill pack.

Submission deadline: Oct 26, 2026 @ 5:00pm EDT

To submit, include a 1–3 minute demo video showing your app in action, a public GitHub repository, and a short project description explaining what you built, who it is for, and what you learned.

Your repository should include scope.md, prd.md, and spec.md.
Judging: Design, Innovation, and Presentation.`;

const ZONES = [
  ["Asia/Seoul", "Seoul · KST"],
  ["Asia/Tokyo", "Tokyo · JST"],
  ["UTC", "UTC"],
  ["America/New_York", "New York · ET"],
  ["America/Los_Angeles", "Los Angeles · PT"],
  ["Europe/London", "London · GMT/BST"],
  ["Europe/Berlin", "Berlin · CET/CEST"],
  ["Asia/Kolkata", "Kolkata · IST"],
];
type Draft = Omit<Contest, "deadline"> & { deadline: string | null };

function RadarMark({ large = false }: { large?: boolean }) {
  return (
    <svg
      className={large ? "radar-art" : "brand-mark"}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="40" cy="40" r="32" />
      <circle cx="40" cy="40" r="21" />
      <circle cx="40" cy="40" r="10" />
      <path d="M40 40 63 17M40 4v8M40 68v8M4 40h8M68 40h8" />
      <circle className="radar-blip" cx="54" cy="26" r="4" />
    </svg>
  );
}

export default function App() {
  const [initial] = useState(readStorage);
  const [contests, setContests] = useState(initial.data.contests);
  const [timezone, setTimezone] = useState(initial.data.timezone);
  const [storageError, setStorageError] = useState(initial.error);
  const [announcement, setAnnouncement] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [manualDate, setManualDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [message, setMessage] = useState("");
  const [inputError, setInputError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const resultRef = useRef<HTMLElement>(null);
  const now = useNow();
  const sorted = useMemo(
    () =>
      [...contests].sort(
        (a, b) => Date.parse(a.deadline) - Date.parse(b.deadline),
      ),
    [contests],
  );
  const active = contests.filter((c) => Date.parse(c.deadline) > now);
  const urgentCount = active.filter(
    (c) => urgencyFor(c.deadline, now) === "urgent",
  ).length;
  const zoneOptions = ZONES.some(([value]) => value === timezone)
    ? ZONES
    : [[timezone, timezone.replaceAll("_", " ")], ...ZONES];

  function persist(nextContests: Contest[], nextZone = timezone) {
    setContests(nextContests);
    setStorageError(
      writeStorage({ version: 1, timezone: nextZone, contests: nextContests }),
    );
  }
  function changeTimezone(nextZone: string) {
    setTimezone(nextZone);
    if (draft?.deadline)
      setManualDate(toDateTimeInput(draft.deadline, nextZone));
    setDateError("");
    persist(contests, nextZone);
  }
  function extract() {
    if (!announcement.trim()) {
      setInputError("Paste an announcement or load the sample first.");
      return;
    }
    const parsed = parseAnnouncement(announcement, timezone);
    setDraft({
      id: crypto.randomUUID(),
      title: parsed.title,
      deadline: parsed.deadline,
      sourceText: announcement,
      snippet: parsed.snippet,
      sourceZone: parsed.sourceZone,
      notes: parsed.notes,
      checklist: parsed.requirements.map((label) => ({
        id: crypto.randomUUID(),
        label,
        done: false,
      })),
    });
    setManualDate(
      parsed.deadline ? toDateTimeInput(parsed.deadline, timezone) : "",
    );
    setDateError("");
    setInputError("");
    setMessage("");
    window.setTimeout(
      () => resultRef.current?.focus({ preventScroll: true }),
      0,
    );
  }
  function changeDate(value: string) {
    setManualDate(value);
    const deadline = fromDateTimeInput(value, timezone);
    setDraft((d) =>
      d
        ? {
            ...d,
            deadline,
            notes: [
              ...d.notes.filter((n) => !n.startsWith("Deadline manually set")),
              ...(deadline
                ? [
                    `Deadline manually set in ${timezone}; the source phrase is retained for comparison.`,
                  ]
                : []),
            ],
          }
        : d,
    );
    setDateError(
      value && !deadline
        ? "Enter a valid date and time. A clock-change gap is not a valid local time."
        : "",
    );
  }
  function saveContest() {
    if (!draft?.deadline || !draft.title.trim()) return;
    const existing = contests.some((c) => c.id === draft.id);
    const next: Contest = {
      ...draft,
      deadline: draft.deadline,
      title: draft.title.trim(),
      checklist: draft.checklist
        .filter((i) => i.label.trim())
        .map((i) => ({ ...i, label: i.label.trim() })),
    };
    persist(
      existing
        ? contests.map((c) => (c.id === next.id ? next : c))
        : [...contests, next],
    );
    setDraft(null);
    setMessage(existing ? "Contest updated." : "Contest added to your radar.");
  }
  function editContest(contest: Contest) {
    setDraft({
      ...contest,
      checklist: contest.checklist.map((i) => ({ ...i })),
    });
    setAnnouncement(contest.sourceText);
    setManualDate(toDateTimeInput(contest.deadline, timezone));
    setDateError("");
    setMessage("");
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(
      () => resultRef.current?.focus({ preventScroll: true }),
      0,
    );
  }
  const local = draft?.deadline
    ? formatDeadline(draft.deadline, timezone)
    : null;
  const editing = draft ? contests.some((c) => c.id === draft.id) : false;

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#main">
            <RadarMark />
            <span>
              deadline<span className="brand-light">radar</span>
              <span className="brand-period">.</span>
            </span>
          </a>
          <div className="timezone-control">
            <span className="globe" aria-hidden="true">
              ◎
            </span>
            <label htmlFor="timezone">Your timezone</label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => changeTimezone(e.target.value)}
            >
              {zoneOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>
      <main id="main" className="page-shell">
        <section className="hero">
          <div>
            <p className="eyebrow">
              <span />
              GLOBAL CONTESTS. LOCAL TIME.
            </p>
            <h1>
              Big ideas.
              <br />
              Zero missed deadlines<span>.</span>
            </h1>
            <p className="hero-description">
              Turn a contest announcement into your local deadline
              <br className="desktop-break" /> and a clear path to{" "}
              <span className="underlined">ready to submit</span>.
            </p>
          </div>
          <aside className="hero-note">
            <span className="note-arrow" aria-hidden="true">
              ↘
            </span>
            <p>
              5:00 PM in New York.
              <br />
              <strong>6:00 AM in Seoul.</strong>
            </p>
            <small>
              Different day. Same deadline.
              <br />
              Let’s get it right.
            </small>
          </aside>
        </section>

        {storageError && (
          <div className="notice warning" role="alert">
            {storageError}
          </div>
        )}
        <div className="workspace">
          <section
            className="panel announcement-panel"
            aria-labelledby="announcement-heading"
          >
            <div className="panel-top">
              <span className="step-number">01</span>
              <h2 id="announcement-heading">Drop it on the radar</h2>
              <span className="corner-label">INPUT</span>
            </div>
            <p className="panel-description">
              Paste the announcement. We’ll find the important bits.
            </p>
            <label htmlFor="announcement" className="field-label">
              Contest announcement
            </label>
            <textarea
              id="announcement"
              value={announcement}
              maxLength={20000}
              onChange={(e) => {
                setAnnouncement(e.target.value);
                setInputError("");
              }}
              placeholder={
                "Your next opportunity goes here…\n\n“Submissions close Oct 26, 2026 at 5:00pm EDT. Include a demo video, GitHub repo, and project description.”"
              }
            />
            <div className="input-meta">
              <span>
                {announcement.length.toLocaleString()} / 20,000 characters
              </span>
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setAnnouncement(SAMPLE);
                  setInputError("");
                  setMessage(
                    "Sample loaded. Extract it to see the local deadline.",
                  );
                }}
              >
                Load sample <span aria-hidden="true">↗</span>
              </button>
            </div>
            {inputError && (
              <p className="field-error" role="alert">
                {inputError}
              </p>
            )}
            <button
              type="button"
              className="primary-button extract-button"
              onClick={extract}
            >
              Extract deadline <span aria-hidden="true">→</span>
            </button>
            <div className="privacy-note">
              <span aria-hidden="true">⌁</span> Runs in your browser. No
              uploads. No API keys.
            </div>
          </section>

          <section
            className={`panel result-panel ${draft ? "has-result" : ""}`}
            aria-labelledby="result-heading"
            ref={resultRef}
            tabIndex={-1}
          >
            <div className="panel-top">
              <span className="step-number">02</span>
              <h2 id="result-heading">Your submission, decoded</h2>
              <span className="corner-label">VERIFY</span>
            </div>
            {!draft ? (
              <div className="result-empty">
                <div className="radar-art-wrap">
                  <RadarMark large />
                </div>
                <span className="empty-kicker">
                  LESS TIME CONVERTING. MORE TIME BUILDING.
                </span>
                <h3>Your next deadline starts here.</h3>
                <p>
                  Extract an announcement to see the deadline
                  <br />
                  in your time, plus what you need to submit.
                </p>
                <div className="empty-features">
                  <span>↗ Local deadline</span>
                  <span>◷ Live countdown</span>
                  <span>✓ Checklist</span>
                </div>
              </div>
            ) : (
              <div className="draft-content">
                <label className="field-label" htmlFor="contest-title">
                  Contest name
                </label>
                <input
                  type="text"
                  id="contest-title"
                  className="title-input"
                  value={draft.title}
                  maxLength={100}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
                {local ? (
                  <div className="deadline-display">
                    <p className="eyebrow">DEADLINE IN YOUR TIME</p>
                    <div className="local-time">{local.time}</div>
                    <div className="local-date">
                      {local.date}
                      <span>{timezone.replaceAll("_", " ")}</span>
                    </div>
                  </div>
                ) : (
                  <div className="notice warning">
                    <strong>One detail needs your eye.</strong>
                    <br />
                    Set the date and time below to complete this deadline.
                  </div>
                )}
                {draft.deadline && <Countdown deadline={draft.deadline} />}
                {draft.snippet && (
                  <div className="source-snippet">
                    <span>PARSED FROM</span>
                    <q>{draft.snippet}</q>
                    <small>
                      {draft.sourceZone &&
                        `Source timezone: ${draft.sourceZone}`}
                    </small>
                  </div>
                )}
                {draft.notes.length > 0 && (
                  <div className="parse-notes" role="status">
                    {draft.notes.map((note, i) => (
                      <p key={i}>{note}</p>
                    ))}
                  </div>
                )}
                <label
                  className="field-label correction-label"
                  htmlFor="manual-deadline"
                >
                  Verify or correct deadline <span>({timezone})</span>
                </label>
                <input
                  type="datetime-local"
                  id="manual-deadline"
                  value={manualDate}
                  min="1900-01-01T00:00"
                  max="2200-12-31T23:59"
                  onChange={(e) => changeDate(e.target.value)}
                  aria-describedby={dateError ? "date-error" : undefined}
                />
                {dateError && (
                  <p className="field-error" id="date-error" role="alert">
                    {dateError}
                  </p>
                )}
                <Checklist
                  items={draft.checklist}
                  onChange={(checklist) => setDraft({ ...draft, checklist })}
                  idPrefix="draft"
                />
                <div className="draft-actions">
                  <button
                    className="primary-button"
                    type="button"
                    disabled={!draft.deadline || !draft.title.trim()}
                    onClick={saveContest}
                  >
                    {editing ? "Save changes" : "Track this contest"}{" "}
                    <span aria-hidden="true">+</span>
                  </button>
                  <button
                    className="text-button muted"
                    type="button"
                    onClick={() => {
                      setDraft(null);
                      setMessage("Draft dismissed.");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        <section className="tracked-section" aria-labelledby="tracked-heading">
          <div className="tracked-header">
            <div>
              <p className="eyebrow">THE FINISH LINE, IN SIGHT</p>
              <h2 id="tracked-heading">
                On your radar{" "}
                <span className="count-pill">{contests.length}</span>
              </h2>
            </div>
            <div className="tracking-summary">
              {urgentCount > 0 && (
                <span className="urgent-count">{urgentCount} closing soon</span>
              )}
              <span>Sorted by soonest deadline ↓</span>
            </div>
          </div>
          <div className="feedback-message" role="status" aria-live="polite">
            {message}
          </div>
          {!sorted.length ? (
            <div className="tracked-empty">
              <span className="empty-plus" aria-hidden="true">
                +
              </span>
              <div>
                <h3>A little clarity for your next big thing.</h3>
                <p>
                  Your tracked contests will appear here. Start with an
                  announcement above.
                </p>
              </div>
              <span className="empty-index" aria-hidden="true">
                00
              </span>
            </div>
          ) : (
            <div className="contest-list">
              {sorted.map((contest, index) => {
                const display = formatDeadline(contest.deadline, timezone);
                const urgency = urgencyFor(contest.deadline, now);
                const done = contest.checklist.filter((i) => i.done).length;
                return (
                  <article
                    className={`contest-card ${urgency}`}
                    key={contest.id}
                  >
                    <div className="contest-card-heading">
                      <div className="contest-identity">
                        <span className="contest-index">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <span className={`status-badge ${urgency}`}>
                            <span className="status-dot" />
                            {urgencyLabel[urgency]}
                          </span>
                          <h3>{contest.title}</h3>
                        </div>
                      </div>
                      <div className="contest-card-actions">
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => editContest(contest)}
                        >
                          Edit <span aria-hidden="true">↗</span>
                        </button>
                        {confirmDelete === contest.id ? (
                          <div className="delete-confirm">
                            <span>Remove?</span>
                            <button
                              className="text-button danger"
                              type="button"
                              onClick={() => {
                                persist(
                                  contests.filter((c) => c.id !== contest.id),
                                );
                                setConfirmDelete(null);
                                if (draft?.id === contest.id) setDraft(null);
                                setMessage("Contest removed.");
                              }}
                            >
                              Yes
                            </button>
                            <button
                              className="text-button"
                              type="button"
                              onClick={() => setConfirmDelete(null)}
                            >
                              Keep
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="icon-button"
                            aria-label={`Remove ${contest.title}`}
                            onClick={() => setConfirmDelete(contest.id)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="contest-body">
                      <div className="contest-time">
                        <span className="field-label">YOUR LOCAL DEADLINE</span>
                        <strong>{display.time}</strong>
                        <p>{display.date}</p>
                        <small>{timezone.replaceAll("_", " ")}</small>
                        <Countdown deadline={contest.deadline} compact />
                      </div>
                      <div className="saved-checklist">
                        <Checklist
                          items={contest.checklist}
                          onChange={(checklist) =>
                            persist(
                              contests.map((c) =>
                                c.id === contest.id ? { ...c, checklist } : c,
                              ),
                            )
                          }
                          idPrefix={contest.id}
                        />
                      </div>
                    </div>
                    <div className="contest-footer">
                      <span>
                        {done === contest.checklist.length && done > 0
                          ? "✓ Checklist complete. Give everything one last look."
                          : `${contest.checklist.length - done} submission ${contest.checklist.length - done === 1 ? "task" : "tasks"} to go.`}
                      </span>
                      <details>
                        <summary>Source &amp; parsing notes</summary>
                        <p>
                          <strong>Parsed from:</strong>{" "}
                          {contest.snippet || "Manually entered deadline"}
                        </p>
                        {contest.notes.map((note, i) => (
                          <p key={i}>{note}</p>
                        ))}
                        <pre>{contest.sourceText}</pre>
                      </details>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
        <footer className="site-footer">
          <span>
            <span className="footer-dot" />A calmer last mile.
          </span>
          <p>
            Rule-based extraction. Always verify against the official
            announcement.
          </p>
          <span>Built for builders, everywhere ↗</span>
        </footer>
      </main>
    </>
  );
}
