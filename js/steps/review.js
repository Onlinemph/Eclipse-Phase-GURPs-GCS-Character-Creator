// Step 11: final checks, then write the .gcs file.

import {
  el, button, notice, checkbox, download, readFile, money, points, details,
} from "../ui.js";
import { buildSheet } from "../build.js";
import { serialize, filenameFor } from "../gcs.js";
import { totals, cashSpent, disadvantageTally, validate, DISADVANTAGE_LIMIT } from "../state.js";
import { fullSheet } from "./sheet-panel.js";

const CHECKLIST = [
  "ST, HT, HP and FP are supplied by the morph and were not purchased.",
  "Exactly one option is enabled per customization slot, and none if the morph has no slots.",
  "Basic Speed and Dodge have recomputed since the morph was attached.",
  "Professional Skill (Resleeving) has points assigned, or the −5 default is accepted.",
  "Free Fall and Environment Suit have points if the character was raised off a planetary surface.",
  "Backup insurance is purchased or deliberately declined.",
  "The total is the campaign's point total, including the morph.",
];

export default {
  title: "Review & export",
  subtitle: "The disadvantage limit is −50, and only mental and social traits count against it.",

  render(ctx) {
    const { build, cat, update, need } = ctx;

    // The exporter needs every catalogue, whether or not the player visited
    // those steps.
    const missing = ["augs", "gear", "sleights", "egoTraits"].filter((n) => !cat[n]);
    if (missing.length) {
      need(...missing).then(() => update());
      return el("p.muted", "Loading the remaining catalogues before export…");
    }

    const t = totals(build, cat);
    const dis = disadvantageTally(build, cat);
    const findings = validate(build, cat);
    const blocking = findings.filter((f) => f.level === "error");

    return el("div.stack",
      summary(build, cat, t, dis),
      fullSheet(build, cat),
      checks(findings),
      exportCard(build, cat, blocking, update),
      buildFileCard(ctx),
      el("section.card",
        el("h3", "Before you finalise"),
        el("ul.checklist", CHECKLIST.map((line) => el("li", line))),
        notice("info",
          "The Morph Price Adjustment appears in GCS's disadvantage total. It is a bookkeeping " +
          "trait that sets the morph to its chargen price and does not count against the −50 limit.",
        ),
      ),
      resleeveCard(),
    );
  },
};

function summary(build, cat, t, dis) {
  const morph = cat.morphIndex.find((m) => m.key === build.morph?.key);
  const bg = cat.packages.backgrounds.find((b) => b.key === build.background);
  const fac = cat.packages.factions.find((f) => f.key === build.faction);
  const rep = Object.entries(build.repnets)
    .filter(([, level]) => level > 0)
    .map(([key, level]) => {
      const entry = cat.packages.repnets.find((r) => r.key === key);
      return `${entry ? entry.code : key} ${level}`;
    });

  return el("section.card",
    el("h3", build.profile.name || "Unnamed character"),
    el("div.summary-grid",
      el("div", el("dt", "Background"), el("dd", bg ? bg.name : "none")),
      el("div", el("dt", "Faction"), el("dd", fac ? fac.name : "unaffiliated")),
      el("div", el("dt", "Reputation"), el("dd", rep.length ? rep.join(", ") : "none")),
      el("div", el("dt", "Morph"), el("dd", morph ? `${morph.name} (${morph.points} pts)` : "none")),
      el("div", el("dt", "Skills"), el("dd", `${build.skills.length}, ${t.lines.skills} points`)),
      el("div", el("dt", "Muse"), el("dd", build.muse === "ally" ? "Ally [5]" : "0 points")),
      el("div", el("dt", "Async"), el("dd", build.psi.enabled ? `yes, Talent ${build.psi.talent}` : "no")),
      el("div", el("dt", "Equipment"), el("dd", money(cashSpent(build, cat)))),
    ),
    el("table.table",
      el("thead", el("tr", el("th", "Line"), el("th", "Points"))),
      el("tbody",
        Object.entries(t.lines).map(([name, value]) =>
          el("tr", el("td", name), el("td.num", String(value))),
        ),
      ),
      el("tfoot",
        el("tr", el("th", "Spent"), el("td.num", `${t.spent} / ${t.total}`)),
        el("tr", el("th", "Remaining"), el("td.num" + (t.remaining < 0 ? ".negative" : ""), String(t.remaining))),
      ),
    ),
    dis.counted.length
      ? details(`Disadvantage tally: ${dis.total} of ${DISADVANTAGE_LIMIT}`,
          el("table.table",
            el("tbody",
              dis.counted.map((d) =>
                el("tr", el("td", d.name), el("td.muted", d.origin), el("td.num", String(d.points))),
              ),
            ),
          ),
        )
      : null,
  );
}

function checks(findings) {
  const order = { error: 0, warn: 1, ok: 2 };
  const sorted = [...findings].sort((a, b) => order[a.level] - order[b.level]);
  return el("section.card",
    el("h3", "Checks"),
    el("ul.findings",
      sorted.map((f) => el(`li.finding.${f.level}`, f.text)),
    ),
  );
}

function exportCard(build, cat, blocking, update) {
  const status = el("div");

  const write = () => {
    const { entity, log } = buildSheet(build, cat);
    download(filenameFor(build.profile.name), serialize(entity), "application/json");
    status.replaceChildren(
      notice("ok", `Wrote ${filenameFor(build.profile.name)}.`),
      ...log.priceAdjustments.map((p) =>
        notice("info",
          `${p.morph}: the price adjustment was re-pointed from ${p.from} to ${p.to} so the ` +
          `morph totals its documented chargen price of ${p.target} points in GCS.`,
        ),
      ),
      ...log.notes.map((n) => notice("warn", n)),
    );
  };

  return el("section.card",
    el("h3", "Export to GCS"),
    el("p",
      "The file is a complete GCS 5.x character sheet. It embeds the Eclipse Phase attribute " +
      "definitions, so it opens and computes correctly even on a machine that has never loaded " +
      "EP_ATT.attr.",
    ),
    el("div.stack",
      checkbox(
        "Correct morph price adjustments so morphs cost their documented chargen price",
        build.options.normalizeMorphPrice,
        (v) => update((b) => { b.options.normalizeMorphPrice = v; }),
      ),
      checkbox(
        "Include a build-notes page on the sheet",
        build.options.includeBuildNote,
        (v) => update((b) => { b.options.includeBuildNote = v; }),
      ),
    ),
    blocking.length
      ? notice("warn",
          `${blocking.length} check${blocking.length === 1 ? " is" : "s are"} failing. The file ` +
          "will still be written — GCS will open it — but the character is not legal as built.",
        )
      : null,
    el("div.row", button("Download .gcs", write, "primary")),
    status,
    el("p.muted",
      "Open it with File → Open in GCS, or double-click it if .gcs files are associated.",
    ),
  );
}

function buildFileCard(ctx) {
  const { build } = ctx;
  return el("section.card",
    el("h3", "Save this build"),
    el("p.muted",
      "Progress is kept in this browser automatically. Export a build file to move it to another " +
      "machine, share it with a GM, or keep a copy before experimenting.",
    ),
    el("div.row",
      button("Export build file", () => {
        const name = (build.profile.name || "character").replace(/[^\w\s-]/g, "").trim();
        download(`${name || "character"}.epbuild.json`, JSON.stringify(build, null, 2));
      }),
      button("Import build file", async () => {
        const text = await readFile(".json,.epbuild.json");
        if (!text) return;
        try {
          const next = JSON.parse(text);
          ctx.replace(next);
          if (next.morph?.key) await ctx.needMorph(next.morph.key);
          ctx.update();
        } catch (error) {
          alert(`That is not a build file: ${error.message}`);
        }
      }),
      button("Start over", () => {
        if (confirm("Discard this character and start again?")) ctx.reset();
      }, "ghost"),
    ),
  );
}

function resleeveCard() {
  return el("section.card",
    details("Reference: the first resleeve",
      el("p.muted",
        "Not part of character creation, but the procedure the sheet is built to support.",
      ),
      el("p",
        "Recovery depends on what survives. If the cortical stack is recovered, the character " +
        "returns with memories intact to the moment of death. If it is not but backup insurance " +
        "is current, they return from their last backup, missing everything since. If neither, " +
        "the death is permanent.",
      ),
      el("dl.rules",
        el("div",
          el("dt", "Integration"),
          el("dd",
            "HT-based Professional Skill (Resleeving), using the new morph's HT. Success imposes " +
            "−1 to DX-based rolls for 24 hours; failure imposes −2 and −1 to Basic Speed, with an " +
            "HT roll each morning to end it.",
          ),
        ),
        el("div",
          el("dt", "Alienation"),
          el("dd",
            "IQ-based Professional Skill (Resleeving). +6 for a morph occupied six months or " +
            "more, −2 for a first synthmorph, −4 for moderate physiological change, −6 for a " +
            "radically nonhuman body plan, −4 if the character is a fork.",
          ),
        ),
        el("div",
          el("dt", "Continuity"),
          el("dd",
            "A Will roll, skipped entirely if the character went under in one body and woke in " +
            "another. Otherwise the base stress depends on how the death is remembered and how " +
            "old the backup is.",
          ),
        ),
      ),
      el("p.muted",
        "Failed Alienation and Continuity rolls produce temporary mental disadvantages in " +
        "5-point increments, fading over 1d weeks. This is the recurring cost of death in the " +
        "setting: the body is replaceable and the accumulated mental damage is not.",
      ),
    ),
  );
}
