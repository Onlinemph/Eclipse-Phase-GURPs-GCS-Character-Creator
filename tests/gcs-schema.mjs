// A validator for GCS 5.x data, derived from gcs/model/gurps.
//
// The key lists come from the Go structs that define what GCS writes and reads
// (EntityData, TraitData, SkillData, EquipmentData, NoteData and friends). The
// checks that matter most are the ones GCS cannot recover from: a malformed or
// duplicated TID, a container/leaf mismatch, or a field GCS has no place to put.

export const KIND = {
  entity: "A",
  trait: "t", traitContainer: "T", traitModifier: "m", traitModifierContainer: "M",
  skill: "s", skillContainer: "S", technique: "q",
  equipment: "e", equipmentContainer: "E",
  equipmentModifier: "f", equipmentModifierContainer: "F",
  note: "n", noteContainer: "N",
  weaponMelee: "w", weaponRanged: "W",
  spell: "p", spellContainer: "P", ritualMagicSpell: "r",
};

const KIND_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function isTID(value) {
  return (
    typeof value === "string" &&
    value.length === 17 &&
    KIND_ALPHABET.includes(value[0]) &&
    /^[A-Za-z0-9_-]{16}$/.test(value.slice(1))
  );
}

// Keys each node type may carry, per the Go structs. Legacy names GCS still
// migrates on load are included so library files written by older tools pass.
const COMMON = ["id", "source", "third_party", "vtt_notes", "replacements", "children"];

export const KEYS = {
  entity: [
    "version", "id", "total_points", "points_record", "profile", "settings",
    "attributes", "traits", "skills", "spells", "equipment", "other_equipment",
    "notes", "created_date", "modified_date", "third_party", "calc", "advantages",
  ],
  trait: [
    ...COMMON, "userdesc", "modifiers", "cr", "frequency", "disabled", "levels",
    "study", "study_hours_needed", "name", "reference", "reference_highlight",
    "local_notes", "tags", "prereqs", "cr_adj", "base_points", "points_per_level",
    "max_levels", "weapons", "features", "round_down", "can_level", "ancestry",
    "template_picker", "container_type",
    "type", "notes", "categories", "mental", "physical", "social", "exotic",
    "supernatural", "open", "calc",
  ],
  traitModifier: [
    ...COMMON, "levels", "disabled", "name", "reference", "reference_highlight",
    "local_notes", "tags", "cost_adj", "use_level_from_trait", "show_notes_on_weapon",
    "affects", "features",
    "cost", "cost_type", "type", "notes", "categories", "calc",
  ],
  skill: [
    ...COMMON, "tech_level", "points", "defaulted_from", "study", "study_hours_needed",
    "name", "reference", "reference_highlight", "local_notes", "tags", "specialization",
    "optional_specialization", "difficulty", "encumbrance_penalty_multiplier",
    "defaults", "default", "limit", "prereqs", "weapons", "features", "template_picker",
    "type", "notes", "categories", "open", "calc",
  ],
  equipment: [
    ...COMMON, "modifiers", "rated_strength", "quantity", "level", "uses", "equipped",
    "description", "reference", "reference_highlight", "local_notes", "tech_level",
    "legality_class", "tags", "base_value", "base_weight", "max_uses", "prereqs",
    "weapons", "features", "ignore_weight_for_skills",
    "type", "notes", "categories", "open", "value", "weight", "calc",
  ],
  note: [
    ...COMMON, "markdown", "reference", "reference_highlight", "tags",
    "type", "text", "open", "calc",
  ],
  attribute: ["attr_id", "adj", "damage", "calc"],
  pointsRecord: ["when", "points", "reason"],
  profile: [
    "name", "age", "birthday", "eyes", "hair", "skin", "handedness", "gender",
    "height", "weight", "player_name", "title", "organization", "religion",
    "tech_level", "portrait", "SM",
  ],
  settings: [
    "page", "block_layout", "attributes", "body_type", "damage_progression",
    "default_length_units", "default_weight_units", "user_description_display",
    "modifiers_display", "notes_display", "skill_level_adj_display",
    "use_multiplicative_modifiers", "use_modifying_dice_plus_adds",
    "use_half_stat_defaults", "show_trait_modifier_adj", "show_equipment_modifier_adj",
    "show_all_weapons", "hide_unused_weapon_columns", "show_spell_adj",
    "hide_source_mismatch", "hide_tl_column", "hide_lc_column", "hide_page_ref_column",
    "use_title_in_footer", "exclude_unspent_points_from_total", "show_lifting_st_damage",
    "show_iq_based_damage", "hide_zero_value_conditional_modifiers",
    "hit_locations", "show_advantage_modifier_adj",
  ],
  attributeDef: [
    "id", "type", "name", "full_name", "base", "cost_per_point",
    "cost_adj_percent_per_sm", "thresholds", "attribute_base", "order", "script",
    "placement", "tooltip",
  ],
};

export const ENUMS = {
  damage_progression: [
    "basic_set", "knowing_your_own_strength", "no_school_grognard_damage",
    "thrust_equals_swing_minus_2", "swing_equals_thrust_plus_2", "tbone_1",
    "tbone_1_clean", "tbone_2", "tbone_2_clean", "phoenix_flame_d3",
  ],
  default_length_units: ["ft_in", "in", "ft", "yd", "mi", "cm", "km", "m"],
  default_weight_units: ["lb", "#", "oz", "tn", "t", "kg", "g"],
  display: ["not_shown", "inline", "tooltip", "inline_and_tooltip"],
};

const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

/**
 * Validate a node tree.
 *
 * @param {object[]} rows
 * @param {"trait"|"skill"|"equipment"|"note"} type
 * @param {object} v collector: {problems, seenIDs, extraKeys}
 * @param {string[]} path
 */
export function checkRows(rows, type, v, path = []) {
  if (!Array.isArray(rows)) {
    v.problems.push(`${path.join(" / ")}: expected an array of ${type} rows`);
    return;
  }
  for (const row of rows) {
    const here = [...path, row.name || row.description || "?"];
    const label = here.join(" / ");

    if (!isTID(row.id)) {
      v.problems.push(`${label}: id "${row.id}" is not a valid TID`);
    } else {
      if (v.seenIDs.has(row.id)) v.problems.push(`${label}: duplicate id ${row.id}`);
      v.seenIDs.add(row.id);
      checkKind(row, type, label, v);
    }

    for (const key of Object.keys(row)) {
      if (!KEYS[type].includes(key)) {
        v.problems.push(`${label}: unknown ${type} field "${key}"`);
      }
      if (key === "calc" || key === "source") v.extraKeys.add(`${type}.${key}`);
    }

    if (type === "trait" && Array.isArray(row.modifiers)) {
      checkModifiers(row.modifiers, v, here);
    }
    if (Array.isArray(row.children)) checkRows(row.children, type, v, here);
    checkWeapons(row.weapons, v, here);
  }
}

// Fields GCS clears when a row turns out to be a container
// (ClearUnusedFieldsForType in trait.go / skill.go / equipment.go).
const LEAF_ONLY = {
  trait: ["base_points", "points_per_level", "can_level", "levels", "max_levels",
    "features", "weapons", "round_down", "study", "study_hours_needed"],
  skill: ["points", "difficulty", "specialization", "defaults", "default", "limit",
    "tech_level", "features", "weapons"],
  equipment: ["base_value", "base_weight", "max_uses", "features", "weapons"],
  note: [],
};

function checkKind(row, type, label, v) {
  const kind = row.id[0];
  const hasChildren = Array.isArray(row.children);
  const expected = {
    trait: [KIND.trait, KIND.traitContainer],
    skill: [KIND.skill, KIND.skillContainer, KIND.technique],
    equipment: [KIND.equipment, KIND.equipmentContainer],
    note: [KIND.note, KIND.noteContainer],
  }[type];

  if (!expected.includes(kind)) {
    v.problems.push(`${label}: id kind "${kind}" is not a ${type} kind (${expected.join("")})`);
    return;
  }
  const containerKind = { trait: KIND.traitContainer, skill: KIND.skillContainer,
    equipment: KIND.equipmentContainer, note: KIND.noteContainer }[type];

  // GCS decides container-ness from the id alone and then discards whatever
  // does not belong to that shape. Neither case stops a file loading, but both
  // mean the file says something GCS will not do.
  if (hasChildren && kind !== containerKind) {
    v.warnings.push(
      `${label}: id kind "${kind}" is a leaf, so GCS discards its ${row.children.length} children on load`,
    );
  }
  if (kind === containerKind) {
    const lost = LEAF_ONLY[type].filter((key) => key in row);
    if (lost.length) {
      v.warnings.push(`${label}: is a container, so GCS clears ${lost.join(", ")} on load`);
    }
  }
}

function checkModifiers(modifiers, v, path) {
  for (const mod of modifiers) {
    const label = [...path, mod.name || "?"].join(" / ");
    if (!isTID(mod.id)) {
      v.problems.push(`${label}: modifier id "${mod.id}" is not a valid TID`);
    } else {
      if (v.seenIDs.has(mod.id)) v.problems.push(`${label}: duplicate modifier id ${mod.id}`);
      v.seenIDs.add(mod.id);
      const kind = mod.id[0];
      const container = Array.isArray(mod.children);
      if (![KIND.traitModifier, KIND.traitModifierContainer].includes(kind)) {
        v.problems.push(`${label}: modifier id kind "${kind}" is not a modifier kind`);
      } else if (container !== (kind === KIND.traitModifierContainer)) {
        v.problems.push(`${label}: modifier container flag disagrees with id kind "${kind}"`);
      }
    }
    for (const key of Object.keys(mod)) {
      if (!KEYS.traitModifier.includes(key)) {
        v.problems.push(`${label}: unknown modifier field "${key}"`);
      }
    }
    if (Array.isArray(mod.children)) checkModifiers(mod.children, v, [...path, mod.name || "?"]);
  }
}

function checkWeapons(weapons, v, path) {
  for (const weapon of weapons || []) {
    const label = [...path, "weapon"].join(" / ");
    if (!isTID(weapon.id)) {
      v.problems.push(`${label}: weapon id "${weapon.id}" is not a valid TID`);
    } else {
      if (v.seenIDs.has(weapon.id)) v.problems.push(`${label}: duplicate weapon id ${weapon.id}`);
      v.seenIDs.add(weapon.id);
      if (![KIND.weaponMelee, KIND.weaponRanged].includes(weapon.id[0])) {
        v.problems.push(`${label}: weapon id kind "${weapon.id[0]}" is not a weapon kind`);
      }
    }
  }
}

/** Validate a complete character sheet. Returns a list of problems. */
export function validateEntity(entity) {
  const v = { problems: [], warnings: [], seenIDs: new Set(), extraKeys: new Set() };
  const p = v.problems;

  if (entity.version !== 5) p.push(`version is ${entity.version}, expected 5`);
  if (!isTID(entity.id) || entity.id[0] !== KIND.entity) {
    p.push(`entity id "${entity.id}" is not a valid TID of kind ${KIND.entity}`);
  }
  v.seenIDs.add(entity.id);

  if (typeof entity.total_points !== "number") p.push("total_points is not a number");
  for (const key of Object.keys(entity)) {
    if (!KEYS.entity.includes(key)) p.push(`unknown entity field "${key}"`);
  }
  for (const key of ["created_date", "modified_date"]) {
    if (!RFC3339.test(entity[key] || "")) p.push(`${key} "${entity[key]}" is not RFC3339`);
  }

  for (const record of entity.points_record || []) {
    for (const key of Object.keys(record)) {
      if (!KEYS.pointsRecord.includes(key)) p.push(`unknown points_record field "${key}"`);
    }
    if (!RFC3339.test(record.when || "")) p.push(`points_record.when "${record.when}" is not RFC3339`);
  }

  for (const key of Object.keys(entity.profile || {})) {
    if (!KEYS.profile.includes(key)) p.push(`unknown profile field "${key}"`);
  }

  const settings = entity.settings || {};
  for (const key of Object.keys(settings)) {
    if (!KEYS.settings.includes(key)) p.push(`unknown settings field "${key}"`);
  }
  if (settings.damage_progression &&
      !ENUMS.damage_progression.includes(settings.damage_progression)) {
    p.push(`damage_progression "${settings.damage_progression}" is not a known value`);
  }
  if (settings.default_length_units &&
      !ENUMS.default_length_units.includes(settings.default_length_units)) {
    p.push(`default_length_units "${settings.default_length_units}" is not a known value`);
  }
  if (settings.default_weight_units &&
      !ENUMS.default_weight_units.includes(settings.default_weight_units)) {
    p.push(`default_weight_units "${settings.default_weight_units}" is not a known value`);
  }
  for (const key of ["user_description_display", "modifiers_display", "notes_display",
    "skill_level_adj_display"]) {
    if (settings[key] && !ENUMS.display.includes(settings[key])) {
      p.push(`${key} "${settings[key]}" is not a known display option`);
    }
  }

  // settings.attributes is a bare list of definitions inside a sheet, not the
  // {version, rows} wrapper the .attr file uses.
  if (!Array.isArray(settings.attributes)) {
    p.push("settings.attributes should be an array of attribute definitions");
  } else {
    const ids = new Set();
    for (const def of settings.attributes) {
      if (!def.id) p.push("an attribute definition has no id");
      if (ids.has(def.id)) p.push(`duplicate attribute definition "${def.id}"`);
      ids.add(def.id);
      for (const key of Object.keys(def)) {
        if (!KEYS.attributeDef.includes(key)) {
          p.push(`unknown attribute definition field "${key}" on ${def.id}`);
        }
      }
    }
    for (const attr of entity.attributes || []) {
      for (const key of Object.keys(attr)) {
        if (!KEYS.attribute.includes(key)) p.push(`unknown attribute field "${key}"`);
      }
      if (!ids.has(attr.attr_id)) {
        p.push(`attribute "${attr.attr_id}" has no matching definition in settings.attributes`);
      }
      if (typeof attr.adj !== "number") p.push(`attribute "${attr.attr_id}" adj is not a number`);
    }
  }

  checkRows(entity.traits || [], "trait", v, ["traits"]);
  checkRows(entity.skills || [], "skill", v, ["skills"]);
  checkRows(entity.equipment || [], "equipment", v, ["equipment"]);
  checkRows(entity.other_equipment || [], "equipment", v, ["other_equipment"]);
  checkRows(entity.notes || [], "note", v, ["notes"]);

  return v;
}
