// Builds a GCS 5.x character sheet (.gcs) from a wizard build.
//
// Everything structural — traits, skills, equipment — is copied verbatim from
// the Eclipse Phase libraries, which GCS already loads. The only things this
// module authors from scratch are the sheet envelope and the handful of fields
// the wizard actually chooses (points, levels, which modifiers are enabled).
//
// Field names and types follow gcs/model/gurps: EntityData, Profile,
// SheetSettings, Attribute, Trait, Skill, Equipment and Note.

import { traitPoints, canLevel } from "./cost.js";

/** GCS data-format version. jio.CurrentDataVersion. */
export const DATA_VERSION = 5;

// TID kind bytes, from gcs/model/kinds. The first character of an id decides
// whether GCS treats a row as a container, so regenerating ids must preserve it.
const KIND_ENTITY = "A";
const KIND_NOTE = "n";
const KIND_SKILL = "s";
const KIND_TECHNIQUE = "q";
const KIND_TRAIT = "t";
const KIND_TRAIT_CONTAINER = "T";
const KIND_TRAIT_MODIFIER = "m";
const KIND_EQUIPMENT = "e";

const KIND_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * A TID: one kind byte followed by 16 characters of base64url-encoded
 * randomness (12 bytes), 17 characters total. See toolbox/tid.
 */
export function newTID(kind) {
  if (!KIND_ALPHABET.includes(kind)) throw new Error(`bad TID kind: ${kind}`);
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return kind + b64;
}

/** True if a string is a well-formed TID. */
export function isTID(value) {
  return (
    typeof value === "string" &&
    value.length === 17 &&
    KIND_ALPHABET.includes(value[0]) &&
    /^[A-Za-z0-9_-]{16}$/.test(value.slice(1))
  );
}

// Output-only, recomputed by GCS on load. `source` points at a library row and
// would go stale the moment the libraries are updated, so it is dropped too.
const DROP_KEYS = new Set(["calc", "source"]);

// What GCS clears once it knows a row's shape, per ClearUnusedFieldsForType in
// trait.go, skill.go, equipment.go and note.go. Equipment containers are the
// exception that matters: GCS keeps their own value and weight and adds the
// children's on top, so nothing may be stripped from them.
const CONTAINER_CLEARS = {
  T: ["base_points", "points_per_level", "can_level", "levels", "max_levels",
    "weapons", "features", "round_down", "study", "study_hours_needed"],
  S: ["points", "difficulty", "specialization", "optional_specialization",
    "defaults", "default", "limit", "tech_level", "weapons", "features",
    "defaulted_from", "encumbrance_penalty_multiplier", "study", "study_hours_needed"],
  E: [],
  N: [],
  M: [],
  F: [],
  P: [],
};
const LEAF_CLEARS = {
  t: ["children", "ancestry", "template_picker", "container_type"],
  s: ["children", "template_picker"],
  q: ["children", "template_picker", "defaults"],
  e: ["children"],
  n: ["children"],
  m: ["children"],
  f: ["children"],
  p: ["children"],
  r: ["children"],
};

/**
 * Deep copy a library row, giving every id a fresh TID of the same kind and
 * dropping recomputed fields. Fresh ids matter because a sheet may hold the
 * same library row twice (two identical implants, say) and GCS expects ids to
 * be unique within a file.
 *
 * Rows are also brought into the shape their id kind declares, because GCS
 * decides container-ness from that first byte alone and then discards whatever
 * does not belong. Several library rows carry data GCS drops this way — the
 * aptitude slots in every morph hold seven child traits that duplicate their
 * seven modifiers, and would grant all seven aptitudes at once if the id kind
 * were ever corrected. Doing the same trimming here means the exported file
 * says exactly what GCS will do with it.
 */
export function adopt(node) {
  if (Array.isArray(node)) return node.map(adopt);
  if (node === null || typeof node !== "object") return node;
  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (DROP_KEYS.has(key)) continue;
    if (key === "id" && typeof value === "string" && value.length) {
      out.id = newTID(KIND_ALPHABET.includes(value[0]) ? value[0] : KIND_TRAIT);
    } else {
      out[key] = adopt(value);
    }
  }
  if (!out.id) out.id = newTID(KIND_TRAIT);

  const kind = out.id[0];
  for (const key of CONTAINER_CLEARS[kind] || LEAF_CLEARS[kind] || []) delete out[key];
  // GCS turns the levelled flag on for any trait carrying levels or a per-level
  // cost without it, and several library rows depend on that. Writing the flag
  // out explicitly says what the trait is instead of relying on the fixup.
  if (kind === "t" && canLevel(out)) out.can_level = true;
  return out;
}

// --- small builders --------------------------------------------------------

/** A plain trait row the wizard authors itself (not copied from a library). */
export function trait({ name, points = 0, notes = "", tags = [], reference = "" }) {
  const row = { id: newTID(KIND_TRAIT), name };
  if (reference) row.reference = reference;
  if (tags.length) row.tags = [...tags];
  if (points) row.base_points = points;
  if (notes) row.local_notes = notes;
  return row;
}

/** A trait container the wizard authors itself. */
export function traitGroup(name, children, notes = "") {
  const row = { id: newTID(KIND_TRAIT_CONTAINER), name, children };
  if (notes) row.local_notes = notes;
  return row;
}

/** A skill row. `difficulty` is GCS's "attr/diff" form, e.g. "iq/vh". */
export function skill({
  name,
  specialization = "",
  difficulty,
  points,
  notes = "",
  reference = "",
  techLevel = null,
  defaults = null,
  replacements = null,
}) {
  const row = { id: newTID(KIND_SKILL), name };
  if (reference) row.reference = reference;
  if (specialization) row.specialization = specialization;
  row.difficulty = difficulty;
  if (defaults) row.defaults = defaults;
  if (techLevel !== null) row.tech_level = techLevel;
  row.points = points;
  if (notes) row.local_notes = notes;
  if (replacements) row.replacements = replacements;
  return row;
}

/** An equipment row copied from a library, with a quantity applied. */
export function equipmentFrom(payload, quantity = 1, equipped = true) {
  const row = adopt(payload);
  row.id = newTID(row.id?.[0] === "E" ? "E" : KIND_EQUIPMENT);
  row.quantity = quantity;
  row.equipped = equipped;
  return row;
}

/** A markdown note row. */
export function note(markdown) {
  return { id: newTID(KIND_NOTE), markdown };
}

// --- morph handling --------------------------------------------------------

/** Walk every row in a trait tree, containers included. */
export function* everyRow(row) {
  yield row;
  for (const child of row.children || []) yield* everyRow(child);
}

/** The customization slots in a morph, in document order. */
export function aptitudeSlots(morph) {
  return [...everyRow(morph)].filter((r) =>
    String(r.name || "").startsWith("Choose One Aptitude"),
  );
}

/**
 * Enable one aptitude option per customization slot.
 * @param {object} morph an adopted morph container
 * @param {number[]} choices index into each slot's modifier list, -1 for none
 */
export function applyAptitudes(morph, choices) {
  aptitudeSlots(morph).forEach((slot, i) => {
    (slot.modifiers || []).forEach((mod, j) => {
      mod.disabled = j !== choices[i];
    });
  });
}

/**
 * Re-point the Morph Price Adjustment so the morph container totals exactly
 * `target` in GCS.
 *
 * The libraries state each morph's chargen price (its Eclipse Phase CP cost
 * divided by four) and carry a negative adjustment trait sized to reach it. For
 * about a fifth of the morphs that adjustment was computed without applying the
 * enabled modifiers on the morph's own traits, so GCS arrives at a different
 * total than the documented price. Rewriting the adjustment restores the
 * documented price, which is what the trait exists to enforce.
 *
 * @returns {?{from: number, to: number, delta: number}} null when nothing changed
 */
export function normalizeMorphPrice(morph, target) {
  const adjustment = [...everyRow(morph)].find(
    (r) => r.name === "Morph Price Adjustment",
  );
  if (!adjustment) return null;
  const current = traitPoints(morph);
  const delta = target - current;
  if (delta === 0) return null;
  const from = adjustment.base_points || 0;
  const to = from + delta;
  adjustment.base_points = to;
  adjustment.local_notes =
    `${adjustment.local_notes || ""} Adjusted by ${delta > 0 ? "+" : ""}${delta} ` +
    `so this morph totals its documented chargen price of ${target} points in GCS.`.trim();
  return { from, to, delta };
}

// --- the sheet -------------------------------------------------------------

const rfc3339 = (date) => date.toISOString().replace(/\.\d{3}Z$/, "Z");

/**
 * Assemble the GCS entity.
 *
 * @param {object} sheet
 * @param {object} sheet.profile      name, player, age, gender, ...
 * @param {number} sheet.totalPoints  campaign point total
 * @param {object} sheet.attributes   {dx: 12, iq: 13, ...} final values
 * @param {object[]} sheet.attributeDefs  rows from EP_ATT.attr
 * @param {object[]} sheet.traits
 * @param {object[]} sheet.skills
 * @param {object[]} sheet.equipment
 * @param {string[]} sheet.notes      markdown blocks
 */
export function buildEntity(sheet) {
  const now = new Date();
  const stamp = rfc3339(now);

  // GCS stores an attribute as its adjustment from the definition's base, not
  // its final value: adj = value - base. Only attributes with a constant base
  // are settable here; the derived ones (Basic Speed, HP, FP, the senses) have
  // formula bases and are left at their computed value, which is what the
  // Ego/morph split calls for.
  const attributes = sheet.attributeDefs.map((def) => {
    const wanted = sheet.attributes[def.id];
    const base = Number(def.base);
    const settable = wanted !== undefined && Number.isFinite(base);
    return { attr_id: def.id, adj: settable ? wanted - base : 0 };
  });

  const entity = {
    version: DATA_VERSION,
    id: newTID(KIND_ENTITY),
    total_points: sheet.totalPoints,
    points_record: [
      { when: stamp, points: sheet.totalPoints, reason: "Initial points" },
    ],
    profile: { ...sheet.profile },
    settings: {
      // Embedding the Eclipse Phase attribute definitions makes the sheet
      // self-contained: it computes correctly on a machine that has never
      // loaded EP_ATT.attr.
      attributes: sheet.attributeDefs,
      damage_progression: "basic_set",
      default_length_units: "ft_in",
      default_weight_units: "lb",
      user_description_display: "tooltip",
      modifiers_display: "inline",
      notes_display: "inline",
      skill_level_adj_display: "tooltip",
      show_spell_adj: true,
    },
    attributes,
    created_date: stamp,
    modified_date: stamp,
  };

  if (sheet.traits?.length) entity.traits = sheet.traits;
  if (sheet.skills?.length) entity.skills = sheet.skills;
  if (sheet.equipment?.length) entity.equipment = sheet.equipment;
  if (sheet.notes?.length) entity.notes = sheet.notes.map(note);

  return entity;
}

/** Serialize an entity the way GCS writes files: tab-indented JSON. */
export function serialize(entity) {
  return JSON.stringify(entity, null, "\t") + "\n";
}

/** Suggest a filename for a character. */
export function filenameFor(name) {
  const base = String(name || "").trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, " ");
  return `${base || "Eclipse Phase Character"}.gcs`;
}
