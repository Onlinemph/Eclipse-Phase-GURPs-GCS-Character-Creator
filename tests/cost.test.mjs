// Replays every trait row in the bundled libraries through the wizard's cost
// engine and compares against the `calc.points` value stored beside it.
//
// Those stored values were written by the tool that generated the libraries,
// not by GCS, and a small number of them disagree with what GCS computes: some
// were rounded to nearest where GURPS rounds a modified cost up (B101), and
// some were totalled without applying the modifiers enabled on the row's own
// traits. Those are recorded in known-cost-divergences.json with the reason, so
// the set stays visible and any new divergence fails the run.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { traitPoints } from "../js/cost.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURE = join(ROOT, "tests/fixtures/known-cost-divergences.json");
const UPDATE = process.argv.includes("--update");

const FILES = [
  "Eclipse_Phase_Morphs.adq",
  "Eclipse_Phase_Ego_Packages.adq",
  "Eclipse_Phase_Mods_Traits.adq",
  "Eclipse_Phase_Psi_Sleights.adq",
];

let checked = 0;
const found = new Map();

/**
 * Why a row diverges. A container's total is the sum of its children, so a
 * container only diverges because something beneath it does; the leaves are
 * where the cause lives — either an enabled percentage modifier the library's
 * generator did not apply, or a fractional cost it rounded to nearest instead
 * of up.
 */
function cause(row, stored, computed) {
  if (row.children) return "rolls up from children";
  // GCS clamps a negative level count to zero on load, so a trait written as
  // "−2 levels at 20 points" is worth nothing rather than −40.
  if ((row.levels || 0) < 0) return "negative levels clamped to zero by GCS";
  const modified = (row.modifiers || [])
    .some((m) => !m.disabled && /%/.test(m.cost_adj || ""));
  if (Math.abs(stored - computed) === 1 && modified) return "rounded to nearest, not up";
  return modified ? "enabled modifiers not applied" : "unexplained";
}

function visit(row, file, path) {
  const stored = row.calc?.points;
  if (stored !== undefined) {
    checked += 1;
    const computed = traitPoints(row);
    if (computed !== stored) {
      found.set(`${file}: ${[...path, row.name].join(" / ")}`, {
        stored,
        computed,
        cause: cause(row, stored, computed),
      });
    }
  }
  for (const child of row.children || []) visit(child, file, [...path, row.name]);
}

for (const file of FILES) {
  const data = JSON.parse(readFileSync(join(ROOT, "data/library", file), "utf8"));
  for (const row of data.rows) visit(row, file, []);
}

const current = Object.fromEntries([...found.entries()].sort(([a], [b]) => a.localeCompare(b)));

if (UPDATE || !existsSync(FIXTURE)) {
  writeFileSync(FIXTURE, `${JSON.stringify(current, null, 2)}\n`);
  console.log(`cost: wrote ${Object.keys(current).length} known divergences to the fixture`);
  process.exit(0);
}

const known = JSON.parse(readFileSync(FIXTURE, "utf8"));
const problems = [];

for (const [key, value] of Object.entries(current)) {
  const previous = known[key];
  if (!previous) {
    problems.push(`new divergence — ${key}: library says ${value.stored}, GCS computes ${value.computed}`);
  } else if (previous.computed !== value.computed || previous.stored !== value.stored) {
    problems.push(
      `changed — ${key}: was ${previous.stored}/${previous.computed}, now ${value.stored}/${value.computed}`,
    );
  }
}
for (const key of Object.keys(known)) {
  if (!current[key]) problems.push(`resolved — ${key} no longer diverges; re-run with --update`);
}

if (problems.length) {
  console.error("cost: the set of known divergences moved");
  for (const problem of problems.slice(0, 25)) console.error(`  ${problem}`);
  process.exit(1);
}

const agreed = checked - Object.keys(current).length;
console.log(
  `cost: ${agreed} of ${checked} trait rows match the stored point totals; ` +
  `${Object.keys(current).length} known divergences unchanged`,
);
