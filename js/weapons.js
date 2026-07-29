// Attack lines: what the character can actually hit things with.
//
// 231 rows in the libraries carry weapon stats — 92 melee and 139 ranged — and
// a handful of traits carry natural attacks like claws and innate beams. The
// numbers a player reads in play (damage, skill level, Acc, RoF, reach) are
// computed rather than stored, which is why nothing showed them until now.
//
// Mirrors Weapon.SkillLevel and WeaponDamage.BaseDamageDice in gcs/model/gurps.
// Weapon bonuses from other traits are not applied; the Eclipse Phase libraries
// carry a single one, and the tooltip machinery they need is GCS's own.

import { thrust, swing, formatDice } from "./features.js";
import { skillRelativeLevel, parseDifficulty } from "./cost.js";

/** GCS TID kinds: 'w' is a melee weapon, 'W' a ranged one. */
export const isMelee = (weapon) => weapon.id?.[0] === "w";

// --- dice ------------------------------------------------------------------

const die = (count = 0, sides = 6, modifier = 0) => ({ count, sides, modifier });

/**
 * Parse a GCS dice spec: "6d", "1d+2", "2d-1", "-1", "3".
 * A bare number is a flat modifier, which is how melee weapons express the
 * "swing minus one" half of their damage.
 */
export function parseDice(spec) {
  const text = String(spec ?? "").trim();
  if (!text) return die();
  const match = text.match(/^([+-]?\d+)?\s*d\s*(\d+)?\s*([+-]\s*\d+)?$/i);
  if (match) {
    return die(
      match[1] === undefined ? 1 : Number(match[1]),
      match[2] === undefined ? 6 : Number(match[2]),
      match[3] ? Number(match[3].replace(/\s+/g, "")) : 0,
    );
  }
  const flat = Number(text.replace(/\s+/g, ""));
  return Number.isFinite(flat) ? die(0, 6, flat) : die();
}

const addDice = (a, b) => die(a.count + b.count, a.sides || b.sides || 6, a.modifier + b.modifier);

// --- strength --------------------------------------------------------------

/** The minimum ST a weapon needs, from strings like "9†" or "12‡". */
export function minimumStrength(weapon) {
  const match = String(weapon.strength ?? "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

const THRUST_TYPES = new Set(["thr", "lift_thr", "tk_thr", "iq_thr", "thr_leveled"]);
const SWING_TYPES = new Set(["sw", "lift_sw", "tk_sw", "iq_sw", "sw_leveled"]);

/**
 * Damage as it will read on the sheet.
 *
 * Melee weapons mostly store "swing minus one" and the like, so the character's
 * own strength is half the answer. GCS caps the strength that counts at three
 * times the weapon's minimum — a monofilament sword in a Fury's hand still only
 * cuts so hard.
 */
export function resolveDamage(weapon, strength) {
  const damage = weapon.damage || {};
  const strengthType = damage.st || "none";
  let base = parseDice(damage.base);

  if (THRUST_TYPES.has(strengthType) || SWING_TYPES.has(strengthType)) {
    const minST = minimumStrength(weapon);
    let st = Math.max(0, Math.floor(strength.striking));
    if (minST > 0 && st > minST * 3) st = minST * 3;
    base = addDice(base, THRUST_TYPES.has(strengthType) ? thrust(st) : swing(st));
  }

  const parts = [];
  if (base.count !== 0 || base.modifier !== 0) parts.push(formatDice(base));
  const divisor = damage.armor_divisor;
  if (divisor !== undefined && divisor !== 1) parts.push(`(${divisor})`);
  const text = parts.join("");
  const type = String(damage.type || "").trim();
  const fragment = damage.fragmentation
    ? ` [${formatDice(parseDice(damage.fragmentation))} ${damage.fragmentation_type || "frag"}]`
    : "";
  return `${text}${type ? ` ${type}` : ""}${fragment}`.trim() || "—";
}

// --- skill level -----------------------------------------------------------

const ATTRIBUTE_DEFAULTS = new Set(["st", "dx", "iq", "ht", "will", "per", "10"]);

// What an unowned skill rolls at, by difficulty (B173). GCS reads each skill's
// own declared defaults; without the Basic Set data this is the usual pattern,
// and the level is labelled as a default so nobody mistakes it for training.
const UNSKILLED_PENALTY = { e: -4, a: -5, h: -6, vh: -6 };

/**
 * The level a weapon is used at: the best of its defaults, less any shortfall
 * against its minimum ST, floored at 0.
 *
 * @param {object} weapon
 * @param {object[]} skills the sheet's skill rows, already levelled
 * @param {object} values resolved attribute values
 * @param {object} strength {striking, lifting}
 * @param {Map<string,string>} [difficulties] skill name -> "dx/e", for weapons
 *        that default only to a skill the character has no points in
 */
export function resolveSkillLevel(weapon, skills, values, strength, difficulties = null) {
  let best = null;
  let source = "";

  for (const def of weapon.defaults || []) {
    const modifier = def.modifier || 0;
    let level = null;
    let from = "";

    if (def.type === "skill") {
      const match = bestSkillMatch(skills, def);
      if (match) {
        level = match.level + modifier;
        from = match.label;
      } else {
        // GCS resolves a named skill even with no points in it, by falling back
        // to that skill's own default.
        const unskilled = unskilledLevel(def, values, difficulties);
        if (unskilled !== null) {
          level = unskilled + modifier;
          from = `${def.name}${def.specialization ? ` (${def.specialization})` : ""} default`;
        }
      }
    } else if (ATTRIBUTE_DEFAULTS.has(def.type)) {
      const base = def.type === "10" ? 10 : values[def.type];
      if (base !== undefined) {
        level = base + modifier;
        from = def.type === "10" ? "10" : def.type.toUpperCase();
      }
    }
    if (level !== null && (best === null || level > best)) {
      best = level;
      source = `${from}${modifier ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`;
    }
  }
  if (best === null) return { level: null, source: "no default" };

  // B270: being short of a weapon's minimum ST costs a point of skill per point
  // of shortfall. Ranged weapons that are not muscle-powered use lifting ST.
  const minST = minimumStrength(weapon);
  const usable = isMelee(weapon) ? strength.striking : strength.lifting;
  const shortfall = Math.max(0, minST - Math.floor(usable));
  return {
    level: Math.max(0, best - shortfall),
    source,
    shortfall,
    minST,
  };
}

/** What a named skill would roll at with no points in it. */
function unskilledLevel(def, values, difficulties) {
  if (!difficulties) return null;
  const difficulty = difficulties.get(String(def.name || "").toLowerCase());
  if (!difficulty) return null;
  const [attr, diff] = difficulty.split("/");
  const base = values[attr];
  if (base === undefined) return null;
  const penalty = UNSKILLED_PENALTY[diff];
  return penalty === undefined ? null : base + penalty;
}

/** The best of the character's skills matching a weapon default. */
function bestSkillMatch(skills, def) {
  const wanted = String(def.name || "").toLowerCase();
  const wantedSpec = String(def.specialization || "").toLowerCase();
  let best = null;

  for (const skill of skills) {
    if (skill.level === null) continue;
    if (String(skill.name || "").toLowerCase() !== wanted) continue;
    // A default naming a specialization only accepts that specialization; one
    // naming none accepts any, which is how "Guns" matches "Guns (Rifle)".
    if (wantedSpec && String(skill.specialization || "").toLowerCase() !== wantedSpec) continue;
    if (!best || skill.level > best.level) {
      best = {
        level: skill.level,
        label: skill.specialization ? `${skill.name} (${skill.specialization})` : skill.name,
      };
    }
  }
  return best;
}

// --- collection ------------------------------------------------------------

/** Walk rows and their children, yielding every weapon with what carries it. */
function* everyWeapon(rows, carrier = null) {
  for (const row of rows || []) {
    if (row.disabled) continue;
    const name = row.name || row.description || carrier || "";
    for (const weapon of row.weapons || []) {
      if (weapon.hide) continue;
      yield { weapon, carrier: name, row };
    }
    yield* everyWeapon(row.children, name);
  }
}

/**
 * Every attack the character has, split into melee and ranged.
 *
 * @param {object} sheet the computed sheet: traits, carried equipment, skills
 */
export function collectWeapons({ traits, carried, skills, values, strength, difficulties }) {
  const melee = [];
  const ranged = [];

  const consider = (source) => {
    for (const { weapon, carrier } of everyWeapon(source.rows)) {
      const { level, source: from, shortfall, minST } =
        resolveSkillLevel(weapon, skills, values, strength, difficulties);
      const line = {
        name: carrier,
        usage: weapon.usage || "",
        damage: resolveDamage(weapon, strength),
        level,
        levelFrom: from,
        shortfall,
        minST,
        strength: weapon.strength || "",
        origin: source.origin,
      };
      if (isMelee(weapon)) {
        melee.push({ ...line, reach: weapon.reach || "", parry: weapon.parry || "" });
      } else {
        ranged.push({
          ...line,
          accuracy: weapon.accuracy || "",
          range: weapon.range || "",
          rof: weapon.rate_of_fire || "",
          shots: weapon.shots || "",
          bulk: weapon.bulk || "",
          recoil: weapon.recoil || "",
        });
      }
    }
  };

  consider({ rows: traits, origin: "trait" });
  // Only what is actually to hand: unequipping a weapon takes it off the
  // attack lines without removing it from the equipment list.
  consider({ rows: carried.filter((e) => e.equipped !== false), origin: "equipment" });

  const order = (a, b) => a.name.localeCompare(b.name) || a.usage.localeCompare(b.usage);
  return { melee: melee.sort(order), ranged: ranged.sort(order) };
}

/**
 * Skill name to difficulty, for weapons that default to a skill the character
 * has no points in. Drawn from the setting library and the curated Basic Set
 * list, which is all the difficulty data the builder ships.
 */
export function skillDifficulties(epSkills, gurpsGroups) {
  const out = new Map();
  for (const group of epSkills?.groups || []) {
    for (const item of group.items) {
      if (item.difficulty?.includes("/")) out.set(item.name.toLowerCase(), item.difficulty);
    }
  }
  for (const group of gurpsGroups || []) {
    for (const skill of group.skills) out.set(skill.name.toLowerCase(), skill.difficulty);
  }
  return out;
}

/** Skill rows in the shape the weapon resolver wants. */
export function levelledSkills(skillRows, values) {
  return skillRows.map((row) => {
    const { attr, diff } = parseDifficulty(row.difficulty || "");
    const relative = skillRelativeLevel(row.points || 0, diff);
    const base = values[attr];
    return {
      name: row.name,
      specialization: row.specialization || "",
      level: relative === null || base === undefined ? null : base + relative,
    };
  });
}
