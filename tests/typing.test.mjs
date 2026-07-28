// Typing must not tear down the field being typed into.
//
// Every keystroke used to run the whole step through render(), which clears the
// step body and rebuilds it. The replacement input is a different element, so
// focus went to the body — and on a phone, losing focus closes the keyboard
// after the first character. This drives a real touch-emulated browser and
// checks that a whole word arrives and the caret stays where it was.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname, normalize } from "node:path";
import { chromium, devices } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const TYPES = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".attr": "application/json",
  ".adq": "application/json", ".eqp": "application/json", ".skl": "application/json",
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

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
// A phone: touch events, small viewport, mobile user agent.
const context = await browser.newContext({ ...devices["Pixel 5"] });
const page = await context.newPage();

let failures = 0;
const fail = (message) => { failures += 1; console.error(`  ${message}`); };

/** Type character by character, the way a keyboard does. */
async function typeInto(locator, text) {
  await locator.click();
  for (const character of text) {
    await locator.press(character === " " ? "Space" : character);
    await page.waitForTimeout(60);
  }
}

const focusedTag = () => page.evaluate(() => {
  const node = document.activeElement;
  return node ? `${node.tagName.toLowerCase()}${node.type ? `[${node.type}]` : ""}` : "none";
});

const gotoStep = async (name) => {
  await page.locator(".step-link", { hasText: name }).first().click();
  await page.waitForTimeout(200);
};

// The sidebar carries its own tables and comes first in the DOM, so anything
// looking for a step's controls has to say so.
const body = page.locator("#step-main");

try {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  // --- a plain text field: the character's name --------------------------
  {
    const name = body.locator("input[type=text]").first();
    await typeInto(name, "Mara Ito");
    const value = await name.inputValue();
    if (value !== "Mara Ito") {
      fail(`character name came out as "${value}" — keystrokes were dropped`);
    }
    if (await focusedTag() !== "input[text]") {
      fail(`focus left the name field while typing (now on ${await focusedTag()})`);
    }
  }

  // --- a number field that changes the running totals ---------------------
  {
    await gotoStep("Attributes");
    const iq = body.locator(".attr-input").nth(1);
    await iq.click();
    await iq.fill("");
    await typeInto(iq, "13");
    if (await iq.inputValue() !== "13") {
      fail(`IQ came out as "${await iq.inputValue()}" — keystrokes were dropped`);
    }
    if (await focusedTag() !== "input[number]") {
      fail(`focus left the attribute field while typing (now on ${await focusedTag()})`);
    }
    // The point of re-rendering: the totals must still be live.
    const total = (await page.locator(".attr-table tfoot .num").innerText()).trim();
    if (total !== "40") fail(`the attribute total reads ${total}, expected 40 — totals stopped updating`);
  }

  // --- a textarea, and the caret ------------------------------------------
  {
    await gotoStep("Sheet & profile");
    const notes = body.locator("textarea").first();
    await typeInto(notes, "field notes");
    if (await notes.inputValue() !== "field notes") {
      fail(`the notes field came out as "${await notes.inputValue()}"`);
    }
    // Put the caret in the middle and keep typing: it must not jump to the end.
    await notes.evaluate((n) => n.setSelectionRange(5, 5));
    await notes.press("X");
    await page.waitForTimeout(150);
    const after = await notes.inputValue();
    if (after !== "fieldX notes") {
      fail(`typing mid-string gave "${after}", expected "fieldX notes" — the caret jumped`);
    }
  }

  // --- a hand-entered trait: name field plus a live cost beside it ---------
  {
    await gotoStep("Traits");
    await body.locator(".chip", { hasText: "Bad Temper" }).first().click();
    await page.waitForTimeout(300);
    const name = body.locator("table tbody input[type=text]").first();
    await name.click();
    await name.fill("");
    await typeInto(name, "Short Fuse");
    if (await name.inputValue() !== "Short Fuse") {
      fail(`the trait name came out as "${await name.inputValue()}"`);
    }
    if (await focusedTag() !== "input[text]") {
      fail("focus left the trait name field while typing");
    }
    // Changing the point value must update the cost cell without a re-render.
    const points = body.locator("table tbody input[type=number]").first();
    await points.click();
    await points.fill("");
    await typeInto(points, "-20");
    const cost = (await body.locator("table tbody tr").first().locator("td.num").innerText()).trim();
    if (cost !== "-20") fail(`the trait cost cell reads ${cost}, expected -20 — it went stale`);
    if (await focusedTag() !== "input[number]") {
      fail("focus left the trait points field while typing");
    }
  }

  // --- the value survives a step change ------------------------------------
  {
    await gotoStep("Review");
    await page.waitForTimeout(1500);
    if (!await page.locator("h3", { hasText: "Mara Ito" }).count()) {
      fail("the typed name never reached the build");
    }
  }

  // --- a slider drag, on a pointer device ----------------------------------
  // Playwright's touchscreen can tap but not drag, so this one runs against a
  // mouse. The failure it guards against is the same: replacing the element
  // mid-gesture drops the pointer and the drag stops after one step.
  {
    const desktop = await browser.newContext();
    const dpage = await desktop.newPage();
    await dpage.goto(base, { waitUntil: "networkidle" });
    await dpage.waitForTimeout(400);
    await dpage.locator(".step-link", { hasText: "Faction" }).first().click();
    await dpage.waitForTimeout(300);

    const dbody = dpage.locator("#step-main");
    const slider = dbody.locator(".rep-range").first();
    // mouse.move works in viewport coordinates and does not scroll, so the
    // element has to be on screen before its box means anything.
    await slider.scrollIntoViewIfNeeded();
    await dpage.waitForTimeout(150);
    const box = await slider.boundingBox();
    const y = box.y + box.height / 2;
    await dpage.mouse.move(box.x + box.width * 0.1, y);
    await dpage.mouse.down();
    for (const fraction of [0.3, 0.5, 0.75]) {
      await dpage.mouse.move(box.x + box.width * fraction, y);
      await dpage.waitForTimeout(80);
    }
    await dpage.mouse.up();
    await dpage.waitForTimeout(250);

    const level = Number(await slider.inputValue());
    if (!(level > 1)) {
      fail(`the rep slider ended on ${level} after dragging to 75% — the drag was interrupted`);
    }
    const label = (await dbody.locator(".rep-level").first().innerText()).trim();
    if (label !== String(level)) {
      fail(`the slider reads ${level} but its label says ${label} — the label went stale`);
    }
    await desktop.close();
  }
} finally {
  await browser.close();
  server.close();
}

if (failures) {
  console.error(`typing: ${failures} problems`);
  process.exit(1);
}
console.log(
  "typing: text, number and textarea fields keep focus and the caret, derived cells stay live, " +
  "and a slider survives a drag",
);
