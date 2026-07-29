// Prerequisites: what a trait or skill needs before it is legal.
//
// 86 rows across the libraries carry them — 62 in the morphs alone. Nothing
// checked them until now, so a character could be built that GCS opens with
// unsatisfied-prerequisite markers all over it.
//
// The libraries use four of GCS's twelve prereq kinds: the AND/OR list wrapper,
// trait, skill, and contained-weight. The rest are recognised and reported as
// unevaluated rather than silently passed, so a library that starts using them
// says so instead of quietly going unchecked.
//
// Mirrors prereq_list.go, trait_prereq.go and skill_prereq.go in gcs/model/gurps.

const lower = (value) => String(value ?? "").toLowerCase().trim();

/** GCS splits a qualifier on newlines: any one of them may match. */
const qualifiers = (text) =>
  String(text ?? "").split("\n").map((q) => q.trim()).filter(Boolean);

const NEGATED = new Set([
  "is_not", "does_not_contain", "does_not_start_with", "does_not_end_with",
]);

/** criteria.StringComparison.Matches */
function textMatches(criteria, value) {
  if (!criteria || !criteria.compare) return true; // AnyText
  const compare = criteria.compare;
  const subject = lower(value);
  const list = qualifiers(criteria.qualifier).map(lower);
  if (!list.length) return !NEGATED.has(compare) ? compare === "is" && subject === "" : true;

  const one = (qualifier) => {
    switch (compare) {
      case "is": return subject === qualifier;
      case "is_not": return subject !== qualifier;
      case "contains": return subject.includes(qualifier);
      case "does_not_contain": return !subject.includes(qualifier);
      case "starts_with": return subject.startsWith(qualifier);
      case "does_not_start_with": return !subject.startsWith(qualifier);
      case "ends_with": return subject.endsWith(qualifier);
      case "does_not_end_with": return !subject.endsWith(qualifier);
      default: return true;
    }
  };
  // A negated comparison must hold against every qualifier; a positive one
  // against any.
  return NEGATED.has(compare) ? list.every(one) : list.some(one);
}

/** criteria.NumericComparison.Matches */
function numberMatches(criteria, value) {
  if (!criteria || !criteria.compare) return true; // AnyNumber
  const qualifier = Number(criteria.qualifier ?? 0);
  switch (criteria.compare) {
    case "is": return value === qualifier;
    case "is_not": return value !== qualifier;
    case "at_least": return value >= qualifier;
    case "at_most": return value <= qualifier;
    default: return true;
  }
}

/** A weight criterion's qualifier is a string like "70 lb". */
function weightMatches(criteria, pounds) {
  if (!criteria || !criteria.compare) return true;
  const match = String(criteria.qualifier ?? "").match(/-?\d+(\.\d+)?/);
  return numberMatches(
    { compare: criteria.compare, qualifier: match ? Number(match[0]) : 0 },
    pounds,
  );
}

const describe = (criteria) =>
  `${criteria?.compare || "is"} “${qualifiers(criteria?.qualifier).join("” or “")}”`;

// --- the individual kinds --------------------------------------------------

function traitPrereq(node, character) {
  const matches = character.traits.filter(
    (t) => textMatches(node.name, t.name) &&
      numberMatches(node.level, t.levels || 0) &&
      textMatches(node.notes, t.notes || ""),
  );
  const satisfied = node.has ? matches.length > 0 : matches.length === 0;
  return {
    satisfied,
    text: `${node.has ? "requires" : "must not have"} a trait whose name ${describe(node.name)}` +
      (node.level?.compare ? `, at a level that ${describe(node.level)}` : ""),
  };
}

function skillPrereq(node, character) {
  const matches = character.skills.filter(
    (s) => textMatches(node.name, s.name) &&
      textMatches(node.specialization, s.specialization || "") &&
      (s.level === null || s.level === undefined
        ? !node.level?.compare
        : numberMatches(node.level, s.level)),
  );
  const satisfied = node.has ? matches.length > 0 : matches.length === 0;
  return {
    satisfied,
    text: `${node.has ? "requires" : "must not have"} a skill whose name ${describe(node.name)}` +
      (node.specialization?.compare ? `, specialization ${describe(node.specialization)}` : "") +
      (node.level?.compare ? `, at a level that ${describe(node.level)}` : ""),
  };
}

function containedWeightPrereq(node, character) {
  // Only meaningful on an equipment container; the wizard has no nested
  // containers, so the contents weigh nothing.
  const carried = character.containedWeight ?? 0;
  const matches = weightMatches(node.qualifier, carried);
  return {
    satisfied: node.has ? matches : !matches,
    text: `contents must weigh ${describe(node.qualifier)}`,
  };
}

const KINDS = {
  trait_prereq: traitPrereq,
  advantage_prereq: traitPrereq, // the name GCS migrated from
  skill_prereq: skillPrereq,
  contained_weight_prereq: containedWeightPrereq,
};

/** Kinds GCS defines that this evaluator does not yet decide. */
const UNEVALUATED = new Set([
  "attribute_prereq", "spell_prereq", "contained_quantity_prereq",
  "equipped_equipment", "script_prereq",
]);

// --- the list --------------------------------------------------------------

/**
 * Evaluate a prerequisite list.
 *
 * @param {object} list a `prereqs` node
 * @param {object} character {traits, skills, containedWeight}
 * @returns {{satisfied: boolean, failures: string[], unevaluated: string[]}}
 */
export function evaluate(list, character) {
  const failures = [];
  const unevaluated = [];
  if (!list) return { satisfied: true, failures, unevaluated };

  const children = list.prereqs || [];
  if (!children.length) return { satisfied: true, failures, unevaluated };

  const results = children.map((node) => {
    if (node.type === "prereq_list") {
      const nested = evaluate(node, character);
      unevaluated.push(...nested.unevaluated);
      return { satisfied: nested.satisfied, text: nested.failures.join("; ") };
    }
    const kind = KINDS[node.type];
    if (!kind) {
      if (UNEVALUATED.has(node.type)) unevaluated.push(node.type);
      // Anything unrecognised is treated as met, so an unimplemented kind never
      // invents a failure.
      return { satisfied: true, text: "" };
    }
    return kind(node, character);
  });

  // `all` is AND; otherwise any one child satisfies the list.
  const satisfied = list.all
    ? results.every((r) => r.satisfied)
    : results.some((r) => r.satisfied);

  if (!satisfied) {
    const unmet = results.filter((r) => !r.satisfied && r.text);
    failures.push(
      list.all
        ? unmet.map((r) => r.text).join("; ")
        : `none of: ${results.map((r) => r.text).filter(Boolean).join("; or ")}`,
    );
  }
  return { satisfied, failures: failures.filter(Boolean), unevaluated };
}

// --- gathering the character -----------------------------------------------

/** Every trait on the sheet, flattened, for prerequisites to match against. */
export function traitList(rows, out = []) {
  for (const row of rows || []) {
    if (row.disabled) continue;
    out.push({
      name: row.name || "",
      levels: row.can_level ? row.levels || 0 : 0,
      notes: row.local_notes || "",
    });
    traitList(row.children, out);
  }
  return out;
}

/**
 * Check every row that carries prerequisites.
 *
 * @param {object[]} traits assembled trait rows
 * @param {object[]} skills levelled skills, for matching against
 * @param {object[]} skillRows the sheet's skill rows, which carry prereqs of their own
 * @param {object[]} carried carried equipment
 * @returns {{unmet: object[], unevaluated: string[]}}
 */
export function checkAll({ traits, skills, skillRows, carried }) {
  const character = { traits: traitList(traits), skills, containedWeight: 0 };
  const unmet = [];
  const unevaluated = new Set();

  const visit = (rows, origin) => {
    for (const row of rows || []) {
      if (row.disabled) continue;
      const name = row.name || row.description || "";
      if (row.prereqs) {
        const result = evaluate(row.prereqs, character);
        for (const kind of result.unevaluated) unevaluated.add(kind);
        if (!result.satisfied) {
          unmet.push({ name, origin, reason: result.failures.join("; ") });
        }
      }
      visit(row.children, origin);
    }
  };

  visit(traits, "trait");
  visit(carried, "equipment");
  // Skill rows carry them too — Computer Hacking wants Computer Programming.
  visit(skillRows, "skill");

  return { unmet, unevaluated: [...unevaluated] };
}
