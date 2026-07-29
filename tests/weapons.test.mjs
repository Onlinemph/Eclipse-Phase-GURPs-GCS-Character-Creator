// Attack lines and prerequisites.
//
// Both engines read data the rest of the builder had been carrying but never
// interpreting: 231 weapons and 86 rows of prerequisites. These check the
// GURPS arithmetic against worked examples, then sweep the whole gear
// catalogue for anything that fails to resolve at all.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  parseDice, resolveDamage, resolveSkillLevel, minimumStrength, isMelee, skillDifficulties,
} from "../js/weapons.js";
import { GURPS_SKILLS } from "../js/gurps-skills.js";
import { evaluate } from "../js/prereqs.js";
import { computeSheet } from "../js/sheet.js";
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

// --- dice parsing ----------------------------------------------------------

const DICE = [
  ["6d", { count: 6, sides: 6, modifier: 0 }],
  ["1d+2", { count: 1, sides: 6, modifier: 2 }],
  ["2d-1", { count: 2, sides: 6, modifier: -1 }],
  ["-1", { count: 0, sides: 6, modifier: -1 }],
  ["3", { count: 0, sides: 6, modifier: 3 }],
  ["", { count: 0, sides: 6, modifier: 0 }],
];
for (const [spec, want] of DICE) {
  const got = parseDice(spec);
  if (got.count !== want.count || got.sides !== want.sides || got.modifier !== want.modifier) {
    fail(`parseDice("${spec}") gave ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
  }
}

// --- damage that folds in strength ----------------------------------------

{
  // A weapon whose damage is "swing minus one, cutting" at ST 12: sw is 1d+2,
  // so the weapon does 1d+1.
  const weapon = { id: "wAAAAAAAAAAAAAAAA", damage: { type: "cut", st: "sw", base: "-1" } };
  const got = resolveDamage(weapon, { striking: 12, lifting: 12 });
  if (got !== "1d+1 cut") fail(`swing-1 at ST 12 gave "${got}", expected "1d+1 cut"`);

  // Fixed damage ignores strength entirely.
  const gun = { id: "WAAAAAAAAAAAAAAAA", damage: { type: "pi", base: "6d" } };
  if (resolveDamage(gun, { striking: 30, lifting: 30 }) !== "6d pi") {
    fail("a fixed-damage weapon should not scale with strength");
  }

  // An armour divisor is shown in parentheses, as GCS prints it.
  const blaster = { id: "WAAAAAAAAAAAAAAAA", damage: { type: "burn", base: "3d", armor_divisor: 5 } };
  if (resolveDamage(blaster, { striking: 10, lifting: 10 }) !== "3d(5) burn") {
    fail(`armour divisor formatting is wrong: ${resolveDamage(blaster, { striking: 10, lifting: 10 })}`);
  }

  // GCS caps the strength that counts at three times the weapon's minimum.
  const knife = { id: "wAAAAAAAAAAAAAAAA", strength: "5", damage: { type: "cut", st: "sw", base: "-1" } };
  const capped = resolveDamage(knife, { striking: 40, lifting: 40 });
  const atCap = resolveDamage(knife, { striking: 15, lifting: 15 });
  if (capped !== atCap) {
    fail(`minimum-ST cap not applied: ST 40 gave "${capped}", ST 15 (3x min) gave "${atCap}"`);
  }
}

// --- skill level -----------------------------------------------------------

{
  const values = { dx: 14, iq: 12, st: 10 };
  const strength = { striking: 10, lifting: 10 };
  const weapon = {
    id: "WAAAAAAAAAAAAAAAA",
    strength: "9†",
    defaults: [
      { type: "skill", name: "Guns", specialization: "Rifle" },
      { type: "dx", modifier: -4 },
      { type: "skill", name: "Guns", modifier: -4 },
    ],
  };
  // With the exact skill, that is what is used.
  let got = resolveSkillLevel(weapon, [{ name: "Guns", specialization: "Rifle", level: 16 }], values, strength);
  if (got.level !== 16) fail(`weapon with Guns (Rifle) 16 resolved to ${got.level}`);

  // With no skill at all, the best attribute default wins.
  got = resolveSkillLevel(weapon, [], values, strength);
  if (got.level !== 10) fail(`weapon with no skill resolved to ${got.level}, expected DX-4 = 10`);

  // A default naming no specialization accepts any specialization.
  got = resolveSkillLevel(weapon, [{ name: "Guns", specialization: "Pistol", level: 18 }], values, strength);
  if (got.level !== 14) {
    fail(`Guns (Pistol) 18 should reach the weapon at Guns-4 = 14, got ${got.level}`);
  }

  // Being short of the minimum ST costs a point of skill per point (B270).
  got = resolveSkillLevel(weapon, [{ name: "Guns", specialization: "Rifle", level: 16 }], values,
    { striking: 6, lifting: 6 });
  if (got.level !== 13 || got.shortfall !== 3) {
    fail(`ST 6 against a ST 9 weapon gave level ${got.level} shortfall ${got.shortfall}, expected 13 and 3`);
  }
}

// --- every weapon in the catalogue resolves -------------------------------

{
  let checked = 0;
  const broken = [];
  const strength = { striking: 12, lifting: 12 };
  const difficulties = skillDifficulties(cat.epSkills, GURPS_SKILLS);
  const walk = (rows) => {
    for (const row of rows || []) {
      for (const weapon of row.weapons || []) {
        checked += 1;
        const damage = resolveDamage(weapon, strength);
        if (!damage || damage === "—") {
          broken.push(`${row.description || row.name}: damage did not resolve`);
        }
        // Every weapon that declares defaults must offer some way to use it.
        // A few secondary usages declare none at all; GCS shows those with no
        // level either, so they are data rather than a resolver failure.
        if (weapon.defaults?.length) {
          const level = resolveSkillLevel(weapon, [], { dx: 12, iq: 12, st: 12 }, strength, difficulties);
          if (level.level === null) {
            broken.push(`${row.description || row.name}: no usable default from ` +
              JSON.stringify(weapon.defaults.map((d) => d.type + (d.name ? `:${d.name}` : ""))));
          }
        }
        if (isMelee(weapon) === undefined) broken.push(`${row.description || row.name}: unknown kind`);
        if (weapon.strength && minimumStrength(weapon) === 0 && !/^\D*$/.test(weapon.strength)) {
          broken.push(`${row.description || row.name}: minimum ST "${weapon.strength}" did not parse`);
        }
      }
      walk(row.children);
    }
  };
  for (const category of cat.gear.categories) walk(category.items.map((i) => i.payload));

  if (broken.length) {
    fail(`${broken.length} of ${checked} catalogue weapons did not resolve`);
    for (const line of broken.slice(0, 10)) console.error(`    ${line}`);
  } else {
    console.log(`  ${checked} catalogue weapons resolve damage and a usable level`);
  }
}

// --- prerequisites ---------------------------------------------------------

{
  const character = {
    traits: [{ name: "Wealthy", levels: 0, notes: "" }],
    skills: [{ name: "Computer Programming", specialization: "", level: 12 }],
    containedWeight: 0,
  };

  // "has: false" is satisfied by absence.
  const mustNotHave = {
    type: "prereq_list", all: true,
    prereqs: [{ type: "trait_prereq", has: false, name: { compare: "is", qualifier: "Dead Broke" } }],
  };
  if (!evaluate(mustNotHave, character).satisfied) fail("absence should satisfy a has:false prereq");

  const conflicting = {
    type: "prereq_list", all: true,
    prereqs: [{ type: "trait_prereq", has: false, name: { compare: "is", qualifier: "Wealthy" } }],
  };
  if (evaluate(conflicting, character).satisfied) {
    fail("holding the trait should fail a has:false prereq");
  }

  // A skill prereq matches by name.
  const needsSkill = {
    type: "prereq_list", all: true,
    prereqs: [{ type: "skill_prereq", has: true, name: { compare: "is", qualifier: "computer programming" } }],
  };
  if (!evaluate(needsSkill, character).satisfied) fail("a held skill should satisfy its prereq");

  // `all: false` is OR: one satisfied child is enough.
  const either = {
    type: "prereq_list", all: false,
    prereqs: [
      { type: "trait_prereq", has: true, name: { compare: "is", qualifier: "Nothing At All" } },
      { type: "trait_prereq", has: true, name: { compare: "is", qualifier: "Wealthy" } },
    ],
  };
  if (!evaluate(either, character).satisfied) fail("an OR list should pass when one child passes");

  const neither = {
    type: "prereq_list", all: false,
    prereqs: [
      { type: "trait_prereq", has: true, name: { compare: "is", qualifier: "Nothing At All" } },
      { type: "trait_prereq", has: true, name: { compare: "is", qualifier: "Also Nothing" } },
    ],
  };
  if (evaluate(neither, character).satisfied) fail("an OR list should fail when no child passes");

  // An unimplemented kind is reported rather than silently passed or failed.
  const unknown = {
    type: "prereq_list", all: true,
    prereqs: [{ type: "attribute_prereq", has: true }],
  };
  const result = evaluate(unknown, character);
  if (!result.satisfied) fail("an unevaluated prereq kind should not invent a failure");
  if (!result.unevaluated.includes("attribute_prereq")) {
    fail("an unevaluated prereq kind should be reported");
  }
}

// --- the real thing: a skill that needs another skill ---------------------

{
  const find = (name) => {
    const hit = cat.epSkills.groups.flatMap((g) => g.items).find((i) => i.name === name);
    if (!hit) throw new Error(`missing skill: ${name}`);
    return hit;
  };
  const build = defaultBuild();
  build.skills = [{
    source: "ep", key: find("Computer Hacking").key, kind: "skill",
    name: "Computer Hacking", difficulty: "iq/vh", points: 4, uid: "a",
  }];
  let sheet = computeSheet(build, cat);
  if (!sheet.prereqs.unmet.some((u) => u.name === "Computer Hacking")) {
    fail("Computer Hacking without Computer Programming should report an unmet prerequisite");
  }

  build.skills.push({
    source: "ep", key: find("Computer Programming").key, kind: "skill",
    name: "Computer Programming", difficulty: "iq/h", points: 2, uid: "b",
  });
  sheet = computeSheet(build, cat);
  if (sheet.prereqs.unmet.length) {
    fail(`adding the prerequisite left ${sheet.prereqs.unmet.length} unmet: ` +
      sheet.prereqs.unmet.map((u) => u.name).join(", "));
  }
}

// --- a stock morph satisfies its own prerequisites ------------------------

{
  const unmet = [];
  for (const entry of cat.morphIndex) {
    const build = defaultBuild();
    build.morph = { key: entry.key, aptitudes: new Array(entry.slots).fill(0) };
    const sheet = computeSheet(build, cat);
    for (const item of sheet.prereqs.unmet) {
      unmet.push(`${entry.name}: ${item.name} — ${item.reason}`);
    }
  }
  if (unmet.length) {
    fail(`${unmet.length} morphs carry unmet prerequisites out of the box`);
    for (const line of unmet.slice(0, 10)) console.error(`    ${line}`);
  } else {
    console.log(`  all ${cat.morphIndex.length} morphs satisfy their own prerequisites`);
  }
}

if (failures) {
  console.error(`weapons: ${failures} problems`);
  process.exit(1);
}
console.log("weapons: damage, skill levels and prerequisites resolve as GURPS and GCS define them");
