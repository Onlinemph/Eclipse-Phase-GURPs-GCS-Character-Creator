// Checks that the live sheet resolves features into the numbers the morph
// library says a body has.
//
// Every morph's notes state its converted stat line — "ST 20, HT 12, HP 30,
// DX +2, Basic Speed +2.00" — written by hand when the conversion was made. The
// features attached to the morph's traits are what GCS actually reads. If the
// two agree across all 103 morphs, the feature engine is resolving them the way
// GCS will.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { computeSheet } from "../js/sheet.js";
import { basicLift, thrust, swing, formatDice, moveAt, dodgeAt, encumbranceFor } from "../js/features.js";
import { defaultBuild } from "../js/state.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GEN = join(ROOT, "data/gen");
const read = (p) => JSON.parse(readFileSync(join(GEN, p), "utf8"));

const cat = {
  attrDefs: read("attributes.json").rows,
  packages: read("packages.json"),
  epSkills: read("skills-ep.json"),
  morphIndex: read("morph-index.json").morphs,
  morphs: new Map(),
  augs: read("augs.json"),
  gear: read("gear.json"),
  sleights: read("sleights.json"),
  egoTraits: read("ego-traits.json"),
};
for (const file of readdirSync(join(GEN, "morphs"))) {
  cat.morphs.set(file.replace(/\.json$/, ""), read(join("morphs", file)));
}

let failures = 0;
const fail = (message) => { failures += 1; console.error(`  ${message}`); };

// --- the GURPS tables ------------------------------------------------------
// Spot values from the Basic Set, so an error in the formulas is obvious.

const DAMAGE = [
  [10, "1d-2", "1d"], [12, "1d-1", "1d+2"], [14, "1d", "2d"],
  [19, "2d-1", "3d+1"], [20, "2d-1", "3d+2"], [1, "1d-6", "1d-5"],
];
for (const [st, thr, sw] of DAMAGE) {
  if (formatDice(thrust(st)) !== thr) fail(`thrust for ST ${st} is ${formatDice(thrust(st))}, expected ${thr}`);
  if (formatDice(swing(st)) !== sw) fail(`swing for ST ${st} is ${formatDice(swing(st))}, expected ${sw}`);
}

// GCS rounds Basic Lift to a whole number once it reaches 10 lb.
const LIFT = [[10, 20], [12, 29], [20, 80], [1, 0.2], [0, 0]];
for (const [st, expected] of LIFT) {
  if (basicLift(st) !== expected) fail(`Basic Lift for ST ${st} is ${basicLift(st)}, expected ${expected}`);
}

// Encumbrance: Move drops 20% per level and Dodge one point per level.
if (moveAt(6, 0) !== 6 || moveAt(6, -1) !== 4 || moveAt(6, -4) !== 1) {
  fail(`Move at encumbrance is wrong: ${[0, -1, -4].map((p) => moveAt(6, p)).join(", ")}`);
}
if (dodgeAt(6, 0) !== 9 || dodgeAt(6, -2) !== 7) {
  fail(`Dodge at encumbrance is wrong: ${dodgeAt(6, 0)}, ${dodgeAt(6, -2)}`);
}
if (encumbranceFor(20, 20).key !== "none" || encumbranceFor(21, 20).key !== "light") {
  fail("encumbrance thresholds are wrong at the Basic Lift boundary");
}

// --- morph stat lines ------------------------------------------------------

/**
 * Pull the stat line out of a morph's notes: "ST 20, HT 12, HP 30, DX +2".
 *
 * A signed value is a bonus over the Ego's own; a bare number is what the body
 * supplies whole. A few morphs list the same attribute twice — the Faust has
 * "Will +6, Will +1" — so bonuses accumulate rather than replacing each other.
 */
function statedStats(notes) {
  const stats = {};
  for (const match of notes.matchAll(/\b(ST|HT|HP|FP|DX|IQ|Will|Per)\s+([+-]?\d+)/g)) {
    const [, name, raw] = match;
    const id = name.toLowerCase();
    const relative = /^[+-]/.test(raw);
    if (relative && stats[id]?.relative) stats[id].value += Number(raw);
    else stats[id] = { value: Number(raw), relative };
  }
  return stats;
}

/**
 * Stat lines GCS cannot reach, with the reason.
 *
 * The Q-Morph models DX −2 as a trait with −2 levels, and GCS clamps a negative
 * level count to zero on load, so the penalty never applies. Same root cause as
 * the entry in known-cost-divergences.json.
 */
const KNOWN_UNREACHABLE = {
  "Q-Morph:dx": "modelled as negative trait levels, which GCS clamps to zero",
};

const BASE = { dx: 11, iq: 11, will: 10, per: 10 };
let checked = 0;
const mismatches = [];

for (const entry of cat.morphIndex) {
  const build = defaultBuild();
  // No aptitude selected: the stat lines describe the stock morph.
  build.morph = { key: entry.key, aptitudes: new Array(entry.slots).fill(-1) };
  const sheet = computeSheet(build, cat);
  const stated = statedStats(entry.notes);

  for (const [id, { value, relative }] of Object.entries(stated)) {
    const actual = sheet.values[id];
    const expected = relative ? (BASE[id] ?? 0) + value : value;
    if (id === "basic_speed") continue; // derived from DX and HT, checked below
    checked += 1;
    if (actual !== expected && !KNOWN_UNREACHABLE[`${entry.name}:${id}`]) {
      mismatches.push(`${entry.name}: notes say ${id.toUpperCase()} ${relative && value > 0 ? "+" : ""}${value} ` +
        `(so ${expected}), features resolve to ${actual}`);
    }
  }

  // Basic Speed is (DX + HT) / 4 plus whatever the morph adds.
  const derived = (sheet.values.dx + sheet.values.ht) / 4;
  const bonus = sheet.resolved.bonuses.basic_speed || 0;
  if (Math.abs(sheet.values.basic_speed - (derived + bonus)) > 0.001) {
    mismatches.push(`${entry.name}: Basic Speed ${sheet.values.basic_speed}, expected ${derived + bonus}`);
  }
}

if (mismatches.length) {
  console.error(`sheet: ${mismatches.length} of ${checked} stat-line checks disagree`);
  for (const line of mismatches.slice(0, 20)) console.error(`  ${line}`);
  failures += mismatches.length;
}

// --- the Ego/morph split ---------------------------------------------------

{
  const blank = defaultBuild();
  const sheet = computeSheet(blank, cat);
  for (const id of ["st", "ht", "hp", "fp"]) {
    if (sheet.values[id] !== 0) fail(`with no morph, ${id} is ${sheet.values[id]} rather than 0`);
  }
  if (sheet.embodied) fail("a character with no morph reads as embodied");
  if (sheet.values.dx !== 11 || sheet.values.iq !== 11) {
    fail("the post-Fall baseline of DX 11 and IQ 11 did not survive");
  }
}

// --- a morph's own bonuses stack with what the Ego bought ------------------

{
  const build = defaultBuild();
  build.attributes = { dx: 12, iq: 13, will: 12, per: 12 };
  const fury = cat.morphIndex.find((m) => m.name === "Fury");
  build.morph = { key: fury.key, aptitudes: [3] }; // +5 WIL
  const sheet = computeSheet(build, cat);

  const expect = (id, want, why) => {
    if (sheet.values[id] !== want) fail(`Fury ${id}: ${sheet.values[id]}, expected ${want} (${why})`);
  };
  expect("dx", 14, "DX 12 bought, +2 from the morph");
  expect("will", 18, "Will 12 bought, +3 morph, +3 from the WIL aptitude");
  expect("st", 20, "the morph supplies it whole");
  // HP is canon Durability divided by three in this revision of the conversion;
  // it was Durability x 0.6 before, which put the Fury at 30.
  expect("hp", 17, "the morph supplies it whole");
  if (sheet.values.basic_speed !== 8.5) {
    fail(`Fury Basic Speed ${sheet.values.basic_speed}, expected 8.5 ((14+12)/4 + 2.00)`);
  }
  if (sheet.damage.thrust !== "2d-1" || sheet.damage.swing !== "3d+2") {
    fail(`Fury damage ${sheet.damage.thrust}/${sheet.damage.swing}, expected 2d-1/3d+2 at ST 20`);
  }
  // DR is mapped onto Ultra-Tech's armour scale rather than scaled down from
  // Eclipse Phase's, so a Fury shrugs off an assault carbine.
  const skull = sheet.dr.find((d) => d.key === "skull");
  if (!skull || skull.value !== 20) fail(`Fury skull DR ${skull?.value}, expected 20`);
}

if (failures) {
  console.error(`sheet: ${failures} problems`);
  process.exit(1);
}
console.log(
  `sheet: GURPS tables match, and ${checked} stat-line values across ` +
  `${cat.morphIndex.length} morphs resolve from features as their notes describe ` +
  `(${Object.keys(KNOWN_UNREACHABLE).length} known exception)`,
);
