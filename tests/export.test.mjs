// Builds characters end to end and validates the resulting .gcs files.
//
// This is the test that matters: it runs the same code the browser runs, over
// the same catalogues the browser fetches, and holds the output to the GCS 5
// schema derived from the GCS source.

import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildSheet } from "../js/build.js";
import { serialize, isTID } from "../js/gcs.js";
import { defaultBuild, totals, validate, cashSpent } from "../js/state.js";
import { validateEntity } from "./gcs-schema.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GEN = join(ROOT, "data/gen");
const OUT = join(ROOT, "tests/output");

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
};
for (const file of readdirSync(join(GEN, "morphs"))) {
  cat.morphs.set(file.replace(/\.json$/, ""), read(join("morphs", file)));
}

const find = (list, name) => {
  const hit = list.find((x) => x.name === name);
  if (!hit) throw new Error(`fixture references a missing catalogue entry: ${name}`);
  return hit;
};
const gearKey = (name) =>
  find(cat.gear.categories.flatMap((c) => c.items), name).key;

let failures = 0;
const fail = (label, message) => { failures += 1; console.error(`  ${label}: ${message}`); };

// --- fixtures --------------------------------------------------------------

/** A sentinel: a Firewall sentinel in a Fury, with implants and a rifle. */
function sentinel() {
  const b = defaultBuild();
  b.profile.name = "Test Sentinel";
  b.profile.player_name = "regression suite";
  b.attributes = { dx: 12, iq: 13, will: 12, per: 12 };
  b.background = find(cat.packages.backgrounds, "Martian Settler").key;
  b.faction = find(cat.packages.factions, "Firewall Sentinel").key;
  b.repnets[find(cat.packages.repnets, "Reputation: i-rep (The Eye)").key] = 3;
  b.repnets[find(cat.packages.repnets, "Reputation: g-rep (Guanxi)").key] = 2;
  b.morph = { key: find(cat.morphIndex, "Fury").key, aptitudes: [3] };
  b.skills = [
    { source: "ep", key: find(cat.epSkills.groups[0].items, "Computer Hacking").key,
      kind: "skill", name: "Computer Hacking", difficulty: "iq/vh", points: 8 },
    { source: "ep", key: find(cat.epSkills.groups[0].items, "Professional Skill (Resleeving)").key,
      kind: "skill", name: "Professional Skill (Resleeving)", difficulty: "ht/a", points: 4 },
    { source: "ep", key: find(cat.epSkills.groups[0].items, "Free Fall").key,
      kind: "skill", name: "Free Fall", difficulty: "dx/a", points: 4 },
    { source: "gurps", kind: "skill", name: "Guns", specialization: "Rifle",
      difficulty: "dx/e", points: 4 },
    { source: "gurps", kind: "skill", name: "Stealth", difficulty: "dx/a", points: 4 },
    { source: "custom", kind: "skill", name: "Expert Skill", specialization: "Exsurgent Biology",
      difficulty: "iq/h", points: 2, techLevel: null },
  ];
  b.augEquipment = [{ key: find(cat.augs.equipment, "Medichines").key, qty: 1 }];
  b.augTraits = [{ key: find(cat.augs.traits, "Enhanced Time Sense").key, offset: true }];
  b.gear = [
    { key: gearKey("Backup Insurance (1 year)"), qty: 1 },
    { key: gearKey("Assault Carbine, 7mmCL"), qty: 1 },
    { key: gearKey("Ecto (flexible tablet)"), qty: 1 },
  ];
  b.muse = "ally";
  b.notes = "Built by the regression suite.";
  return b;
}

/** An async in a biomorph, exercising sleights and Alternative Abilities. */
function asyncCharacter() {
  const b = defaultBuild();
  b.profile.name = "Test Async";
  b.attributes = { dx: 11, iq: 12, will: 14, per: 11 };
  b.background = find(cat.packages.backgrounds, "Lost Generation").key;
  b.faction = find(cat.packages.factions, "Scum").key;
  b.morph = { key: find(cat.morphIndex, "Splicer").key, aptitudes: [] };
  const morphEntry = cat.morphIndex.find((m) => m.key === b.morph.key);
  b.morph.aptitudes = new Array(morphEntry.slots).fill(3);
  b.psi = {
    enabled: true, talent: 2, disorders: "Delusion [−10], Nightmares [−5]",
    sleights: [],
  };
  const items = cat.sleights.groups.flatMap((g) => g.items);
  const primary = find(items, "Deep Scan");
  const alt1 = find(items, "Thought Browse");
  const alt2 = find(items, "Ego Sense");
  b.psi.sleights = [
    { key: primary.key, alternate: false },
    { key: alt1.key, alternate: true },
    { key: alt2.key, alternate: true },
  ];
  b.skills = [primary, alt1, alt2]
    .filter((s) => s.skill)
    .map((s) => ({ source: "psi", kind: "skill", name: s.skill, difficulty: "iq/h", points: 4 }));
  b.gear = [{ key: gearKey("Backup Insurance (1 year)"), qty: 1 }];
  return b;
}

/** The empty case: nothing chosen at all. */
function blank() {
  const b = defaultBuild();
  b.profile.name = "Test Blank";
  return b;
}

/** A technique with a nameable, and a synthmorph. */
function synth() {
  const b = defaultBuild();
  b.profile.name = "Test Synth";
  b.morph = { key: find(cat.morphIndex, "Steel Morph").key, aptitudes: [] };
  const entry = cat.morphIndex.find((m) => m.key === b.morph.key);
  b.morph.aptitudes = new Array(entry.slots).fill(0);
  const tech = find(cat.epSkills.groups.find((g) => g.name === "Techniques").items,
    "Free Fall Training (@Skill@)");
  b.skills = [
    { source: "ep", key: tech.key, kind: "technique", name: tech.name,
      difficulty: tech.difficulty, points: 2, replacement: "Guns (Rifle)",
      needsReplacement: true },
  ];
  return b;
}

// --- run -------------------------------------------------------------------

const FIXTURES = [
  ["sentinel", sentinel],
  ["async", asyncCharacter],
  ["blank", blank],
  ["synth", synth],
];

mkdirSync(OUT, { recursive: true });

for (const [label, make] of FIXTURES) {
  const build = make();
  const { entity, log } = buildSheet(build, cat);
  const text = serialize(entity);
  writeFileSync(join(OUT, `${label}.gcs`), text);

  // Round-trips as JSON.
  let reparsed;
  try {
    reparsed = JSON.parse(text);
  } catch (error) {
    fail(label, `serialized output is not valid JSON: ${error.message}`);
    continue;
  }

  const v = validateEntity(reparsed);
  for (const problem of v.problems) fail(label, problem);
  for (const warning of v.warnings) fail(label, `warning: ${warning}`);

  // No recomputed or library-linked leftovers anywhere in the tree.
  if (/"(calc|source)":/.test(text)) {
    fail(label, "output still carries calc or source fields");
  }

  // The sheet's point total should match what the wizard displayed.
  const t = totals(build, cat);
  if (entity.total_points !== build.totalPoints) {
    fail(label, `total_points ${entity.total_points} != ${build.totalPoints}`);
  }
  if (t.spent > build.totalPoints) {
    fail(label, `fixture overspends: ${t.spent} of ${build.totalPoints}`);
  }
  if (cashSpent(build, cat) > build.startingWealth) {
    fail(label, "fixture overspends its starting wealth");
  }

  // Attribute adjustments must round-trip back to the values chosen.
  const defs = new Map(cat.attrDefs.map((d) => [d.id, d]));
  for (const [id, wanted] of Object.entries(build.attributes)) {
    const attr = entity.attributes.find((a) => a.attr_id === id);
    const base = Number(defs.get(id).base);
    if (!attr || base + attr.adj !== wanted) {
      fail(label, `attribute ${id} resolves to ${base + (attr?.adj ?? NaN)}, expected ${wanted}`);
    }
  }

  // ST, HT, HP and FP belong to the morph and must never carry an adjustment.
  for (const id of ["st", "ht", "hp", "fp"]) {
    const attr = entity.attributes.find((a) => a.attr_id === id);
    if (attr && attr.adj !== 0) fail(label, `${id} carries adj ${attr.adj}; the morph supplies it`);
  }

  // Exactly one aptitude enabled per slot, and only the chosen one.
  if (build.morph) {
    const entry = cat.morphIndex.find((m) => m.key === build.morph.key);
    const slots = [];
    (function walk(rows) {
      for (const row of rows) {
        if (String(row.name || "").startsWith("Choose One Aptitude")) slots.push(row);
        if (row.children) walk(row.children);
      }
    })(entity.traits);
    if (slots.length !== entry.slots) {
      fail(label, `${entry.name}: ${slots.length} aptitude slots on the sheet, expected ${entry.slots}`);
    }
    slots.forEach((slot, i) => {
      const on = (slot.modifiers || []).filter((m) => !m.disabled);
      const wanted = build.morph.aptitudes[i];
      if (wanted >= 0 && on.length !== 1) {
        fail(label, `${entry.name} slot ${i + 1}: ${on.length} options enabled, expected 1`);
      }
      if (wanted >= 0 && on[0] && on[0].name !== entry.slot_options[wanted].name) {
        fail(label, `${entry.name} slot ${i + 1}: enabled "${on[0].name}", expected "${entry.slot_options[wanted].name}"`);
      }
      if (slot.children) fail(label, `${entry.name} slot ${i + 1}: still carries children GCS would discard`);
    });

    // The morph must total its documented chargen price.
    const { traitPoints } = await import("../js/cost.js");
    const morphRow = entity.traits.find((t2) => t2.name === entry.name);
    if (!morphRow) {
      fail(label, `${entry.name} is not on the sheet`);
    } else if (build.options.normalizeMorphPrice && traitPoints(morphRow) !== entry.points) {
      fail(label, `${entry.name} totals ${traitPoints(morphRow)}, expected its chargen price of ${entry.points}`);
    }
  }

  // Async: exactly one sleight at full price.
  if (build.psi.enabled) {
    const alternates = build.psi.sleights.filter((s) => s.alternate).length;
    const sleightNames = new Set(
      build.psi.sleights.map((s) =>
        cat.sleights.groups.flatMap((g) => g.items).find((i) => i.key === s.key).name),
    );
    const rows = entity.traits.filter((t2) => sleightNames.has(t2.name));
    const enabled = rows.filter((r) =>
      (r.modifiers || []).some((m) => m.name === "Alternative Ability" && !m.disabled)).length;
    if (enabled !== alternates) {
      fail(label, `${enabled} sleights marked Alternative Ability, expected ${alternates}`);
    }
  }

  // Every technique's nameable is filled in.
  for (const row of entity.skills || []) {
    if (/@\w+@/.test(row.name) &&
        Object.values(row.replacements || {}).some((r) => /@\w+@/.test(r))) {
      fail(label, `${row.name}: nameable placeholder was never filled in`);
    }
  }

  const findings = validate(build, cat);
  const errors = findings.filter((f) => f.level === "error");
  console.log(
    `  ${label}: ${entity.traits?.length ?? 0} traits, ${entity.skills?.length ?? 0} skills, ` +
    `${entity.equipment?.length ?? 0} items, ${t.spent}/${t.total} pts, ` +
    `${v.seenIDs.size} ids, ${errors.length} rule errors, ` +
    `${log.priceAdjustments.length} price corrections, ${(text.length / 1024).toFixed(0)} KB`,
  );
}

// Every id in every output file must be unique and well-formed; check across a
// morph swap too, since adopting the same library row twice is the risky case.
{
  const build = sentinel();
  const a = buildSheet(build, cat).entity;
  const b = buildSheet(build, cat).entity;
  const ids = (entity) => {
    const out = [];
    (function walk(node) {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!node || typeof node !== "object") return;
      if (typeof node.id === "string" && isTID(node.id)) out.push(node.id);
      Object.values(node).forEach(walk);
    })(entity);
    return out;
  };
  const shared = new Set(ids(a)).intersection(new Set(ids(b)));
  if (shared.size) fail("id-freshness", `${shared.size} ids repeat between two exports of the same build`);
}

if (failures) {
  console.error(`export: ${failures} problems`);
  process.exit(1);
}
console.log("export: all fixtures produce schema-valid GCS 5 sheets");
