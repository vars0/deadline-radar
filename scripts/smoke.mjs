// Repeatable browser check. Its preview server and browser are always closed.
// Uses an installed Chrome/Edge, or Playwright Chromium when available.
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";

const port = 4179;
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--strictPort",
  ],
  { stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
);
let output = "";
server.stdout.on("data", (chunk) => {
  output += chunk;
});
server.stderr.on("data", (chunk) => {
  output += chunk;
});
let browser;
try {
  let ready = false;
  for (let n = 0; n < 60; n++) {
    try {
      ready = (await fetch(`http://127.0.0.1:${port}`)).ok;
    } catch {
      /* waiting for preview */
    }
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert(ready, `Preview did not start: ${output}`);
  console.log("Preview started successfully.");
  const executablePath = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ].find(existsSync);
  browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });
  const context = await browser.newContext({
    timezoneId: "Asia/Seoul",
    viewport: { width: 1440, height: 1050 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  const outsideRequests = [];
  page.on("request", (req) => {
    if (!req.url().startsWith(`http://127.0.0.1:${port}`))
      outsideRequests.push(req.url());
  });
  mkdirSync("test-results", { recursive: true });
  await page.goto(`http://127.0.0.1:${port}`);
  await page.getByRole("heading", { name: "Big ideas." }).waitFor();
  await page.screenshot({
    path: "test-results/desktop-empty.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Load sample" }).click();
  await page.getByRole("button", { name: "Extract deadline" }).click();
  assert.equal(await page.locator(".local-time").innerText(), "06:00 KST");
  assert.match(await page.locator(".local-date").innerText(), /Oct 27, 2026/);
  assert.match(
    await page.locator(".source-snippet").innerText(),
    /Oct 26, 2026 @ 5:00pm EDT/,
  );
  assert.equal(await page.locator(".draft-content .task").count(), 3);
  await page
    .getByRole("checkbox", { name: "Complete Record demo video" })
    .check();
  await page
    .getByRole("textbox", { name: "New checklist item" })
    .fill("Verify planning documents");
  await page.getByRole("button", { name: "Add checklist item" }).click();
  await page.screenshot({
    path: "test-results/desktop-parsed.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Track this contest" }).click();
  await page.reload();
  assert.equal(await page.locator(".contest-card").count(), 1);
  assert.equal(
    await page
      .getByRole("checkbox", { name: "Complete Record demo video" })
      .isChecked(),
    true,
  );
  assert.equal(
    await page
      .getByRole("textbox", { name: "Task: Verify planning documents" })
      .inputValue(),
    "Verify planning documents",
  );
  console.log(
    "PASS: sample → correct KST conversion → editable checklist → save → reload.",
  );

  await page.getByLabel("Your timezone").selectOption("America/New_York");
  assert.equal(
    await page.locator(".contest-time>strong").innerText(),
    "17:00 EDT",
  );
  const before = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("deadline-radar:v1")).contests[0]
        .deadline,
  );
  assert.equal(before, "2026-10-26T21:00:00.000Z");
  await page.getByLabel("Your timezone").selectOption("Asia/Seoul");
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Verify or correct deadline").fill("2026-10-28T07:30");
  await page.getByRole("button", { name: "Save changes" }).click();
  assert.equal(
    await page.locator(".contest-time>strong").innerText(),
    "07:30 KST",
  );
  console.log(
    "PASS: timezone switching preserves instant; manual correction updates saved contest.",
  );

  await page
    .getByLabel("Contest announcement")
    .fill(
      "Another contest\nDeadline: 2026-10-27 20:00 KST\nSubmit a PDF and slides.",
    );
  await page.getByRole("button", { name: "Extract deadline" }).click();
  await page.getByRole("button", { name: "Track this contest" }).click();
  assert.match(
    await page.locator(".contest-card").first().innerText(),
    /Another contest/,
  );
  console.log("PASS: soonest-deadline sorting.");

  await page
    .getByLabel("Contest announcement")
    .fill("Last-minute contest\nClose at 11:59 PM PT. Include a video.");
  await page.getByRole("button", { name: "Extract deadline" }).click();
  assert.equal(
    await page.getByRole("button", { name: "Track this contest" }).isDisabled(),
    true,
  );
  await page.getByLabel("Verify or correct deadline").fill("2026-11-01T08:00");
  assert.equal(
    await page.getByRole("button", { name: "Track this contest" }).isEnabled(),
    true,
  );
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  console.log("PASS: incomplete date blocks saving until manual correction.");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/mobile-tracked.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
    "Mobile horizontal overflow",
  );
  await page
    .getByRole("button", { name: "Remove Another contest", exact: true })
    .click();
  await page.getByRole("button", { name: "Keep", exact: true }).click();
  assert.equal(await page.locator(".contest-card").count(), 2);
  await page
    .getByRole("button", { name: "Remove Another contest", exact: true })
    .click();
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  assert.equal(await page.locator(".contest-card").count(), 1);
  console.log("PASS: mobile width and removal confirmation.");

  await page.evaluate(() =>
    localStorage.setItem("deadline-radar:v1", "{broken"),
  );
  await page.reload();
  await page
    .getByRole("alert")
    .filter({ hasText: "Saved data could not be read" })
    .waitFor();
  console.log("PASS: corrupt storage shows recovery message without crashing.");
  assert.deepEqual(errors, [], `Browser errors: ${errors.join("; ")}`);
  assert.deepEqual(
    outsideRequests,
    [],
    "App must work without external requests",
  );
  console.log("PASS: no browser errors or external network requests.");
  console.log("All browser smoke checks passed. Screenshots in test-results/.");
} finally {
  if (browser) await browser.close();
  const exited = new Promise((resolve) => server.once("exit", resolve));
  server.kill();
  await exited;
  console.log("Preview server stopped.");
}
