// The build: everything the wizard collects, plus the point and cash maths.
//
// The build is a plain JSON object so it can be saved to localStorage, exported
// to a file, and reloaded later. Catalogue payloads are never stored in it —
// only the keys needed to look them up again.

import { traitPoints, skillRelativeLevel } from "./cost.js";
import { poundsOf } from "./features.js";

export const BUILD_FORMAT = 1;
export const STORAGE_KEY = "ep-gurps-build";

/** Campaign defaults from the conversion. */
export const DEFAULT_POINTS = 250;
export const DEFAULT_WEALTH = 50000;
export const DISADVANTAGE_LIMIT = -50;
export const REP_MAX_LEVEL = 8;
export const REP_COST_PER_LEVEL = 3;
export const ASYNC_TALENT_MAX = 4;
export const ASYNC_TALENT_COST = 5;
export const MUSE_ALLY_COST = 5;

/**
 * The sheet settings GCS writes, at the values this conversion assumes.
 * Everything here is exposed in the Sheet settings step; GCS's own Sheet
 * Settings dialog shows the same list.
 */
export const DEFAULT_SETTINGS = {
  damage_progression: "basic_set",
  default_length_units: "ft_in",
  default_weight_units: "lb",
  user_description_display: "tooltip",
  modifiers_display: "inline",
  notes_display: "inline",
  skill_level_adj_display: "tooltip",
  show_spell_adj: true,
  show_trait_modifier_adj: false,
  show_equipment_modifier_adj: false,
  show_all_weapons: false,
  hide_unused_weapon_columns: false,
  use_multiplicative_modifiers: false,
  use_modifying_dice_plus_adds: false,
  use_half_stat_defaults: false,
  use_title_in_footer: false,
  hide_tl_column: false,
  hide_lc_column: false,
  hide_page_ref_column: false,
  exclude_unspent_points_from_total: false,
  show_lifting_st_damage: false,
  show_iq_based_damage: false,
  hide_zero_value_conditional_modifiers: false,
};

/** Attributes the Ego buys. ST/HT/HP/FP belong to the morph. */
export const EGO_ATTRIBUTES = ["dx", "iq", "will", "per"];

export function defaultBuild() {
  return {
    format: BUILD_FORMAT,
    totalPoints: DEFAULT_POINTS,
    startingWealth: DEFAULT_WEALTH,
    profile: {
      name: "",
      player_name: "",
      gender: "",
      age: "",
      handedness: "",
      tech_level: "10",
      title: "",
      organization: "",
      religion: "",
      height: "",
      weight: "",
      eyes: "",
      hair: "",
      skin: "",
      birthday: "",
      SM: 0,
      portrait: "",
    },
    attributes: { dx: 11, iq: 11, will: 10, per: 10 },
    background: null,
    faction: null,
    repnets: {},
    skills: [],
    morph: null,
    augTraits: [],
    augEquipment: [],
    gear: [],
    muse: "none",
    psi: { enabled: false, talent: 0, sleights: [], disorders: "" },
    // Traits taken from Eclipse_Phase_Ego_Traits.adq and the derangement
    // catalogue, by key. Hand-entered ones live in customTraits.
    egoTraits: [],
    customTraits: [],
    // Toggled trait and equipment modifiers, keyed by "<scope>:<key>" and then
    // by the row's address inside its library payload. See js/modifiers.js.
    modifierChoices: {},
    settings: { ...DEFAULT_SETTINGS },
    notes: "",
    options: { normalizeMorphPrice: true, includeBuildNote: true, showAllMorphs: false },
  };
}

// --- persistence -----------------------------------------------------------

export function save(build) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(build));
    return true;
  } catch {
    return false; // private browsing, quota, etc. — not worth interrupting for
  }
}

export function restore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearSaved() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to do */
  }
}

/** Fill in anything a build saved by an older version is missing. */
export function migrate(build) {
  const base = defaultBuild();
  const merged = { ...base, ...build };
  merged.profile = { ...base.profile, ...(build.profile || {}) };
  merged.attributes = { ...base.attributes, ...(build.attributes || {}) };
  merged.psi = { ...base.psi, ...(build.psi || {}) };
  merged.options = { ...base.options, ...(build.options || {}) };
  merged.settings = { ...base.settings, ...(build.settings || {}) };
  if (!merged.modifierChoices || typeof merged.modifierChoices !== "object") {
    merged.modifierChoices = {};
  }
  for (const list of ["skills", "augTraits", "augEquipment", "gear", "customTraits", "egoTraits"]) {
    if (!Array.isArray(merged[list])) merged[list] = [];
  }
  if (!merged.repnets || typeof merged.repnets !== "object") merged.repnets = {};
  // Skill rows are addressed by a stable id. Builds saved before that existed
  // need one, or every row would answer to the same undefined key.
  merged.skills = merged.skills.map((skill, index) => (
    skill.uid ? skill : { ...skill, uid: `migrated-${index}` }
  ));
  merged.format = BUILD_FORMAT;
  return merged;
}

// --- points ----------------------------------------------------------------

/** Cost of the Ego's attributes, priced by EP_ATT.attr. */
export function attributePoints(build, attrDefs) {
  let total = 0;
  for (const def of attrDefs) {
    const wanted = build.attributes[def.id];
    if (wanted === undefined) continue;
    const base = Number(def.base);
    if (!Number.isFinite(base)) continue;
    total += (wanted - base) * (def.cost_per_point || 0);
  }
  return total;
}

export function repPoints(build) {
  return Object.values(build.repnets).reduce(
    (sum, level) => sum + level * REP_COST_PER_LEVEL,
    0,
  );
}

export function skillPoints(build) {
  return build.skills.reduce((sum, s) => sum + (s.points || 0), 0);
}

/**
 * What the chosen morph costs on the sheet.
 *
 * With price normalisation on (the default) this is the documented chargen
 * price. With it off it is whatever GCS will actually compute from the morph's
 * traits, which for some morphs differs — see `normalizeMorphPrice` in gcs.js.
 */
export function morphPoints(build, cat) {
  if (!build.morph) return 0;
  const entry = cat.morphIndex?.find((m) => m.key === build.morph.key);
  if (!entry) return 0;
  if (build.options.normalizeMorphPrice) return entry.points;
  const payload = cat.morphs?.get(build.morph.key);
  return payload ? traitPoints(payload) : entry.points;
}

export function augTraitPoints(build, cat) {
  if (!cat.augs) return 0;
  return build.augTraits.reduce((sum, chosen) => {
    if (chosen.offset) return sum; // paired with a price adjustment, nets zero
    const entry = cat.augs.traits.find((t) => t.key === chosen.key);
    return sum + (entry ? traitPoints(entry.payload) : 0);
  }, 0);
}

/**
 * Async cost: the Infection, Async Talent, and sleights bought as Alternative
 * Abilities — full price for the primary, one fifth for each alternate.
 */
export function psiPoints(build, cat) {
  if (!build.psi.enabled || !cat.sleights) return 0;
  const infection = cat.sleights.core.find((c) => c.name === "Watts-MacLeod Infection");
  let total = infection ? traitPoints(infection.payload) : -10;
  total += build.psi.talent * ASYNC_TALENT_COST;

  const all = new Map(
    cat.sleights.groups.flatMap((g) => g.items.map((i) => [i.key, i])),
  );
  for (const chosen of build.psi.sleights) {
    const entry = all.get(chosen.key);
    if (!entry) continue;
    const full = traitPoints(entry.payload);
    // Passive sleights are always on and cannot be alternates (Powers p. 11).
    const alternate = chosen.alternate && entry.can_alternate;
    total += alternate ? Math.ceil(full * 0.2) : full;
  }
  return total;
}

/**
 * What a hand-entered trait costs. Priced through the same engine as everything
 * else so a levelled trait with a self-control roll comes out at the number GCS
 * will show.
 */
export function customTraitCost(trait) {
  const row = { id: "t" };
  if (trait.levelled) {
    row.can_level = true;
    row.base_points = trait.basePoints || 0;
    row.points_per_level = trait.pointsPerLevel || 0;
    row.levels = trait.levels || 0;
  } else {
    row.base_points = trait.points || 0;
  }
  if (trait.cr) row.cr = trait.cr;
  return traitPoints(row);
}

/** Ego traits and derangements taken from the libraries. */
export function egoTraitPoints(build, cat) {
  if (!cat.egoTraits) return 0;
  const index = egoTraitIndex(cat);
  return build.egoTraits.reduce((sum, chosen) => {
    const entry = index.get(chosen.key);
    return sum + (entry ? traitPoints(entry.payload) : 0);
  }, 0);
}

/** Every ego trait and derangement, by key. */
export function egoTraitIndex(cat) {
  return new Map(
    (cat.egoTraits?.groups || []).flatMap((g) => g.items.map((i) => [i.key, i])),
  );
}

export function customTraitPoints(build) {
  return build.customTraits.reduce((sum, t) => sum + customTraitCost(t), 0);
}

export function musePoints(build) {
  return build.muse === "ally" ? MUSE_ALLY_COST : 0;
}

/** Every line of the point budget. */
export function totals(build, cat) {
  const lines = {
    attributes: attributePoints(build, cat.attrDefs || []),
    background: 0,
    faction: 0,
    reputation: repPoints(build),
    skills: skillPoints(build),
    morph: morphPoints(build, cat),
    augmentations: augTraitPoints(build, cat),
    muse: musePoints(build),
    psi: psiPoints(build, cat),
    egoTraits: egoTraitPoints(build, cat),
    other: customTraitPoints(build),
  };
  const bg = cat.packages?.backgrounds.find((b) => b.key === build.background);
  if (bg) lines.background = traitPoints(bg.payload);
  const fac = cat.packages?.factions.find((f) => f.key === build.faction);
  if (fac) lines.faction = traitPoints(fac.payload);

  const spent = Object.values(lines).reduce((a, b) => a + b, 0);
  return {
    lines,
    spent,
    total: build.totalPoints,
    remaining: build.totalPoints - spent,
  };
}

/**
 * The disadvantage tally the −50 limit applies to: mental and social traits
 * only. Physical disadvantages belong to the morph, and the Morph Price
 * Adjustment is bookkeeping rather than a disadvantage.
 */
export function disadvantageTally(build, cat) {
  let total = 0;
  const counted = [];

  const consider = (row, origin) => {
    for (const child of row.children || []) consider(child, origin);
    if (row.children) return;
    if (row.name === "Morph Price Adjustment") return;
    const points = traitPoints(row);
    if (points >= 0) return;
    const tags = row.tags || [];
    // Untagged package traits are Ego-side by construction, so they count.
    const physical = tags.includes("Physical") && !tags.includes("Mental") &&
      !tags.includes("Social");
    if (physical) return;
    total += points;
    counted.push({ name: row.name, points, origin });
  };

  const bg = cat.packages?.backgrounds.find((b) => b.key === build.background);
  if (bg) consider(bg.payload, "Background");
  const fac = cat.packages?.factions.find((f) => f.key === build.faction);
  if (fac) consider(fac.payload, "Faction");
  if (cat.egoTraits) {
    const index = egoTraitIndex(cat);
    for (const chosen of build.egoTraits) {
      const entry = index.get(chosen.key);
      if (!entry) continue;
      const points = traitPoints(entry.payload);
      // Ego traits and derangements are all mental and Ego-side by definition:
      // they are what survives resleeving.
      if (points < 0) {
        total += points;
        counted.push({ name: entry.name, points, origin: "Ego traits" });
      }
    }
  }
  for (const t of build.customTraits) {
    const points = customTraitCost(t);
    if (points < 0 && t.kind !== "physical") {
      total += points;
      counted.push({ name: t.name, points, origin: "Other traits" });
    }
  }
  if (build.psi.enabled && cat.sleights) {
    const infection = cat.sleights.core.find(
      (c) => c.name === "Watts-MacLeod Infection",
    );
    if (infection) {
      const points = traitPoints(infection.payload);
      total += points;
      counted.push({ name: infection.name, points, origin: "Async" });
    }
  }
  return { total, counted };
}

// --- money -----------------------------------------------------------------

export function cashSpent(build, cat) {
  let total = 0;
  if (cat.augs) {
    const index = new Map(cat.augs.equipment.map((e) => [e.key, e]));
    for (const item of build.augEquipment) {
      const entry = index.get(item.key);
      if (entry) total += entry.price * (item.qty || 1) * 1.1; // +10% installation
    }
  }
  if (cat.gear) {
    const index = new Map(
      cat.gear.categories.flatMap((c) => c.items.map((i) => [i.key, i])),
    );
    for (const item of build.gear) {
      const entry = index.get(item.key);
      if (entry) total += entry.price * (item.qty || 1);
    }
  }
  return Math.round(total * 100) / 100;
}

/** Weight carried, in pounds, for the encumbrance calculation. */
export function weightCarried(build, cat) {
  if (!cat.gear) return 0;
  const index = new Map(cat.gear.categories.flatMap((c) => c.items.map((i) => [i.key, i])));
  let total = 0;
  for (const item of build.gear) {
    if (item.stowed) continue; // stowed gear is not on the character
    const entry = index.get(item.key);
    if (entry) total += poundsOf(entry.weight) * (item.qty || 1);
  }
  return Math.round(total * 100) / 100;
}

// --- validation ------------------------------------------------------------

const err = (text) => ({ level: "error", text });
const warn = (text) => ({ level: "warn", text });
const ok = (text) => ({ level: "ok", text });

/** Everything Step 11 checks, plus the constraints the libraries imply. */
export function validate(build, cat, prereqReport = null) {
  const out = [];
  const t = totals(build, cat);

  if (t.remaining < 0) {
    out.push(err(`Over budget by ${-t.remaining} points (${t.spent} of ${t.total} spent).`));
  } else if (t.remaining > 0) {
    out.push(warn(`${t.remaining} points unspent.`));
  } else {
    out.push(ok(`Exactly ${t.total} points spent.`));
  }

  const dis = disadvantageTally(build, cat);
  if (dis.total < DISADVANTAGE_LIMIT) {
    out.push(err(
      `Mental and social disadvantages total ${dis.total}, past the ${DISADVANTAGE_LIMIT} limit.`,
    ));
  } else if (dis.total < 0) {
    out.push(ok(`Disadvantage tally ${dis.total}, within the ${DISADVANTAGE_LIMIT} limit.`));
  }

  if (!build.profile.name.trim()) out.push(warn("The character has no name."));
  if (!build.background) out.push(warn("No background chosen (Step 3)."));

  if (!build.morph) {
    out.push(err("No morph chosen. Without one the sheet has no ST, HT, HP or FP (Step 6)."));
  } else {
    const entry = cat.morphIndex?.find((m) => m.key === build.morph.key);
    if (entry) {
      if (!entry.chargen) {
        out.push(err(
          `The ${entry.name} is not available at character creation` +
          (entry.priced ? "." : `, and with no price adjustment it costs its full package value of ${entry.points} points.`),
        ));
      }
      const chosen = build.morph.aptitudes || [];
      for (let i = 0; i < entry.slots; i += 1) {
        if (chosen[i] === undefined || chosen[i] < 0) {
          out.push(err(`Customization slot ${i + 1} of the ${entry.name} has no aptitude selected (Step 6).`));
        }
      }
      if (entry.slots === 0 && chosen.some((c) => c >= 0)) {
        out.push(warn(`The ${entry.name} has no customization slot; the selection will be ignored.`));
      }
    }
  }

  const resleeving = build.skills.some((s) => s.name === "Professional Skill (Resleeving)");
  if (!resleeving) {
    out.push(warn(
      "No points in Professional Skill (Resleeving). Every resleeve rolls it twice at −5 by default (Step 5).",
    ));
  }

  const hasBackup = build.gear.some((g) => g.key.startsWith("backup-insurance"));
  if (!hasBackup) {
    out.push(warn(
      "No backup insurance. Without it, a death that loses the cortical stack is permanent (Step 8).",
    ));
  }

  const cash = cashSpent(build, cat);
  if (cash > build.startingWealth) {
    out.push(err(
      `Equipment costs $${cash.toLocaleString()}, over the $${build.startingWealth.toLocaleString()} starting wealth.`,
    ));
  }

  if (build.psi.enabled) {
    const morphEntry = cat.morphIndex?.find((m) => m.key === build.morph?.key);
    if (morphEntry && /Synthmorph|Infomorph/.test(morphEntry.category)) {
      out.push(err(
        `An async's brain must be biological. Sleights do not work in the ${morphEntry.name} (Step 10).`,
      ));
    }
    if (build.background === "infolife-agi") {
      out.push(err("AGI characters can never use psi in any morph (Step 3)."));
    }
    if (!build.psi.disorders.trim()) {
      out.push(warn(
        "Watts-MacLeod carries at least 15 points of mandatory mental disorders, chosen with the GM (Step 10).",
      ));
    }
    const primaries = build.psi.sleights.filter((s) => !s.alternate);
    if (build.psi.sleights.length && primaries.length !== 1) {
      out.push(warn(
        `Alternative Abilities charge full price for one sleight and a fifth for the rest; ${primaries.length} are marked full price.`,
      ));
    }
    for (const chosen of build.psi.sleights) {
      const entry = cat.sleights?.groups
        .flatMap((g) => g.items)
        .find((i) => i.key === chosen.key);
      if (entry && entry.skill && !build.skills.some((s) => s.name === entry.skill)) {
        out.push(warn(`${entry.name} needs its own skill, ${entry.skill} (Step 5).`));
      }
    }
  }

  // Bioware needs living tissue.
  const morphEntry = cat.morphIndex?.find((m) => m.key === build.morph?.key);
  if (morphEntry && cat.augs) {
    const synthetic = /Synthmorph/.test(morphEntry.category);
    if (synthetic) {
      const index = new Map(cat.augs.equipment.map((e) => [e.key, e]));
      for (const item of build.augEquipment) {
        const entry = index.get(item.key);
        if (entry && entry.compat === "biomorph") {
          out.push(warn(
            `${entry.name} is bioware and does not fit a synthmorph like the ${morphEntry.name} (Step 7).`,
          ));
        }
      }
    }
  }

  for (const s of build.skills) {
    if (skillRelativeLevel(s.points, s.difficulty.split("/")[1]) === null) {
      out.push(err(`${s.name} has no points assigned.`));
    }
  }

  // Prerequisites, which GCS marks in red on the sheet if they go unmet.
  if (prereqReport) {
    for (const item of prereqReport.unmet) {
      out.push(warn(`${item.name}: ${item.reason}.`));
    }
    if (!prereqReport.unmet.length) out.push(ok("Every prerequisite is satisfied."));
    if (prereqReport.unevaluated.length) {
      out.push(warn(
        `Not checked: ${prereqReport.unevaluated.join(", ")}. The libraries have started using ` +
        "prerequisite kinds this builder does not evaluate — verify those in GCS.",
      ));
    }
  }

  return out;
}
