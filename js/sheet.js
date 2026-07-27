// The live character sheet: what the numbers actually come out as.
//
// It reads the same assembled rows the exporter writes, so what the panel shows
// is what GCS will show. This is where the Ego/morph split stops being an idea
// and becomes a number — ST reads 0 until a morph is attached, then jumps to
// whatever the body supplies.

import { assemble } from "./build.js";
import {
  resolve, basicLift, thrust, swing, formatDice, moveAt, dodgeAt,
  encumbranceFor, ENCUMBRANCE, poundsOf,
} from "./features.js";
import { traitPoints, skillRelativeLevel, parseDifficulty } from "./cost.js";
import { totals, weightCarried, cashSpent } from "./state.js";

/** Hit locations in the order GCS's humanoid body lists them. */
export const HIT_LOCATIONS = [
  ["skull", "Skull"], ["eye", "Eyes"], ["face", "Face"], ["neck", "Neck"],
  ["torso", "Torso"], ["vitals", "Vitals"], ["groin", "Groin"],
  ["arm", "Arms"], ["hand", "Hands"], ["leg", "Legs"], ["foot", "Feet"],
  ["tail", "Tail"], ["wing", "Wings"], ["fin", "Fins"], ["brain", "Brain"],
];

/**
 * Compute everything the sheet panel displays.
 *
 * @param {object} build the wizard build
 * @param {object} cat loaded catalogues
 */
export function computeSheet(build, cat) {
  const { traits, skills, carried, other } = assemble(build, cat);
  const resolved = resolve(traits, cat.attrDefs, build.attributes);

  const values = resolved.values;
  const lift = basicLift(resolved.strength.lifting);
  const weight = weightCarried(build, cat);
  const level = encumbranceFor(weight, lift);
  const basicMove = values.basic_move || 0;
  const basicSpeed = values.basic_speed || 0;

  // A morph supplies ST, HT, HP and FP; without one they are all zero and the
  // derived values are meaningless rather than merely low.
  const embodied = (values.st || 0) > 0 || (values.ht || 0) > 0;

  const encumbrance = ENCUMBRANCE.map((e) => ({
    ...e,
    maxLoad: Math.round(lift * e.multiplier * 10) / 10,
    move: moveAt(basicMove, e.penalty),
    dodge: dodgeAt(basicSpeed, e.penalty, resolved.bonuses.dodge || 0),
    current: e.key === level.key,
  }));

  return {
    embodied,
    values,
    resolved,
    points: totals(build, cat),
    lift: {
      basic: lift,
      oneHanded: round1(lift * 2),
      twoHanded: round1(lift * 8),
      shove: round1(lift * 12),
      runningShove: round1(lift * 24),
      carryOnBack: round1(lift * 15),
      shiftSlightly: round1(lift * 50),
    },
    damage: {
      thrust: formatDice(thrust(resolved.strength.striking)),
      swing: formatDice(swing(resolved.strength.striking)),
    },
    encumbrance,
    weightCarried: weight,
    cash: cashSpent(build, cat),
    dr: drByLocation(resolved.dr),
    skills: skills.map((row) => describeSkill(row, values, resolved.skills)),
    traitCount: countRows(traits),
    carriedCount: carried.length,
    otherCount: other.length,
    reactions: resolved.reactions,
    conditionals: resolved.conditionals,
    traits,
  };
}

const round1 = (n) => Math.round(n * 10) / 10;

function countRows(rows) {
  let n = 0;
  for (const row of rows || []) {
    n += 1;
    n += countRows(row.children);
  }
  return n;
}

function drByLocation(dr) {
  return HIT_LOCATIONS.map(([key, label]) => {
    const entry = dr.get(key);
    if (!entry) return { key, label, value: 0, extra: "" };
    const extra = Object.entries(entry.byType)
      .map(([type, amount]) => `+${amount} vs ${type}`)
      .join(", ");
    return { key, label, value: entry.all, extra };
  }).filter((row) => row.value || row.extra);
}

/** A skill's level, including any bonuses traits grant it. */
function describeSkill(row, values, skillBonuses) {
  const { attr, diff } = parseDifficulty(row.difficulty || "");
  const relative = skillRelativeLevel(row.points || 0, diff);
  const technique = !row.difficulty?.includes("/");

  let bonus = 0;
  for (const b of skillBonuses) {
    if (!b.name) continue;
    const matches = b.compare === "is"
      ? b.name.toLowerCase() === String(row.name || "").toLowerCase()
      : String(row.name || "").toLowerCase().includes(b.name.toLowerCase());
    if (!matches) continue;
    if (b.specialization && b.specialization.toLowerCase() !== String(row.specialization || "").toLowerCase()) {
      continue;
    }
    bonus += b.amount;
  }

  const base = values[attr];
  const level = technique || relative === null || base === undefined
    ? null
    : base + relative + bonus;

  return {
    name: row.name,
    specialization: row.specialization || "",
    difficulty: row.difficulty || "",
    points: row.points || 0,
    relative,
    bonus,
    level,
    attr,
    technique,
  };
}

/** A flat list of the traits on the sheet, with their costs, for display. */
export function traitSummary(traits) {
  const out = [];
  for (const row of traits || []) {
    out.push({
      name: row.name,
      points: traitPoints(row),
      container: Boolean(row.children),
      notes: row.local_notes || "",
      children: (row.children || []).map((c) => ({
        name: c.name,
        points: traitPoints(c),
      })),
    });
  }
  return out;
}

/** Total weight of a list of equipment rows. */
export function weightOf(rows) {
  return round1(
    (rows || []).reduce((sum, r) => sum + poundsOf(r.base_weight) * (r.quantity || 1), 0),
  );
}
