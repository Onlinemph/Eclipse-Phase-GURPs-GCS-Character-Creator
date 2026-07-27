// Resolving what a character's traits actually do.
//
// The libraries carry about 7,000 features — attribute bonuses, DR by hit
// location, skill bonuses, reaction and conditional modifiers. GCS applies them
// when it opens a sheet; this module applies the same ones up front, so the
// wizard can show the ST, HT, HP, FP and DR a morph really grants instead of
// promising that GCS will work it out later.
//
// Mirrors the feature handling in gcs/model/gurps and the derived-value maths
// in entity.go.

import { canLevel } from "./cost.js";

/** Walk every enabled row in a trait tree. */
function* liveRows(rows) {
  for (const row of rows || []) {
    if (row.disabled) continue;
    yield row;
    yield* liveRows(row.children);
  }
}

/** Enabled modifiers on a row, flattened through modifier containers. */
function* liveModifiers(modifiers) {
  for (const mod of modifiers || []) {
    if (mod.disabled) continue;
    if (mod.children) yield* liveModifiers(mod.children);
    else yield mod;
  }
}

/** How many levels a feature should be multiplied by. */
function levelsOf(row) {
  return canLevel(row) ? Math.max(0, row.levels || 0) : 0;
}

function amountOf(feature, levels) {
  const amount = feature.amount || 0;
  return feature.per_level ? amount * levels : amount;
}

/**
 * Collect every feature a trait tree contributes, tagged with the row it came
 * from so the interface can explain where a number is coming from.
 */
export function collectFeatures(rows) {
  const out = [];
  for (const row of liveRows(rows)) {
    const levels = levelsOf(row);
    for (const feature of row.features || []) {
      out.push({ feature, levels, source: row.name });
    }
    for (const mod of liveModifiers(row.modifiers)) {
      // A modifier's own features scale with the modifier's level when it has
      // one, otherwise with the trait's.
      const modLevels = mod.levels || levels;
      for (const feature of mod.features || []) {
        out.push({ feature, levels: modLevels, source: `${row.name} (${mod.name})` });
      }
    }
  }
  return out;
}

/** ST is split three ways in GURPS; bonuses can target one of them. */
const ST_LIMITS = ["none", "striking_only", "lifting_only", "throwing_only"];

/**
 * Resolve features into the numbers a sheet shows.
 *
 * @param {object[]} traits assembled trait rows
 * @param {object[]} attrDefs the EP attribute definitions
 * @param {object} bought the attribute values the Ego paid for
 */
export function resolve(traits, attrDefs, bought) {
  const collected = collectFeatures(traits);

  const attributes = {};      // attribute id -> bonus
  const stLimited = { striking_only: 0, lifting_only: 0, throwing_only: 0 };
  const dr = new Map();       // location -> {all: n, byType: {type: n}}
  const skills = [];          // {name, specialization, amount, source}
  const reactions = [];       // {situation, amount, source}
  const conditionals = [];    // {situation, amount, source}

  for (const { feature, levels, source } of collected) {
    const amount = amountOf(feature, levels);
    switch (feature.type) {
      case "attribute_bonus": {
        const limitation = ST_LIMITS.includes(feature.limitation) ? feature.limitation : "none";
        if (feature.attribute === "st" && limitation !== "none") {
          stLimited[limitation] += amount;
        } else {
          attributes[feature.attribute] = (attributes[feature.attribute] || 0) + amount;
        }
        break;
      }
      case "dr_bonus": {
        for (const location of feature.locations || []) {
          if (!dr.has(location)) dr.set(location, { all: 0, byType: {} });
          const entry = dr.get(location);
          const type = feature.specialization;
          if (type) entry.byType[type] = (entry.byType[type] || 0) + amount;
          else entry.all += amount;
        }
        break;
      }
      case "skill_bonus": {
        if (feature.selection_type && feature.selection_type !== "skills_with_name") break;
        skills.push({
          name: feature.name?.qualifier || "",
          compare: feature.name?.compare || "is",
          specialization: feature.specialization?.qualifier || "",
          amount,
          source,
        });
        break;
      }
      case "reaction_bonus":
        reactions.push({ situation: feature.situation || "", amount, source });
        break;
      case "conditional_modifier":
        conditionals.push({ situation: feature.situation || "", amount, source });
        break;
      default:
        // cost_reduction, weapon_bonus and trait_bonus exist in the libraries
        // but do not change anything the sheet panel displays.
        break;
    }
  }

  // Final attribute values: the definition's base, plus what the Ego bought,
  // plus what the morph and other traits grant.
  const values = {};
  const defs = new Map(attrDefs.map((d) => [d.id, d]));
  const resolveValue = (id, seen = new Set()) => {
    if (values[id] !== undefined) return values[id];
    if (seen.has(id)) return 0;
    seen.add(id);
    const def = defs.get(id);
    if (!def) return 0;
    const base = evaluateBase(def.base, (ref) => resolveValue(ref, seen));
    const purchased = bought[id] !== undefined && Number.isFinite(Number(def.base))
      ? bought[id] - Number(def.base)
      : 0;
    const value = base + purchased + (attributes[id] || 0);
    values[id] = def.type === "decimal" ? Math.round(value * 100) / 100 : Math.floor(value);
    return values[id];
  };
  for (const def of attrDefs) resolveValue(def.id);

  return {
    values,
    bonuses: attributes,
    strength: {
      base: values.st || 0,
      striking: (values.st || 0) + stLimited.striking_only,
      lifting: (values.st || 0) + stLimited.lifting_only,
      throwing: (values.st || 0) + stLimited.throwing_only,
    },
    dr,
    skills,
    reactions,
    conditionals,
  };
}

/**
 * Evaluate an attribute definition's base expression.
 *
 * EP_ATT uses three shapes: a constant, a `$other` reference, and the two
 * arithmetic forms GCS ships with. Anything else resolves to 0 rather than
 * guessing, and the sheet marks it.
 */
function evaluateBase(expression, lookup) {
  const text = String(expression ?? "0").trim();
  if (text === "") return 0;
  const constant = Number(text);
  if (Number.isFinite(constant)) return constant;

  const substituted = text.replace(/\$(\w+)/g, (_, id) => String(lookup(id)));
  // "($dx + $ht) / 4" and "Math.floor($basic_speed)" are the two forms in use.
  const floor = substituted.match(/^Math\.floor\(([^)]*)\)$/);
  if (floor) return Math.floor(arithmetic(floor[1]));
  const round = substituted.match(/^Math\.round\(([^)]*)\)$/);
  if (round) return Math.round(arithmetic(round[1]));
  return arithmetic(substituted);
}

/** A deliberately small arithmetic evaluator: + - * / and parentheses only. */
function arithmetic(text) {
  const tokens = String(text).match(/\d+(\.\d+)?|[-+*/()]/g);
  if (!tokens) return 0;
  let position = 0;
  const peek = () => tokens[position];
  const take = () => tokens[position++];

  const primary = () => {
    if (peek() === "(") {
      take();
      const value = additive();
      if (peek() === ")") take();
      return value;
    }
    if (peek() === "-") { take(); return -primary(); }
    const value = Number(take());
    return Number.isFinite(value) ? value : 0;
  };
  const multiplicative = () => {
    let value = primary();
    while (peek() === "*" || peek() === "/") {
      const op = take();
      const right = primary();
      value = op === "*" ? value * right : (right === 0 ? 0 : value / right);
    }
    return value;
  };
  const additive = () => {
    let value = multiplicative();
    while (peek() === "+" || peek() === "-") {
      const op = take();
      const right = multiplicative();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  };
  const result = additive();
  return Number.isFinite(result) ? result : 0;
}

// --- derived values --------------------------------------------------------

/** Basic Lift in pounds, per entity.go's BasicLiftForST (Basic Set progression). */
export function basicLift(liftingST) {
  const st = Math.floor(liftingST);
  if (st < 1) return 0;
  let value = (st * st) / 5;
  if (value >= 10) value = Math.round(value);
  return Math.floor(value * 10) / 10;
}

const die = (count, sides, modifier) => ({ count, sides, modifier });

/** Thrust damage, Basic Set progression. */
export function thrust(st) {
  if (st < 19) return die(1, 6, -(6 - Math.floor((st - 1) / 2)));
  let value = st - 11;
  if (st > 50) {
    value -= 1;
    if (st > 79) value -= 1 + Math.floor((st - 80) / 5);
  }
  return die(Math.floor(value / 8) + 1, 6, Math.floor((value % 8) / 2) - 1);
}

/** Swing damage, Basic Set progression. */
export function swing(st) {
  if (st < 10) return die(1, 6, -(5 - Math.floor((st - 1) / 2)));
  if (st < 28) {
    const s = st - 9;
    return die(Math.floor(s / 4) + 1, 6, (s % 4) - 1);
  }
  let value = st;
  if (st > 40) value -= Math.floor((st - 40) / 5);
  if (st > 59) value += 1;
  value += 9;
  return die(Math.floor(value / 8) + 1, 6, Math.floor((value % 8) / 2) - 1);
}

export function formatDice(d) {
  if (!d) return "—";
  const modifier = d.modifier === 0 ? "" : d.modifier > 0 ? `+${d.modifier}` : String(d.modifier);
  return `${d.count}d${modifier}`;
}

/** Encumbrance levels, with the weight multiple and penalty GCS uses. */
export const ENCUMBRANCE = [
  { key: "none", label: "None", multiplier: 1, penalty: 0 },
  { key: "light", label: "Light", multiplier: 2, penalty: -1 },
  { key: "medium", label: "Medium", multiplier: 3, penalty: -2 },
  { key: "heavy", label: "Heavy", multiplier: 6, penalty: -3 },
  { key: "extra-heavy", label: "X-Heavy", multiplier: 10, penalty: -4 },
];

/** Move at a given encumbrance: basic move reduced 20% per level, floor 1. */
export function moveAt(basicMove, penalty) {
  const move = Math.floor((Math.max(0, basicMove) * (10 + 2 * penalty)) / 10);
  if (move < 1) return Math.max(0, basicMove) > 0 ? 1 : 0;
  return move;
}

/** Dodge at a given encumbrance: Basic Speed + 3, then the penalty, floor 1. */
export function dodgeAt(basicSpeed, penalty, bonus = 0) {
  return Math.max(1, Math.floor(Math.max(0, basicSpeed) + 3 + bonus + penalty));
}

/** Which encumbrance level a carried weight falls into. */
export function encumbranceFor(weightCarried, lift) {
  if (lift <= 0) return ENCUMBRANCE[0];
  return (
    ENCUMBRANCE.find((level) => weightCarried <= lift * level.multiplier) ||
    ENCUMBRANCE[ENCUMBRANCE.length - 1]
  );
}

/** Parse GCS's weight strings ("7 lb", "0.5 lb") into pounds. */
export function poundsOf(weight) {
  const match = String(weight ?? "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}
