// Drives the real page in Chromium: clicks through every step, builds a
// character, downloads the .gcs, and validates it. Catches the things the Node
// tests cannot — module loading, fetch paths, and DOM wiring.
//
// Needs Playwright and a Chromium install:
//   npm install playwright && node tests/browser.test.mjs

import { createServer } from "node:http";
import { readFile, rm } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, extname, normalize } from "node:path";
import { tmpdir } from "node:os";
import { mkdtempSync } from "node:fs";
import { chromium } from "playwright";
import { validateEntity } from "./gcs-schema.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const TYPES = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".attr": "application/json",
  ".adq": "application/json", ".eqp": "application/json", ".skl": "application/json",
  ".md": "text/markdown", ".pdf": "application/pdf",
};

const server = createServer(async (req, res) => {
  const path = decodeURIComponent(req.url.split("?")[0]);
  const file = join(ROOT, normalize(path === "/" ? "/index.html" : path));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}/`;

const downloads = mkdtempSync(join(tmpdir(), "ep-builder-"));
// Honour a pre-installed Chromium when the Playwright package's own pinned
// build is not the one on disk.
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const page = await browser.newPage({ acceptDownloads: true });

let failures = 0;
const fail = (message) => { failures += 1; console.error(`  ${message}`); };

const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => consoleErrors.push(`uncaught: ${e.message}`));

const step = (name) => page.getByRole("button", { name, exact: false }).first();
const gotoStep = async (name) => {
  await page.locator(".step-link", { hasText: name }).first().click();
  await page.waitForTimeout(120);
};

try {
  await page.goto(base, { waitUntil: "networkidle" });

  if (await page.locator("#loading").count()) fail("the loading placeholder never went away");
  const stepCount = await page.locator(".step-link").count();
  if (stepCount !== 13) fail(`${stepCount} steps in the nav, expected 13`);

  // The sheet panel is present from the start, with no body attached yet.
  const st = () => page.locator(".sheet-mini-grid .stat", { hasText: "ST" }).first();
  if ((await st().innerText()).replace(/\s+/g, " ") !== "ST 0") {
    fail(`the sheet panel shows "${await st().innerText()}" for ST before a morph is chosen`);
  }

  // Step 0 — name the character.
  await page.locator("input[type=text]").first().fill("Browser Test Sentinel");

  // Step 2 — attributes.
  await gotoStep("Attributes");
  const attrInputs = page.locator(".attr-input");
  if (await attrInputs.count() !== 4) fail("expected four Ego attribute inputs");
  await attrInputs.nth(1).fill("13");
  await page.waitForTimeout(150);
  const attrPoints = await page.locator(".attr-table tfoot .num").innerText();
  if (attrPoints.trim() !== "40") fail(`IQ 13 costs ${attrPoints}, expected 40`);

  // Step 3 — background.
  await gotoStep("Background");
  await page.locator(".pick-card", { hasText: "Martian Settler" }).first().click();
  await page.waitForTimeout(150);
  if (!await page.locator(".pick-card.active", { hasText: "Martian Settler" }).count()) {
    fail("selecting a background did not mark it active");
  }

  // Step 4 — faction and rep.
  await gotoStep("Faction");
  await page.locator(".pick-card", { hasText: "Firewall Sentinel" }).first().click();
  await page.waitForTimeout(150);
  const rep = page.locator(".rep-range").first();
  await rep.fill("3");
  await rep.dispatchEvent("input");
  await page.waitForTimeout(150);

  // Step 5 — skills.
  await gotoStep("Skills");
  await page.locator(".chip", { hasText: "Professional Skill (Resleeving)" }).first().click();
  await page.waitForTimeout(150);
  await page.locator(".chip", { hasText: "Computer Hacking" }).first().click();
  await page.waitForTimeout(150);
  const skillRows = await page.locator(".skill-table tbody tr").count();
  if (skillRows !== 2) fail(`${skillRows} skills on the sheet, expected 2`);

  // Step 4b — a setting trait from the library, and a hand-entered one.
  await gotoStep("Traits");
  await page.waitForTimeout(700);
  await page.locator(".chip", { hasText: "Identity Crysis" }).first().click();
  await page.waitForTimeout(250);
  if (!await page.locator(".card", { hasText: "Setting traits on the sheet" }).count()) {
    fail("adding a library ego trait did not list it on the sheet");
  }
  await page.locator(".chip", { hasText: "Combat Reflexes" }).first().click();
  await page.waitForTimeout(250);
  // The name renders as an editable field, so read its value rather than text.
  const traitNames = await page.locator("table tbody input[type=text]").evaluateAll(
    (nodes) => nodes.map((n) => n.value),
  );
  if (!traitNames.includes("Combat Reflexes")) {
    fail(`adding a trait did not put it on the sheet; found ${JSON.stringify(traitNames)}`);
  }

  // Step 6 — morph, and the aptitude slot.
  await gotoStep("Morph");
  await page.locator("input[type=search]").first().fill("Fury");
  await page.waitForTimeout(200);
  await page.locator(".pick-card", { hasText: "Fury" }).first().click();
  await page.waitForTimeout(400);
  const slots = page.locator(".chip.aptitude");
  if (await slots.count() !== 7) fail(`${await slots.count()} aptitude options, expected 7`);
  await slots.nth(3).click(); // WIL
  await page.waitForTimeout(150);
  if (!await page.locator(".chip.aptitude.on").count()) fail("the aptitude did not stay selected");

  // The sheet panel picks up the morph's stat line.
  const readStat = async (label) => {
    const text = await page.locator(".sheet-mini-grid .stat", { hasText: label }).first().innerText();
    return text.replace(/\s+/g, " ");
  };
  if (await readStat("ST") !== "ST 20") fail(`sheet panel ST reads "${await readStat("ST")}", expected 20 for a Fury`);
  // HP is canon Durability divided by three in this revision of the conversion.
  if (await readStat("HP") !== "HP 17") fail(`sheet panel HP reads "${await readStat("HP")}", expected 17 for a Fury`);

  // A modifier the library ships disabled can be switched on.
  const modSection = page.locator(".card", { hasText: "Fine-tune the morph" });
  await modSection.locator("summary").first().click();
  await page.waitForTimeout(200);
  const modChip = modSection.locator(".chip:not(.on)").first();
  if (await modChip.count()) {
    await modChip.click();
    await page.waitForTimeout(250);
    if (!await modSection.locator(".chip.on").count()) fail("toggling a trait modifier did not stick");
  } else {
    fail("the morph modifier editor offered nothing to toggle");
  }

  // Step 8 — equipment.
  await gotoStep("Equipment");
  await page.waitForTimeout(600);
  await page.locator("input[type=search]").first().fill("Backup Insurance");
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Add", exact: true }).first().click();
  await page.waitForTimeout(200);

  // Step 10b — sheet settings reach the file.
  await gotoStep("Sheet & profile");
  await page.waitForTimeout(200);
  await page.locator("select").first().selectOption("knowing_your_own_strength");
  await page.waitForTimeout(200);

  // Step 11 — review and export.
  await gotoStep("Review");
  await page.waitForTimeout(1200);
  const findings = await page.locator(".finding").count();
  if (!findings) fail("the review step listed no checks");

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download .gcs" }).click(),
  ]);
  const saved = join(downloads, download.suggestedFilename());
  await download.saveAs(saved);
  if (download.suggestedFilename() !== "Browser Test Sentinel.gcs") {
    fail(`downloaded as "${download.suggestedFilename()}"`);
  }

  const entity = JSON.parse(readFileSync(saved, "utf8"));
  const v = validateEntity(entity);
  for (const problem of v.problems) fail(problem);
  for (const warning of v.warnings) fail(`warning: ${warning}`);

  if (entity.profile.name !== "Browser Test Sentinel") fail("the name did not reach the sheet");
  const iq = entity.attributes.find((a) => a.attr_id === "iq");
  if (!iq || iq.adj !== 2) fail(`IQ adj is ${iq?.adj}, expected 2 (base 11 → 13)`);
  if (!entity.traits?.some((t) => t.name === "Fury")) fail("the Fury is not on the sheet");
  if (!entity.skills?.some((s) => s.name === "Computer Hacking")) fail("Computer Hacking is missing");
  if (!entity.equipment?.length) fail("no equipment reached the sheet");
  if (!entity.traits?.some((t) => t.name === "Combat Reflexes")) {
    fail("the hand-entered trait is not on the sheet");
  }
  if (!entity.traits?.some((t) => t.name === "Identity Crysis")) {
    fail("the library ego trait is not on the sheet");
  }
  if (entity.settings.damage_progression !== "knowing_your_own_strength") {
    fail(`damage_progression is "${entity.settings.damage_progression}", expected the one selected`);
  }
  if (!entity.notes?.length) fail("the build-notes page is missing");

  // Progress must survive a reload.
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await gotoStep("Morph");
  await page.waitForTimeout(400);
  if (!await page.locator(".pick-card.active", { hasText: "Fury" }).count()) {
    fail("the chosen morph did not survive a reload");
  }

  if (consoleErrors.length) {
    for (const line of consoleErrors.slice(0, 10)) fail(`console: ${line}`);
  }

  console.log(
    `  built and exported in-browser: ${entity.traits.length} traits, ` +
    `${entity.skills.length} skills, ${entity.equipment.length} items, ${v.seenIDs.size} ids`,
  );
} finally {
  await browser.close();
  server.close();
  await rm(downloads, { recursive: true, force: true });
}

if (failures) {
  console.error(`browser: ${failures} problems`);
  process.exit(1);
}
console.log("browser: the page builds and exports a valid sheet end to end");
