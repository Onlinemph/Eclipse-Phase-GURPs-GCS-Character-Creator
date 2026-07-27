// GURPS point costs, computed the way GCS computes them.
//
// This mirrors `AdjustedPoints` in gcs/model/gurps/trait.go so that the running
// totals in the wizard agree with what GCS shows once the sheet is opened.
//
// The `calc.points` values stored in the libraries are a useful cross-check but
// not an oracle: they were written by the tool that generated those files, and
// tests/cost.test.mjs pins the 90 rows where they and GCS disagree.

// Rationals, because GCS applies percentage modifiers as exact fractions.
const frac = (n, d = 1) => ({ n, d });
const fAdd = (a, b) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
const fMul = (a, b) => frac(a.n * b.n, a.d * b.d);
const fDiv = (a, b) => frac(a.n * b.d, a.d * b.n);
const fVal = (f) => (f.d === 0 ? 0 : f.n / f.d);
const fEq = (a, b) => fVal(a) === fVal(b);

const HUNDRED = frac(100);

// points + points * modifier%
const modifyPoints = (points, modifier) =>
  fAdd(points, fDiv(fMul(points, modifier), HUNDRED));

// --- modifier cost strings -------------------------------------------------
// "-80%" percentage adder, "x150%" percentage multiplier, "x2" multiplier,
// anything else a flat addition. Matches emweight.ValueFromString.

function costType(costAdj) {
  const s = String(costAdj || "").trim().toLowerCase();
  if (s.endsWith("%")) {
    return s.startsWith("x") || s.startsWith("×")
      ? "pct_multiplier"
      : "pct_adder";
  }
  if (
    s.startsWith("x") || s.startsWith("×") ||
    s.endsWith("x") || s.endsWith("×")
  ) {
    return "multiplier";
  }
  return "addition";
}

function extractFraction(costAdj, type) {
  let s = String(costAdj || "").trim();
  s = s.replace(/^[x×]+/i, "");
  // Trailing units: "%", "x", stray spaces.
  while (s.length && !/[0-9]/.test(s[s.length - 1])) s = s.slice(0, -1);
  let f;
  if (s.includes("/")) {
    const [n, d] = s.split("/");
    f = frac(parseFloat(n) || 0, parseFloat(d) || 1);
  } else {
    f = frac(parseFloat(s) || 0, 1);
  }
  if (type === "pct_multiplier" && f.n < 0) f = frac(100, 1);
  if (type === "multiplier" && f.n < 0) f = frac(1, 1);
  return f;
}

/** Enabled modifiers, flattened through modifier containers. */
function activeModifiers(modifiers, out = []) {
  for (const mod of modifiers || []) {
    if (mod.disabled) continue;
    if (mod.children) activeModifiers(mod.children, out);
    else out.push(mod);
  }
  return out;
}

// Self-control rolls discount a disadvantage; GCS keys them by the roll target.
const CR_MULTIPLIER = { 6: 2, 9: 1.5, 12: 1, 15: 0.5 };

/**
 * Whether a trait is levelled.
 *
 * GCS forces the flag on when a row carries levels or a per-level cost without
 * it (Trait.UnmarshalJSONFrom), and several library rows rely on that: the
 * Guard's Increased Basic Speed is 5 points per level at 8 levels with no
 * `can_level` in sight. Taking the flag at face value would price it at zero.
 */
export function canLevel(trait) {
  return Boolean(
    trait.can_level || (trait.levels || 0) !== 0 || (trait.points_per_level || 0) !== 0,
  );
}

/**
 * Point cost of a single (non-container) trait row.
 * @param {object} trait a GCS trait row
 */
export function traitPoints(trait) {
  if (trait.disabled) return 0;
  if (trait.children) return containerPoints(trait);

  const levelled = canLevel(trait);
  let basePoints = trait.base_points || 0;
  let pointsPerLevel = levelled ? trait.points_per_level || 0 : 0;
  const levels = levelled ? Math.max(0, trait.levels || 0) : 0;

  let baseLim = frac(0), levelLim = frac(0), baseEnh = frac(0), levelEnh = frac(0);
  let multiplier = frac(CR_MULTIPLIER[trait.cr] ?? 1);

  for (const mod of activeModifiers(trait.modifiers)) {
    const type = costType(mod.cost_adj);
    let value = extractFraction(mod.cost_adj, type);
    // A levelled modifier scales with its own level count.
    if (mod.levels) value = fMul(value, frac(mod.levels));

    const affects = mod.affects || "total";
    if (type === "addition") {
      if (affects === "levels_only") {
        if (levelled) pointsPerLevel += fVal(value);
      } else {
        basePoints += fVal(value);
      }
    } else if (type === "pct_adder") {
      const negative = value.n < 0;
      if (affects === "total" || affects === "base_only") {
        if (negative) baseLim = fAdd(baseLim, value);
        else baseEnh = fAdd(baseEnh, value);
      }
      if (affects === "total" || affects === "levels_only") {
        if (negative) levelLim = fAdd(levelLim, value);
        else levelEnh = fAdd(levelEnh, value);
      }
    } else if (type === "pct_multiplier") {
      multiplier = fDiv(fMul(multiplier, value), HUNDRED);
    } else {
      multiplier = fMul(multiplier, value);
    }
  }

  let modified = frac(basePoints);
  const leveled = frac(pointsPerLevel * levels);

  if (baseEnh.n || baseLim.n || levelEnh.n || levelLim.n) {
    // GCS additive mode (UseMultiplicativeModifiers defaults off), with the
    // -80% floor from B101.
    let baseMod = fAdd(baseEnh, baseLim);
    if (fVal(baseMod) < -80) baseMod = frac(-80);
    let levelMod = fAdd(levelEnh, levelLim);
    if (fVal(levelMod) < -80) levelMod = frac(-80);
    if (fEq(baseMod, levelMod)) {
      modified = modifyPoints(fAdd(modified, leveled), baseMod);
    } else {
      modified = fAdd(
        modifyPoints(modified, baseMod),
        modifyPoints(leveled, levelMod),
      );
    }
  } else {
    modified = fAdd(modified, leveled);
  }

  const total = fVal(fMul(modified, multiplier));
  // fxp.ApplyRounding: ceil, or floor when the trait rounds its cost down.
  return trait.round_down ? Math.floor(total) : Math.ceil(total);
}

/** Point cost of a trait container: the sum of its children. */
export function containerPoints(container) {
  if (container.disabled) return 0;
  // An "alternative abilities" container charges only its priciest child plus
  // 20% of each other; GCS models that with explicit modifiers in this library,
  // so a plain sum is correct here.
  return (container.children || []).reduce((sum, c) => sum + traitPoints(c), 0);
}

// --- skills ----------------------------------------------------------------

/**
 * Relative level a given point spend buys, per the GURPS skill cost table
 * (B170): 1 point buys the base, 2 buys +1, 4 buys +2, then +1 per 4 points.
 */
export function skillRelativeLevel(points, difficulty) {
  const base = { e: 0, a: -1, h: -2, vh: -3 }[difficulty] ?? -1;
  if (points <= 0) return null;
  if (points === 1) return base;
  if (points < 4) return base + 1;
  return base + 1 + Math.floor(points / 4);
}

/** Legal point spends, cheapest first. GURPS only allows 1, 2, then multiples of 4. */
export const SKILL_POINT_STEPS = [1, 2, 4, 8, 12, 16, 20, 24, 28, 32];

/** Split a "dx/a" style difficulty string into attribute and difficulty. */
export function parseDifficulty(difficulty) {
  const [attr, diff] = String(difficulty || "dx/a").split("/");
  return { attr, diff };
}
